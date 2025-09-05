import { useState, useEffect } from "react";

export default function Home() {
  const [competitions, setCompetitions] = useState([]);
  const [league, setLeague] = useState("PL"); // Default Premier League
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [view, setView] = useState("matches"); // "matches" | "standings"

  // Fetch competitions (PL, ELC, etc.)
  useEffect(() => {
    fetch("/api/competitions")
      .then((res) => res.json())
      .then((data) => setCompetitions(data.competitions || []));
  }, []);

  // Fetch standings when league changes
  useEffect(() => {
    if (league) {
      fetch(`/api/standings?league=${league}`)
        .then((res) => res.json())
        .then((data) => setStandings(data.standings?.[0]?.table || []));
    }
  }, [league]);

  const fetchMatches = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    try {
      const res = await fetch(`/api/matches?start=${startDate}&end=${endDate}`);
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch matches");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Title */}
      <h1 className="text-2xl font-bold text-center mb-4">⚽ Sports Hub</h1>

      {/* League Selector */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2">Select League:</label>
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700"
        >
          {competitions.map((comp) => (
            <option key={comp.code} value={comp.code}>
              {comp.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="flex-1 p-2 rounded-lg bg-gray-800 border border-gray-700"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="flex-1 p-2 rounded-lg bg-gray-800 border border-gray-700"
        />
        <button
          onClick={fetchMatches}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Toggle View */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => setView("matches")}
          className={`px-4 py-2 rounded-lg ${
            view === "matches" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Matches
        </button>
        <button
          onClick={() => setView("standings")}
          className={`px-4 py-2 rounded-lg ${
            view === "standings" ? "bg-blue-600" : "bg-gray-700"
          }`}
        >
          Standings
        </button>
      </div>

      {/* Matches View */}
      {view === "matches" && (
        <div>
          {matches.length === 0 ? (
            <p className="text-center text-gray-400">No matches found for this range.</p>
          ) : (
            <ul className="space-y-4">
              {matches.map((match) => (
                <li
                  key={match.id}
                  className="p-4 bg-gray-800 rounded-lg shadow-lg"
                >
                  <p className="font-bold text-lg text-center">
                    {match.homeTeam.name} vs {match.awayTeam.name}
                  </p>
                  <p className="text-sm text-gray-400 text-center">
                    {new Date(match.utcDate).toLocaleString()}
                  </p>
                  <p className="text-sm text-center">Status: {match.status}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Standings View */}
      {view === "standings" && (
        <div>
          {standings.length === 0 ? (
            <p className="text-center text-gray-400">No standings available.</p>
          ) : (
            <table className="w-full text-sm bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">Team</th>
                  <th className="p-2">Pts</th>
                  <th className="p-2">W</th>
                  <th className="p-2">L</th>
                  <th className="p-2">D</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((team) => (
                  <tr key={team.team.id} className="border-b border-gray-700">
                    <td className="p-2">{team.position}</td>
                    <td className="p-2">{team.team.name}</td>
                    <td className="p-2 text-center">{team.points}</td>
                    <td className="p-2 text-center">{team.won}</td>
                    <td className="p-2 text-center">{team.lost}</td>
                    <td className="p-2 text-center">{team.draw}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
