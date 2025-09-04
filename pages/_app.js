// pages/_app.js
import { useEffect } from "react";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    (async () => {
      try {
        const mod = await import("@farcaster/miniapp-sdk");
        await mod.sdk.actions.ready();  // tell host we're ready
      } catch {
        // Outside Farcaster this is a no-op
      }
    })();
  }, []);

  return <Component {...pageProps} />;
}
