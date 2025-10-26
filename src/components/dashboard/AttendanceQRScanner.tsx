import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, CameraOff, CheckCircle2, XCircle, User, Clock, QrCode } from "lucide-react";

interface ScannedMember {
  id: string;
  name: string;
  memberNumber: string;
  timestamp: string;
  status: 'success' | 'duplicate' | 'error';
}

interface AttendanceQRScannerProps {
  selectedDate: string;
  serviceType: string;
}

export const AttendanceQRScanner = ({ selectedDate, serviceType }: AttendanceQRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [recentScans, setRecentScans] = useState<ScannedMember[]>([]);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    if (!readerRef.current) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanError
      );

      setScanning(true);
      toast.success("Camera started successfully");
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast.error("Failed to start camera. Please check permissions.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setScanning(false);
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
  };

  const onScanSuccess = (decodedText: string) => {
    processQRCode(decodedText);
  };

  const onScanError = (error: string) => {
    // Ignore common scanning errors
  };

  const processQRCode = async (qrData: string) => {
    try {
      // Extract user ID from QR code (format: MBRC-{user_id})
      if (!qrData.startsWith('MBRC-')) {
        toast.error("Invalid QR code format");
        return;
      }

      const userId = qrData.replace('MBRC-', '');

      // Check if already scanned today
      const isDuplicate = recentScans.some(scan => 
        scan.id === userId && scan.status === 'success'
      );

      if (isDuplicate) {
        // Add to recent scans with duplicate status
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', userId)
          .single();

        const { data: memberData } = await supabase
          .from('members')
          .select('member_number')
          .eq('user_id', userId)
          .single();

        const newScan: ScannedMember = {
          id: userId,
          name: profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Unknown',
          memberNumber: memberData?.member_number || 'N/A',
          timestamp: new Date().toLocaleTimeString(),
          status: 'duplicate'
        };

        setRecentScans(prev => [newScan, ...prev.slice(0, 19)]);
        toast.warning("Member already marked present");
        return;
      }

      // Get member ID
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('id, member_number')
        .eq('user_id', userId)
        .single();

      if (memberError || !memberData) {
        toast.error("Member not found in database");
        return;
      }

      // Check if already has attendance for this service
      const { data: existingAttendance } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('member_id', memberData.id)
        .eq('service_date', selectedDate)
        .eq('service_type', serviceType)
        .maybeSingle();

      if (existingAttendance) {
        // Already marked - show as duplicate
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', userId)
          .single();

        const newScan: ScannedMember = {
          id: userId,
          name: profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Unknown',
          memberNumber: memberData.member_number || 'N/A',
          timestamp: new Date().toLocaleTimeString(),
          status: 'duplicate'
        };

        setRecentScans(prev => [newScan, ...prev.slice(0, 19)]);
        toast.warning("Already marked present for this service");
        return;
      }

      // Mark attendance
      const { error: attendanceError } = await supabase
        .from('attendance_records')
        .insert({
          member_id: memberData.id,
          service_date: selectedDate,
          service_type: serviceType,
          checked_in_at: new Date().toISOString()
        });

      if (attendanceError) throw attendanceError;

      // Get member name
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', userId)
        .single();

      // Add to recent scans
      const newScan: ScannedMember = {
        id: userId,
        name: profileData ? `${profileData.first_name} ${profileData.last_name}` : 'Unknown',
        memberNumber: memberData.member_number || 'N/A',
        timestamp: new Date().toLocaleTimeString(),
        status: 'success'
      };

      setRecentScans(prev => [newScan, ...prev.slice(0, 19)]);
      
      // Success feedback
      toast.success(`Attendance marked for ${newScan.name}`);
      
      // Play success sound (optional)
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuFzvTXi0EIGWi97+mhTw0PUKjk8Ldj');
      audio.play().catch(() => {});

    } catch (error) {
      console.error('Error processing QR code:', error);
      
      const errorScan: ScannedMember = {
        id: qrData,
        name: 'Error',
        memberNumber: 'N/A',
        timestamp: new Date().toLocaleTimeString(),
        status: 'error'
      };
      
      setRecentScans(prev => [errorScan, ...prev.slice(0, 19)]);
      toast.error("Failed to mark attendance");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      processQRCode(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Scan member QR codes for instant attendance marking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scanner Area */}
          <div className="space-y-4">
            <div 
              id="qr-reader" 
              ref={readerRef}
              className="w-full max-w-md mx-auto rounded-lg overflow-hidden border-2 border-primary/20"
              style={{ minHeight: scanning ? '300px' : '0px' }}
            />
            
            <div className="flex gap-4 justify-center">
              {!scanning ? (
                <Button onClick={startScanning} size="lg" className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="destructive" size="lg" className="flex items-center gap-2">
                  <CameraOff className="h-5 w-5" />
                  Stop Camera
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Manual Entry */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <Label htmlFor="manual-code">Manual QR Code Entry</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="manual-code"
                  placeholder="Enter QR code manually (MBRC-...)"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                />
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Scans
          </CardTitle>
          <CardDescription>
            Last 20 scanned members for this session
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No scans yet. Start scanning to see recent members.
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentScans.map((scan, index) => (
                <div
                  key={`${scan.id}-${index}`}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    scan.status === 'success' ? 'bg-green-50 border-green-200' :
                    scan.status === 'duplicate' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {scan.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : scan.status === 'duplicate' ? (
                      <XCircle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{scan.name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs font-mono">
                          {scan.memberNumber}
                        </Badge>
                        <span>•</span>
                        <span>{scan.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      scan.status === 'success' ? 'default' :
                      scan.status === 'duplicate' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {scan.status === 'success' ? 'Marked' :
                     scan.status === 'duplicate' ? 'Duplicate' :
                     'Error'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
