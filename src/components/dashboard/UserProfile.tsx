import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Key, CreditCard, Mail, Phone, MapPin, Briefcase, QrCode, Download, Printer } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";

export const UserProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [memberNumber, setMemberNumber] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  
  // Profile state
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    county: "",
    occupation: "",
  });

  // Password state
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchMemberNumber();
    }
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          address: data.address || "",
          county: data.county || "",
          occupation: data.occupation || "",
        });
        setQrCodeData(data.qr_code_data || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error("Failed to load profile");
    }
  };

  const fetchMemberNumber = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('members')
        .select('member_number')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setMemberNumber(data.member_number);
      }
    } catch (error) {
      console.error('Error fetching member number:', error);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          address: profile.address,
          county: profile.county,
          occupation: profile.occupation,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });

      if (error) throw error;

      toast.success("Password changed successfully!");
      setPasswords({ newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    const qrElement = document.getElementById('qr-code-container');
    if (!qrElement) return;

    try {
      // Wait a bit to ensure QR code is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(qrElement, {
        backgroundColor: '#ffffff',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: true,
      });
      
      const link = document.createElement('a');
      link.download = `qr-code-${memberNumber || 'member'}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast.success("QR code downloaded successfully!");
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error("Failed to download QR code");
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    if (!printWindow) return;

    const qrContainer = document.getElementById('qr-code-container');
    if (!qrContainer) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${profile.first_name} ${profile.last_name}</title>
          <style>
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .print-container { 
              text-align: center; 
              padding: 40px;
              border: 2px solid #000;
            }
            h2 { margin: 0 0 10px 0; }
            p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${qrContainer.innerHTML}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Member Number Card */}
      {memberNumber && (
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Member Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Member Number</p>
                <p className="text-2xl font-bold font-mono tracking-wider">{memberNumber}</p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">Active Member</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="qr-code" className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            My QR Code
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={profile.first_name}
                    onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={profile.last_name}
                    onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    value={profile.county}
                    onChange={(e) => setProfile({ ...profile, county: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Occupation
                  </Label>
                  <Input
                    id="occupation"
                    value={profile.occupation}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <Button onClick={handleProfileUpdate} disabled={loading}>
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr-code">
          <Card>
            <CardHeader>
              <CardTitle>Your Attendance QR Code</CardTitle>
              <CardDescription>
                Show this QR code at the church entrance for quick attendance marking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {qrCodeData ? (
                <>
                  <div id="qr-code-container" className="bg-white p-8 rounded-lg border-2 border-primary/20 text-center">
                    <div className="mb-4">
                      <QRCode
                        value={qrCodeData}
                        size={256}
                        level="H"
                        className="mx-auto"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-gray-900">
                        {profile.first_name} {profile.last_name}
                      </p>
                      {memberNumber && (
                        <p className="text-lg font-mono text-gray-700">
                          {memberNumber}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">Church Member</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={downloadQRCode} className="flex-1 flex items-center justify-center gap-2">
                      <Download className="h-4 w-4" />
                      Download QR Code
                    </Button>
                    <Button onClick={printQRCode} variant="outline" className="flex-1 flex items-center justify-center gap-2">
                      <Printer className="h-4 w-4" />
                      Print QR Code
                    </Button>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>How to use:</strong>
                    </p>
                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 space-y-1">
                      <li>Save this QR code to your phone or print it</li>
                      <li>Show it at the church entrance when you arrive</li>
                      <li>The registration team will scan it to mark your attendance</li>
                      <li>You can download or print multiple copies</li>
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    QR code not available. Please contact the registration department.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Password requirements:
                </p>
                <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 space-y-1">
                  <li>At least 6 characters long</li>
                  <li>Include a mix of letters and numbers</li>
                </ul>
              </div>

              <Separator />

              <Button onClick={handlePasswordChange} disabled={loading}>
                {loading ? "Changing Password..." : "Change Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
