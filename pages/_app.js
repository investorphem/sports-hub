// pages/_app.js
import "../styles/globals.css";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Ensure we run only in browser
    if (typeof window !== "undefined" && sdk?.actions?.ready) {
      try {
        sdk.actions.ready();
      } catch (e) {
        console.warn("sdk.actions.ready() failed:", e);
      }
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
