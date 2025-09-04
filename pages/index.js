import { useEffect, useState } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        if (data.matches) {
          setMatches(data.matches);
        } else {
          setError("No matches found ⚽");
        }
      } catch (err) {
        setError("Failed to load matches ❌");
      }
    }
    loadMatches();
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1>Sports Hub ✅</h1>
      {error && <p>{error}</p>}
      {!error && matches.length === 0 && <p>Loading...</p>}
      <ul>
        {matches.map((match, i) => (
          <li key={i}>
            {match.homeTeam?.name} vs {match.awayTeam?.name} – {match.utcDate}
          </li>
        ))}
      </ul>
    </div>
  );
}
