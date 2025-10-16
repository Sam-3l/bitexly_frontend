import { useRef, useEffect } from "react";

export default function IframeWithFallback({ src, fallbackUrl }) {
  const loadedRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    loadedRef.current = false;

    // Fallback redirect if iframe can't load due to CSP or similar
    timeoutRef.current = setTimeout(() => {
      if (!loadedRef.current) {
        console.warn("Iframe load timeout — redirecting to provider URL");
        window.location.href = fallbackUrl;
      }
    }, 2500); // adjust if needed

    return () => clearTimeout(timeoutRef.current);
  }, [src, fallbackUrl]);

  return (
    <iframe
      src={src}
      title="Meld Widget"
      className="w-full h-full rounded-2xl border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      onLoad={() => {
        loadedRef.current = true;
        clearTimeout(timeoutRef.current);
      }}
      onError={() => {
        console.warn("Iframe onError — redirecting to provider URL");
        window.location.href = fallbackUrl;
      }}
    />
  );
}