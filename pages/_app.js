import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const init = async () => {
      try {
        // Signal to Farcaster that app is ready
        await sdk.actions.ready();
        console.log("Miniapp is ready ✅");
      } catch (err) {
        console.error("Farcaster SDK error:", err);
      }
    };

    init();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
