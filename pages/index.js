import { useState, useEffect } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("2025-09-01");
  const [dateTo, setDateTo] = useState("2025-09-07");
  const [competition, setCompetition] = useState("PL"); // PL = Premier League

  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&competition=${competition}`
        );
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (err) {
        console.error("Error fetching matches:", err);
      }
      setLoading(false);
    }
    fetchMatches();
  }, [dateFrom, dateTo, competition]);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>⚽ Sports Hub</h1>
      <p>Live football scores + fixtures</p>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          From:{" "}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: "10px" }}>
          To:{" "}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </label>
        <label style={{ marginLeft: "10px" }}>
          Competition:{" "}
          <select
            value={competition}
            onChange={(e) => setCompetition(e.target.value)}
          >
            <option value="PL">Premier League</option>
            <option value="ELC">Championship</option>
            <option value="CL">Champions League</option>
            <option value="PD">La Liga</option>
            <option value="SA">Serie A</option>
            <option value="BL1">Bundesliga</option>
          </select>
        </label>
      </div>

      {/* Matches */}
      {loading ? (
        <p>Loading matches...</p>
      ) : matches.length > 0 ? (
        <ul>
          {matches.map((match) => (
            <li key={match.id} style={{ marginBottom: "10px" }}>
              <strong>
                {match.homeTeam.name} vs {match.awayTeam.name}
              </strong>{" "}
              <br />
              {new Date(match.utcDate).toLocaleString()} <br />
              Status: {match.status}
            </li>
          ))}
        </ul>
      ) : (
        <p>No matches found for this range.</p>
      )}
    </div>
  );
}
