import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, BookOpen, Clock, AlertCircle, Loader2, ShoppingBag, Library } from "lucide-react";
import { format } from "date-fns";
import { EmbeddedShop } from "@/components/shop/EmbeddedShop";
import { EbookReader } from "@/components/reader/EbookReader";

interface DigitalPurchase {
  id: string;
  access_token: string;
  download_count: number;
  max_downloads: number;
  download_expires_at: string | null;
  created_at: string;
  product_id: string;
  media_content: {
    id: string;
    title: string;
    description: string | null;
    image_url: string | null;
    content_data: any;
  };
}

interface ReadingProgressRecord {
  product_id: string;
  last_read_at: string;
}

export const MyDownloads = () => {
  const [downloads, setDownloads] = useState<DigitalPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [readingBook, setReadingBook] = useState<DigitalPurchase | null>(null);
  const [readingProgress, setReadingProgress] = useState<Record<string, ReadingProgressRecord>>({});

  useEffect(() => {
    fetchDownloads();
    fetchReadingProgress();
  }, []);

  const fetchReadingProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('reading_progress')
        .select('product_id, last_read_at')
        .eq('user_id', user.id);

      if (data) {
        const progressMap: Record<string, ReadingProgressRecord> = {};
        data.forEach((p: any) => {
          progressMap[p.product_id] = p;
        });
        setReadingProgress(progressMap);
      }
    } catch (error) {
      console.error('Error fetching reading progress:', error);
    }
  };

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
      toast.error('Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (purchase: DigitalPurchase) => {
    setDownloadingId(purchase.id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deliver-digital-product`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            action: 'download_file',
            accessToken: purchase.access_token
          })
        }
      );

      const contentType = response.headers.get('Content-Type');
      
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to download');
        return;
      }

      if (!response.ok) {
        toast.error('Failed to download file');
        return;
      }

      const filename = response.headers.get('X-Filename') || `${purchase.media_content?.title || 'download'}.pdf`;
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${purchase.media_content?.title || 'file'}`);
      await fetchDownloads();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRead = (purchase: DigitalPurchase) => {
    setReadingBook(purchase);
  };

  const handleCloseReader = () => {
    setReadingBook(null);
    fetchReadingProgress(); // Refresh progress after reading
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const isDownloadLimitReached = (purchase: DigitalPurchase) => {
    return purchase.download_count >= purchase.max_downloads;
  };

  // Show reader overlay
  if (readingBook) {
    return (
      <EbookReader
        accessToken={readingBook.access_token}
        productId={readingBook.product_id || readingBook.media_content?.id}
        title={readingBook.media_content?.title || 'Book'}
        onClose={handleCloseReader}
      />
    );
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Library className="h-5 w-5" />
            My Library
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

  if (showShop) {
    return <EmbeddedShop onClose={() => setShowShop(false)} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Library className="h-5 w-5" />
          My Library
        </CardTitle>
        <CardDescription>
          Read and download your purchased digital books and resources
        </CardDescription>
      </CardHeader>
      <CardContent>
        {downloads.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No digital purchases yet</h3>
            <p className="mt-2 text-muted-foreground">
              Purchase digital books from our shop to read them here
            </p>
            <Button className="mt-4" onClick={() => setShowShop(true)}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Browse Shop
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {downloads.map((purchase) => {
              const expired = isExpired(purchase.download_expires_at);
              const limitReached = isDownloadLimitReached(purchase);
              const canDownload = !expired && !limitReached;
              const hasProgress = readingProgress[purchase.product_id || purchase.media_content?.id];

              return (
                <div
                  key={purchase.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  {purchase.media_content?.image_url ? (
                    <img
                      src={purchase.media_content.image_url}
                      alt={purchase.media_content.title}
                      className="w-16 h-20 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
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
                      {hasProgress && (
                        <Badge variant="default" className="text-xs">
                          <BookOpen className="h-3 w-3 mr-1" />
                          Continue Reading
                        </Badge>
                      )}
                      
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

                    {hasProgress && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last read {format(new Date(hasProgress.last_read_at), 'MMM dd, yyyy')}
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex flex-col gap-2">
                    {/* Read button - always available if not expired */}
                    {!expired && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleRead(purchase)}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        {hasProgress ? 'Continue' : 'Read'}
                      </Button>
                    )}
                    
                    {/* Download button */}
                    {canDownload ? (
                      <Button
                        variant="outline"
                        size="sm"
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
                      <Button variant="outline" size="sm" disabled>
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
