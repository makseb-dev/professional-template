import { useEffect, useState } from 'react';

export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  );

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return mobile;
}
