import Papa from 'papaparse';
import { supabase } from '@/integrations/supabase/client';
import { ImportRecord, validateImportRecord, findDuplicates, normalizePhone } from './duplicateDetection';

export interface ImportResult {
  batchId: string;
  totalRecords: number;
  successful: number;
  duplicates: number;
  failed: number;
  errors: string[];
}

export interface ProcessedRecord {
  rowNumber: number;
  data: ImportRecord;
  status: 'pending' | 'success' | 'duplicate' | 'failed';
  duplicateMatches?: any[];
  errorMessage?: string;
  memberId?: string;
}

/**
 * Parse CSV file
 */
export async function parseCSV(file: File): Promise<ImportRecord[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
        } else {
          resolve(results.data as ImportRecord[]);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * Fetch existing members and profiles for duplicate checking
 */
export async function fetchExistingData() {
  const [membersResult, profilesResult] = await Promise.all([
    supabase.from('members').select('id, first_name, last_name, email, phone, user_id'),
    supabase
      .from('profiles')
      .select('user_id, first_name, last_name, phone')
      .not('user_id', 'in', `(SELECT user_id FROM members WHERE user_id IS NOT NULL)`)
  ]);
  
  if (membersResult.error) throw membersResult.error;
  if (profilesResult.error) throw profilesResult.error;
  
  return {
    members: membersResult.data || [],
    profiles: profilesResult.data || []
  };
}

/**
 * Process records for duplicate detection
 */
export async function processRecordsForDuplicates(
  records: ImportRecord[]
): Promise<ProcessedRecord[]> {
  const { members, profiles } = await fetchExistingData();
  const processed: ProcessedRecord[] = [];
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNumber = i + 2; // +2 for header row and 1-based indexing
    
    // Validate record
    const validation = validateImportRecord(record, rowNumber);
    if (!validation.isValid) {
      processed.push({
        rowNumber,
        data: record,
        status: 'failed',
        errorMessage: validation.errors.join('; ')
      });
      continue;
    }
    
    // Check for duplicates
    const duplicateMatches = findDuplicates(record, members, profiles);
    
    if (duplicateMatches.length > 0 && duplicateMatches[0].confidence >= 95) {
      // High confidence duplicate
      processed.push({
        rowNumber,
        data: record,
        status: 'duplicate',
        duplicateMatches,
        errorMessage: `High confidence match found: ${duplicateMatches[0].matchReasons.join(', ')}`
      });
    } else if (duplicateMatches.length > 0 && duplicateMatches[0].confidence >= 70) {
      // Possible duplicate - needs review
      processed.push({
        rowNumber,
        data: record,
        status: 'pending',
        duplicateMatches
      });
    } else {
      // No duplicates - safe to import
      processed.push({
        rowNumber,
        data: record,
        status: 'pending',
        duplicateMatches: []
      });
    }
  }
  
  return processed;
}

/**
 * Import members in batches
 */
