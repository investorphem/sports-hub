// pages/_document.js
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  render() {
    // The miniapp embed JSON (stringified) — edit imageUrl, splashImageUrl, and url as needed
    const miniappMeta = {
      version: "1",
      imageUrl: "https://sports-hub-three.vercel.app/preview.png",
      button: {
        title: "Launch SportsHub",
        action: {
          type: "launch_miniapp",
          url: "https://sports-hub-three.vercel.app/",
          name: "SportsHub",
          splashImageUrl: "https://sports-hub-three.vercel.app/splash.png",
          splashBackgroundColor: "#0f172a"
        }
      }
    };

    return (
      <Html>
        <Head>
          {/* Farcaster embed meta tags */}
          <meta name="fc:miniapp" content={JSON.stringify(miniappMeta)} />
          <meta name="fc:frame" content={JSON.stringify(miniappMeta)} />
          {/* Basic mobile meta */}
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
