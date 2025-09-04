// pages/index.js
import Head from "next/head";
// ...your existing imports

export default function Home() {
  const embed = {
    version: "1",
    imageUrl: "https://sports-hub-three.vercel.app/embed.png", // 3:2 image (e.g., 1200x800)
    button: {
      title: "Open Sports Hub",
      action: {
        type: "launch_miniapp",            // required for Mini Apps
        url: "https://sports-hub-three.vercel.app/",
        name: "Sports Hub",
        splashImageUrl: "https://sports-hub-three.vercel.app/splash.png", // 200x200
        splashBackgroundColor: "#0A1A2B"
      }
    }
  };

  return (
    <>
      <Head>
        {/* Mini App embed (primary) */}
        <meta name="fc:miniapp" content={JSON.stringify(embed)} />
        {/* Back-compat for some clients */}
        <meta name="fc:frame" content={JSON.stringify({
          ...embed,
          button: { ...embed.button, action: { ...embed.button.action, type: "launch_frame" } }
        })} />
        {/* Regular Open Graph (nice preview on web) */}
        <meta property="og:title" content="Sports Hub" />
        <meta property="og:description" content="Live football scores & fixtures." />
        <meta property="og:image" content="https://sports-hub-three.vercel.app/share.png" />
      </Head>

      {/* ...your existing page UI */}
    </>
  );
}