export async function importMembers(
  records: ProcessedRecord[],
  fileName: string,
  skipDuplicates: boolean = true
): Promise<ImportResult> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');
  
  // Create import batch
  const { data: batch, error: batchError } = await supabase
    .from('member_import_batches')
    .insert({
      imported_by: userData.user.id,
      file_name: fileName,
      total_records: records.length,
      successful: 0,
      duplicates: 0,
      failed: 0
    })
    .select()
    .single();
  
  if (batchError || !batch) {
    throw new Error(`Failed to create import batch: ${batchError?.message}`);
  }
  
  let successful = 0;
  let duplicates = 0;
  let failed = 0;
  const errors: string[] = [];
  
  // Process records in batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batchRecords = records.slice(i, i + BATCH_SIZE);
    
    for (const record of batchRecords) {
      try {
        // Skip if already marked as failed
        if (record.status === 'failed') {
          failed++;
          await logImportRecord(batch.id, record, 'failed', record.errorMessage);
          errors.push(record.errorMessage || `Row ${record.rowNumber}: Unknown error`);
          continue;
        }
        
        // Skip high-confidence duplicates if configured
        if (skipDuplicates && record.status === 'duplicate') {
          duplicates++;
          await logImportRecord(batch.id, record, 'duplicate', record.errorMessage);
          continue;
        }
        
        // Determine how to import based on matches
        if (record.duplicateMatches && record.duplicateMatches.length > 0) {
          const topMatch = record.duplicateMatches[0];
          
          if (topMatch.type === 'profile' && topMatch.confidence >= 90) {
            // Link to existing user profile
            const { data: newMember, error: insertError } = await supabase
              .from('members')
              .insert({
                user_id: topMatch.id,
                first_name: record.data.first_name,
                last_name: record.data.last_name,
                email: record.data.email || null,
                phone: record.data.phone || null,
                address: record.data.address || null,
                status: record.data.status || 'active',
                date_joined: record.data.date_joined || new Date().toISOString().split('T')[0],
                source: 'conversion',
                imported_at: new Date().toISOString(),
                import_batch_id: batch.id
              })
              .select()
              .single();
            
            if (insertError) {
              throw insertError;
            }
            
            successful++;
            await logImportRecord(batch.id, record, 'success', `Linked to existing user`, newMember.id);
          } else if (topMatch.type === 'member') {
            // Already a member - skip
            duplicates++;
            await logImportRecord(batch.id, record, 'duplicate', 'Already exists as member');
          } else {
            // Uncertain match - import as new
            await importNewMember(record, batch.id);
            successful++;
          }
        } else {
          // No matches - import as new
          await importNewMember(record, batch.id);
          successful++;
        }
      } catch (error: any) {
        failed++;
        const errorMsg = `Row ${record.rowNumber}: ${error.message}`;
        errors.push(errorMsg);
        await logImportRecord(batch.id, record, 'failed', errorMsg);
      }
    }
  }
  
  // Update batch statistics
  await supabase
    .from('member_import_batches')
    .update({
      successful,
      duplicates,
      failed
    })
    .eq('id', batch.id);
  
  return {
    batchId: batch.id,
    totalRecords: records.length,
    successful,
    duplicates,
    failed,
    errors
  };
}

/**
 * Import a new member record
 */
async function importNewMember(record: ProcessedRecord, batchId: string) {
  const { data: newMember, error: insertError } = await supabase
    .from('members')
    .insert({
      first_name: record.data.first_name,
      last_name: record.data.last_name,
      email: record.data.email || null,
      phone: record.data.phone || null,
      address: record.data.address || null,
      status: record.data.status || 'active',
      date_joined: record.data.date_joined || new Date().toISOString().split('T')[0],
      source: 'import',
      imported_at: new Date().toISOString(),
      import_batch_id: batchId
    })
    .select()
    .single();
  
  if (insertError) throw insertError;
  
  await logImportRecord(batchId, record, 'success', undefined, newMember.id);
}

/**
 * Log individual import record
 */
async function logImportRecord(
  batchId: string,
  record: ProcessedRecord,
  status: 'success' | 'duplicate' | 'failed' | 'skipped',
  errorMessage?: string,
  memberId?: string
) {
  await supabase.from('member_import_logs').insert({
    batch_id: batchId,
    row_number: record.rowNumber,
    status,
    data: record.data,
    error_message: errorMessage,
    member_id: memberId
  });
}

/**
 * Generate CSV template
 */
export function generateCSVTemplate(): string {
  const headers = [
    'first_name',
    'last_name',
    'email',
    'phone',
    'address',
    'county',
    'date_joined',
    'status'
  ];
  
  const sampleData = [
    ['John', 'Doe', 'john.doe@example.com', '+254701234567', '123 Main St, Nairobi', 'Nairobi', '2023-01-15', 'active'],
    ['Jane', 'Smith', 'jane.smith@example.com', '0712345678', '456 Oak Ave, Mombasa', 'Mombasa', '2023-02-20', 'active']
  ];
  
  return Papa.unparse({
    fields: headers,
    data: sampleData
  });
}

/**
 * Download CSV template
 */
export function downloadCSVTemplate() {
  const csv = generateCSVTemplate();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'member_import_template.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
