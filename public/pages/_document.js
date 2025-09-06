// pages/_document.js

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Farcaster Miniapp Embed */}
        <meta
          name="fc:miniapp"
          content='{
            "version":"1",
            "imageUrl":"https://sports-hub-three.vercel.app/embed.png",
            "button":{
              "title":"⚽ Start Betting",
              "action":{
                "type":"launch_miniapp",
                "name":"SportsHub",
                "url":"https://sports-hub-three.vercel.app",
                "splashImageUrl":"https://sports-hub-three.vercel.app/splash.png",
                "splashBackgroundColor":"#0A1A2B"
              }
            }
          }'
        />
        {/* Backward compatibility */}
        <meta
          name="fc:frame"
          content='{
            "version":"1",
            "imageUrl":"https://sports-hub-three.vercel.app/embed.png",
            "button":{
              "title":"⚽ Start Betting",
              "action":{
                "type":"launch_frame",
                "name":"SportsHub",
                "url":"https://sports-hub-three.vercel.app",
                "splashImageUrl":"https://sports-hub-three.vercel.app/splash.png",
                "splashBackgroundColor":"#0A1A2B"
              }
            }
          }'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
