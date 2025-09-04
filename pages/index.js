// pages/index.js
export default function Home() {
  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>Sports Hub ✅</h1>
      <p>This is a test page. If you see this, rendering works fine.</p>
      <a href="/api/matches" target="_blank">Test API → /api/matches</a>
    </div>
  );
}
