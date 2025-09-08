import "../styles/globals.css";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";  // <-- now correct import

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Hide splash screen in Warpcast
    sdk.actions.ready();
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;
