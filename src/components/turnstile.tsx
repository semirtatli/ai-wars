'use client';

import { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  siteKey: string;
  onVerify: (token: string) => void;
}

/**
 * Cloudflare Turnstile CAPTCHA widget.
 * Loads the Turnstile script dynamically and renders the challenge.
 * In development without a site key, renders a mock token generator.
 */
export function TurnstileWidget({ siteKey, onVerify }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Development fallback
    if (!siteKey || siteKey === 'test') {
      onVerify('dev-token');
      return;
    }

    // Load Turnstile script if not present
    if (!document.getElementById('cf-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cf-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = renderWidget;
    } else if (window.turnstile) {
      renderWidget();
    }

    function renderWidget() {
      if (!containerRef.current || !window.turnstile) return;

      // Clean up existing widget
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        theme: 'dark',
        size: 'flexible',
      });
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [siteKey, onVerify]);

  // Development mode: no widget needed
  if (!siteKey || siteKey === 'test') {
    return (
      <div className="rounded-lg border border-dashed border-zinc-700 p-3 text-center text-xs text-zinc-500">
        Turnstile disabled (development mode)
      </div>
    );
  }

  return <div ref={containerRef} className="flex justify-center" />;
}

// Extend window for Turnstile types
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          theme?: string;
          size?: string;
        },
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}
