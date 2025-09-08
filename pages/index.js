import { useState } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leagueFilter, setLeagueFilter] = useState("all");

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matchesWithOdds");
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter matches by league
  const filteredMatches =
    leagueFilter === "all"
      ? matches
      : matches.filter((m) => m.sport_key === leagueFilter);

  // Extract unique leagues
  const leagues = [
    ...new Set(matches.map((m) => m.sport_key || "Unknown League")),
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">⚽ SportsHub</h1>

      <div className="flex gap-2 mb-4">
        <button
          onClick={fetchMatches}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {loading ? "Loading..." : "Load Matches"}
        </button>

        <select
          value={leagueFilter}
          onChange={(e) => setLeagueFilter(e.target.value)}
          className="px-3 py-2 border rounded"
        >
          <option value="all">All Leagues</option>
          {leagues.map((league) => (
            <option key={league} value={league}>
              {league}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-2xl">
        {filteredMatches.length === 0 && !loading && (
          <p className="text-center text-gray-600">No matches yet.</p>
        )}

        {filteredMatches.map((match, idx) => (
          <div
            key={idx}
            className="bg-white shadow rounded p-4 mb-3 border"
          >
            <p className="font-semibold text-gray-800">
              {match.home_team} vs {match.away_team}
            </p>
            <p className="text-sm text-gray-500">
              League: {match.sport_key || "N/A"}
            </p>
            <div className="flex gap-3 mt-2">
              {match.bookmakers?.[0]?.markets?.[0]?.outcomes?.map(
                (outcome, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-sm bg-gray-200 rounded"
                  >
                    {outcome.name}: {outcome.price}
                  </span>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
