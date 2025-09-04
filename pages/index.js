import { useState, useEffect } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [competition, setCompetition] = useState("PL"); // PL = Premier League by default

  // Fetch matches
  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (competition) params.append("competition", competition);

      const res = await fetch(`/api/matches?${params.toString()}`);
      const data = await res.json();

      setMatches(data.matches || []);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setMatches([]);
    }
    setLoading(false);
  };

  // Fetch when filters change
  useEffect(() => {
    fetchMatches();
  }, [dateFrom, dateTo, competition]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>⚽ Sports Hub</h1>
      <p>Live football scores & fixtures</p>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          From:{" "}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </label>{" "}
        <label>
          To:{" "}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </label>{" "}
        <label>
          Competition:{" "}
          <select
            value={competition}
            onChange={(e) => setCompetition(e.target.value)}
          >
            <option value="PL">Premier League</option>
            <option value="ELC">Championship</option>
          </select>
        </label>
      </div>

      {/* Match List */}
      {loading ? (
        <p>Loading matches...</p>
      ) : matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <ul>
          {matches.map((match) => (
            <li key={match.id}>
              <strong>
                {match.homeTeam?.name} vs {match.awayTeam?.name}
              </strong>{" "}
              <br />
              {new Date(match.utcDate).toLocaleString()} –{" "}
              {match.competition?.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
