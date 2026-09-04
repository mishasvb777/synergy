import { useEffect, useState } from 'react';
import { Box, Skeleton } from '@mui/material';
import { getToken } from '../api/client';

type Props = {
  src: string;
  alt?: string;
  height?: number | { xs?: number; md?: number };
  borderRadius?: number;
};

/** Loads protected /api/.../image with Authorization header. */
export function AuthedImage({ src, alt = '', height = 220, borderRadius = 3 }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;

    async function load() {
      setFailed(false);
      setObjectUrl(null);
      try {
        const token = getToken();
        const res = await fetch(src, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          cache: 'no-store',
        });
        if (!res.ok) throw new Error('image load failed');
        const blob = await res.blob();
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        revoked = url;
        setObjectUrl(url);
      } catch {
        if (!cancelled) setFailed(true);
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [src]);

  if (failed) return null;
  if (!objectUrl) {
    return <Skeleton variant="rectangular" sx={{ width: '100%', height, borderRadius }} />;
  }

  return (
    <Box
      component="img"
      src={objectUrl}
      alt={alt}
      sx={{
        width: '100%',
        height,
        objectFit: 'cover',
        display: 'block',
        borderRadius,
        bgcolor: '#D9E8FF',
      }}
    />
  );
}
