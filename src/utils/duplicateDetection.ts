import levenshtein from 'fast-levenshtein';

export interface DuplicateMatch {
  id: string;
  type: 'member' | 'profile';
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  confidence: number;
  matchReasons: string[];
}

export interface ImportRecord {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  county?: string;
  date_joined?: string;
  status?: string;
  [key: string]: any;
}

/**
 * Normalize phone number to standard format
 * Converts +254XXXXXXXXX or 07XXXXXXXX to 07XXXXXXXX
 */
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  let normalized = phone.trim()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/-/g, '')    // Remove dashes
    .replace(/\(/g, '')   // Remove parentheses
    .replace(/\)/g, '');
  
  // Convert +254 to 0
  if (normalized.startsWith('+254')) {
    normalized = '0' + normalized.substring(4);
  } else if (normalized.startsWith('254')) {
    normalized = '0' + normalized.substring(3);
  }
  
  return normalized.toLowerCase();
}

/**
 * Normalize name for comparison
 * Lowercase, trim, remove extra spaces
 */
export function normalizeName(name: string | null | undefined): string {
  if (!name) return '';
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Calculate string similarity using Levenshtein distance
 * Returns a percentage (0-100)
 */
export function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const normalized1 = normalizeName(str1);
  const normalized2 = normalizeName(str2);
  
  if (normalized1 === normalized2) return 100;
  
  const maxLength = Math.max(normalized1.length, normalized2.length);
  if (maxLength === 0) return 100;
  
  const distance = levenshtein.get(normalized1, normalized2);
  return Math.round((1 - distance / maxLength) * 100);
}

/**
 * Calculate name similarity for full names
 */
export function calculateNameSimilarity(
  firstName1: string,
  lastName1: string,
  firstName2: string,
  lastName2: string
): { score: number; details: string[] } {
  const details: string[] = [];
  
  const firstNameSim = calculateStringSimilarity(firstName1, firstName2);
  const lastNameSim = calculateStringSimilarity(lastName1, lastName2);
  
  // Check exact matches
  if (normalizeName(firstName1) === normalizeName(firstName2) && 
      normalizeName(lastName1) === normalizeName(lastName2)) {
    details.push('Exact name match');
    return { score: 95, details };
  }
  
  // Check if names are very similar (both > 85%)
  if (firstNameSim >= 85 && lastNameSim >= 85) {
    details.push(`Similar names (${firstNameSim}% first, ${lastNameSim}% last)`);
    return { score: Math.round((firstNameSim + lastNameSim) / 2), details };
  }
  
  // Check if one part matches exactly
  if (normalizeName(firstName1) === normalizeName(firstName2)) {
    details.push('Exact first name match');
    return { score: 70 + (lastNameSim / 4), details };
  }
  
  if (normalizeName(lastName1) === normalizeName(lastName2)) {
    details.push('Exact last name match');
    return { score: 70 + (firstNameSim / 4), details };
  }
  
  // Average similarity
  const avgScore = (firstNameSim + lastNameSim) / 2;
  if (avgScore >= 60) {
    details.push(`Moderate similarity (${Math.round(avgScore)}%)`);
  }
  
  return { score: Math.round(avgScore), details };
}

/**
 * Find potential duplicates for an import record
 */
export function findDuplicates(
  record: ImportRecord,
  existingMembers: any[],
  existingProfiles: any[]
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const normalizedPhone = normalizePhone(record.phone);
  const normalizedEmail = record.email?.toLowerCase().trim();
  
  // Check existing members
  for (const member of existingMembers) {
    const matchReasons: string[] = [];
    let confidence = 0;
    
    // Phone match (highest priority)
    if (normalizedPhone && normalizePhone(member.phone) === normalizedPhone) {
      matchReasons.push('Exact phone match');
      confidence = 100;
    }
    
    // Email match
    if (!confidence && normalizedEmail && member.email?.toLowerCase().trim() === normalizedEmail) {
      matchReasons.push('Exact email match');
      confidence = 95;
    }
    
    // Name similarity
    if (!confidence || confidence < 95) {
      const nameSim = calculateNameSimilarity(
        record.first_name,
        record.last_name,
        member.first_name,
        member.last_name
      );
      
      if (nameSim.score >= 85) {
        matchReasons.push(...nameSim.details);
        confidence = Math.max(confidence, nameSim.score);
      }
    }
    
    // Add to matches if confidence is high enough
    if (confidence >= 70) {
      matches.push({
        id: member.id,
        type: 'member',
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        confidence,
        matchReasons
      });
    }
  }
  
  // Check existing profiles (registered users without member records)
  for (const profile of existingProfiles) {
    const matchReasons: string[] = [];
    let confidence = 0;
    
    // Phone match
    if (normalizedPhone && normalizePhone(profile.phone) === normalizedPhone) {
      matchReasons.push('Exact phone match');
      confidence = 100;
    }
    
    // Name similarity
    if (!confidence || confidence < 95) {
      const nameSim = calculateNameSimilarity(
        record.first_name,
        record.last_name,
        profile.first_name,
        profile.last_name
      );
      
      if (nameSim.score >= 85) {
        matchReasons.push(...nameSim.details);
        confidence = Math.max(confidence, nameSim.score);
      }
    }
    
    // Add to matches if confidence is high enough
    if (confidence >= 70) {
      matches.push({
        id: profile.user_id,
        type: 'profile',
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        confidence,
        matchReasons
      });
    }
  }
  
  // Sort by confidence (highest first)
  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Validate import record
 */
export function validateImportRecord(record: ImportRecord, rowNumber: number): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Required fields
  if (!record.first_name?.trim()) {
    errors.push(`Row ${rowNumber}: First name is required`);
  }
  
  if (!record.last_name?.trim()) {
    errors.push(`Row ${rowNumber}: Last name is required`);
  }
  
  // Phone validation (if provided)
  if (record.phone) {
    const normalized = normalizePhone(record.phone);
    if (normalized && !/^0[17]\d{8}$/.test(normalized)) {
      errors.push(`Row ${rowNumber}: Invalid phone format. Use +254XXXXXXXXX or 07XXXXXXXX`);
    }
  }
  
  // Email validation (if provided)
  if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
    errors.push(`Row ${rowNumber}: Invalid email format`);
  }
  
  // Status validation (if provided)
  if (record.status && !['active', 'inactive', 'visitor'].includes(record.status.toLowerCase())) {
    errors.push(`Row ${rowNumber}: Status must be 'active', 'inactive', or 'visitor'`);
  }
  
  // Date validation (if provided)
  if (record.date_joined) {
    const date = new Date(record.date_joined);
    if (isNaN(date.getTime())) {
      errors.push(`Row ${rowNumber}: Invalid date format for date_joined. Use YYYY-MM-DD`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
