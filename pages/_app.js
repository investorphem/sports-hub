import "../styles/globals.css";
import { useEffect } from "react";
import { sdk } from "@farcaster/mini-apps-sdk";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Tell Warpcast the app is ready (removes splash screen)
    sdk.actions.ready();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
