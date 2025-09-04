import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch matches from your API route
        const res = await fetch("/api/matches");
        if (!res.ok) throw new Error("Failed to fetch matches");
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        // Tell Farcaster Miniapp SDK we are ready
        await sdk.actions.ready();
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ padding: "16px", fontFamily: "sans-serif" }}>
      <h1>⚽ Sports Hub</h1>
      <p>Live Premier League and Championship fixtures</p>

      {loading && <p>Loading matches...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && matches.length === 0 && <p>No matches available</p>}

      <ul>
        {matches.map((match, idx) => (
          <li key={idx}>
            {match.homeTeam} vs {match.awayTeam} — {match.date}
          </li>
        ))}
      </ul>
    </div>
  );
}
