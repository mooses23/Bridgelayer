import React, { useState, useRef, useEffect, CSSProperties } from 'react';

interface IframeManagerProps {
  src: string;
  title?: string;
  sandbox?: string;
  style?: CSSProperties;
  className?: string;
  onMessage?: (event: MessageEvent) => void;
  onNavigate?: (url: string) => void;
}

const DEFAULT_SANDBOX = 'allow-scripts allow-same-origin';

export default function IframeManager({
  src,
  title = 'Embedded Content',
  sandbox = DEFAULT_SANDBOX,
  style,
  className = '',
  onMessage,
  onNavigate,
}: IframeManagerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleMessageEvent(event: MessageEvent) {
      if (event.origin !== new URL(src).origin) return;
      if (onMessage) onMessage(event);
      // handle navigation messages
      if (onNavigate && event.data?.type === 'navigate' && typeof event.data.url === 'string') {
        onNavigate(event.data.url);
      }
    }
    window.addEventListener('message', handleMessageEvent);
    return () => window.removeEventListener('message', handleMessageEvent);
  }, [src, onMessage, onNavigate]);

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setLoading(false);
    setError('Failed to load content.');
  };

  return (
    <div className={`iframe-container ${className}`} style={style}>
      {loading && !error && (
        <div className="iframe-loading">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      )}
      {error && (
        <div className="iframe-error">
          <p>{error}</p>
          <button onClick={() => {
            setLoading(true);
            setError(null);
            if (iframeRef.current) {
              iframeRef.current.src = iframeRef.current.src;
            }
          }}>
            Retry
          </button>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        sandbox={sandbox}
        className="iframe-responsive"
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}
