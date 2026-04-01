import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Loader2, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

interface EbookReaderProps {
  accessToken: string;
  productId: string;
  title: string;
  onClose: () => void;
}

export const EbookReader = ({ accessToken, productId, title, onClose }: EbookReaderProps) => {
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Save reading progress
  const saveProgress = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('reading_progress')
        .upsert({
          user_id: user.id,
          product_id: productId,
          last_read_at: new Date().toISOString(),
        }, { onConflict: 'user_id,product_id' });
    } catch (err) {
      console.error('Failed to save reading progress:', err);
    }
  }, [productId]);

  // Load the PDF
  useEffect(() => {
    const loadPdf = async () => {
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
              action: 'read_file',
              accessToken,
            }),
          }
        );

        const contentType = response.headers.get('Content-Type');

        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load book');
          return;
        }

        if (!response.ok) {
          setError('Failed to load book');
          return;
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);

        // Save progress on open
        saveProgress();
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    loadPdf();

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [accessToken]);

  // Save progress periodically
  useEffect(() => {
    const interval = setInterval(saveProgress, 30000); // every 30s
    return () => clearInterval(interval);
  }, [saveProgress]);

  // Save on close
  const handleClose = () => {
    saveProgress();
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    onClose();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-background flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
          <h2 className="font-semibold truncate text-sm sm:text-base">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs hidden sm:flex">
            Reading Mode
          </Badge>
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your book...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={handleClose}>
              Go Back
            </Button>
          </div>
        )}

        {pdfUrl && !loading && !error && (
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0"
            title={title}
          />
        )}
      </div>
    </div>
  );
};
