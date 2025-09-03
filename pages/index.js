import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [competition, setCompetition] = useState("2021"); // Premier League default
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    fetchMatches();
  }, [competition]);

  const fetchMatches = async () => {
    let url = `/api/football?competition=${competition}`;
    if (dateFrom && dateTo) {
      url += `&dateFrom=${dateFrom}&dateTo=${dateTo}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setMatches(data.matches || []);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>⚽ Sports Hub</h1>
      <p>Check live scores & upcoming fixtures.</p>

      {/* Competition dropdown */}
      <label>Choose Competition: </label>
      <select
        value={competition}
        onChange={(e) => setCompetition(e.target.value)}
        style={{ margin: "10px" }}
      >
        <option value="2021">Premier League</option>
        <option value="2016">Championship</option>
      </select>

      {/* Date range picker */}
      <div style={{ margin: "10px 0" }}>
        <label>From: </label>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <label style={{ marginLeft: "10px" }}>To: </label>
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <button onClick={fetchMatches} style={{ marginLeft: "10px" }}>Filter</button>
      </div>

      {/* Matches list */}
      <h2>Matches</h2>
      <ul>
        {matches.length === 0 ? (
          <p>No matches available.</p>
        ) : (
          matches.map((match) => (
            <li key={match.id} style={{ margin: "10px 0" }}>
              <Link href={`/match/${match.id}`}>
                {match.homeTeam.name} vs {match.awayTeam.name} - {match.utcDate.slice(0, 10)}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
