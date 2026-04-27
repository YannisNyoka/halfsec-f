import { useState, useEffect } from 'react';

const YOCO_SDK_URL = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js';

const useYoco = (publicKey) => {
  const [yoco, setYoco] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    if (!publicKey) return;

    // Check if already loaded
    if (window.YocoSDK) {
      setYoco(new window.YocoSDK({ publicKey }));
      setSdkReady(true);
      return;
    }

    // Load Yoco SDK script
    const script = document.createElement('script');
    script.src = YOCO_SDK_URL;
    script.async = true;
    script.onload = () => {
      if (window.YocoSDK) {
        setYoco(new window.YocoSDK({ publicKey }));
        setSdkReady(true);
      }
    };
    script.onerror = () => console.error('Failed to load Yoco SDK');
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existing = document.querySelector(`script[src="${YOCO_SDK_URL}"]`);
      if (existing) document.body.removeChild(existing);
    };
  }, [publicKey]);

  return { yoco, sdkReady };
};

export default useYoco;