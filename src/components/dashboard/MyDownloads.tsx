import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, BookOpen, Clock, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface DigitalPurchase {
  id: string;
  access_token: string;
  download_count: number;
  max_downloads: number;
  download_expires_at: string | null;
  created_at: string;
  media_content: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    content_data: any;
  };
}

export const MyDownloads = () => {
  const [downloads, setDownloads] = useState<DigitalPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('deliver-digital-product', {
        body: { 
          action: 'get_user_downloads',
          userId: user.id,
          customerEmail: user.email
        }
      });

      if (error) throw error;
      setDownloads(data.downloads || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast.error('Failed to load your downloads');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchase: DigitalPurchase) => {
    setDownloadingId(purchase.id);
    try {
      const { data, error } = await supabase.functions.invoke('deliver-digital-product', {
        body: {
          action: 'get_download_url',
          accessToken: purchase.access_token
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Open download URL in new tab
      window.open(data.download_url, '_blank');
      toast.success(`Downloading ${data.product_title}`);
      
      // Refresh to update download count
      await fetchDownloads();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to generate download link');
    } finally {
      setDownloadingId(null);
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isDownloadLimitReached = (purchase: DigitalPurchase) => {
    return purchase.download_count >= purchase.max_downloads;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Downloads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          My Downloads
        </CardTitle>
        <CardDescription>
          Access your purchased digital books and resources
        </CardDescription>
      </CardHeader>
      <CardContent>
        {downloads.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No digital purchases yet</h3>
            <p className="mt-2 text-muted-foreground">
              Purchase digital books from our shop to access them here
            </p>
            <Button className="mt-4" onClick={() => window.location.href = '/shop'}>
              Browse Shop
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {downloads.map((purchase) => {
              const expired = isExpired(purchase.download_expires_at);
              const limitReached = isDownloadLimitReached(purchase);
              const canDownload = !expired && !limitReached;

              return (
                <div
                  key={purchase.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {purchase.media_content?.image_url ? (
                    <img
                      src={purchase.media_content.image_url}
                      alt={purchase.media_content.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-muted rounded flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">
                      {purchase.media_content?.title || 'Digital Product'}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {purchase.media_content?.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        {purchase.max_downloads - purchase.download_count} downloads left
                      </Badge>
                      
                      {purchase.download_expires_at && (
                        <Badge 
                          variant={expired ? "destructive" : "outline"} 
                          className="text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          {expired 
                            ? 'Expired' 
                            : `Expires ${format(new Date(purchase.download_expires_at), 'MMM dd, yyyy')}`
                          }
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {canDownload ? (
                      <Button
                        onClick={() => handleDownload(purchase)}
                        disabled={downloadingId === purchase.id}
                      >
                        {downloadingId === purchase.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {expired ? 'Expired' : 'Limit Reached'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
