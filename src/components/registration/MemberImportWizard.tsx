import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUp, Download, AlertTriangle, CheckCircle2, XCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { parseCSV, processRecordsForDuplicates, importMembers, downloadCSVTemplate, ProcessedRecord } from "@/utils/memberImport";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MemberImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

type Step = 'upload' | 'preview' | 'duplicates' | 'importing' | 'results';

export const MemberImportWizard = ({ open, onOpenChange, onImportComplete }: MemberImportWizardProps) => {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [processedRecords, setProcessedRecords] = useState<ProcessedRecord[]>([]);
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      toast.info('Parsing CSV file...');
      const records = await parseCSV(file);
      
      if (records.length === 0) {
        toast.error('CSV file is empty');
        setLoading(false);
        return;
      }

      toast.info('Checking for duplicates...');
      const processed = await processRecordsForDuplicates(records);
      setProcessedRecords(processed);
      setStep('preview');
      toast.success(`Processed ${records.length} records`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (processedRecords.length === 0) return;

    setLoading(true);
    setStep('importing');
    
    try {
      const result = await importMembers(processedRecords, file?.name || 'import.csv', true);
      setImportResult(result);
      setStep('results');
      
      if (result.successful > 0) {
        toast.success(`Successfully imported ${result.successful} members`);
      }
      
      if (result.errors.length > 0) {
        toast.error(`${result.failed} records failed to import`);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import members');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setProcessedRecords([]);
    setImportResult(null);
    onOpenChange(false);
    if (importResult && importResult.successful > 0) {
      onImportComplete();
    }
  };

  const stats = processedRecords.reduce(
    (acc, record) => {
      if (record.status === 'duplicate') acc.duplicates++;
      else if (record.status === 'failed') acc.failed++;
      else if (record.duplicateMatches && record.duplicateMatches.length > 0) acc.needsReview++;
      else acc.ready++;
      return acc;
    },
    { ready: 0, needsReview: 0, duplicates: 0, failed: 0 }
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Members</DialogTitle>
          <DialogDescription>
            Import multiple members from a CSV file
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {step === 'upload' && (
            <div className="space-y-6">
              <Alert>
                <Download className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>Download the CSV template to get started</span>
                    <Button variant="outline" size="sm" onClick={downloadCSVTemplate}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Template
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="border-2 border-dashed rounded-lg p-12 text-center">
                <FileUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select a CSV file containing member information
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Select File
                    </span>
                  </Button>
                </label>
                {file && (
                  <p className="text-sm mt-4 text-foreground">
                    Selected: <strong>{file.name}</strong>
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!file || loading}>
                  {loading ? 'Processing...' : 'Next'}
                </Button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <>
              <div className="space-y-4 px-1">
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.ready}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Ready to Import</div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.needsReview}</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">Needs Review</div>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.duplicates}</div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Duplicates (Skip)</div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Validation Errors</div>
                  </div>
                </div>

                <ScrollArea className="h-[250px] border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedRecords.map((record, index) => (
                        <TableRow key={index}>
                          <TableCell>{record.rowNumber}</TableCell>
                          <TableCell>
                            {record.data.first_name} {record.data.last_name}
                          </TableCell>
                          <TableCell>{record.data.phone}</TableCell>
                          <TableCell>
                            {record.status === 'duplicate' && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Duplicate
                              </Badge>
                            )}
                            {record.status === 'failed' && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Error
                              </Badge>
                            )}
                            {record.status === 'pending' && record.duplicateMatches && record.duplicateMatches.length > 0 && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Review
                              </Badge>
                            )}
                            {record.status === 'pending' && (!record.duplicateMatches || record.duplicateMatches.length === 0) && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Ready
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {record.errorMessage || 
                             (record.duplicateMatches && record.duplicateMatches.length > 0 
                               ? `${record.duplicateMatches[0].confidence}% match: ${record.duplicateMatches[0].matchReasons[0]}`
                               : 'No issues')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <Alert>
                  <AlertDescription>
                    Duplicates will be automatically skipped. Records with potential matches will be imported as new members.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="flex justify-between items-center gap-2 pt-4 px-1 border-t mt-4">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Back
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={stats.ready === 0}
                  size="lg"
                  className="gap-2"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Import {stats.ready} Ready Records
                </Button>
              </div>
            </>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <h3 className="text-lg font-semibold">Importing Members...</h3>
              <p className="text-sm text-muted-foreground">Please wait while we process the records</p>
            </div>
          )}

          {step === 'results' && importResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{importResult.successful}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Successful</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950 p-6 rounded-lg text-center">
                  <XCircle className="h-8 w-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{importResult.duplicates}</div>
                  <div className="text-sm text-orange-700 dark:text-orange-300">Duplicates Skipped</div>
                </div>
                <div className="bg-red-50 dark:bg-red-950 p-6 rounded-lg text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">{importResult.failed}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Failed</div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Errors encountered:</div>
                    <ScrollArea className="h-32">
                      <ul className="text-sm space-y-1">
                        {importResult.errors.slice(0, 10).map((error: string, index: number) => (
                          <li key={index}>{error}</li>
                        ))}
                        {importResult.errors.length > 10 && (
                          <li>... and {importResult.errors.length - 10} more</li>
                        )}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
