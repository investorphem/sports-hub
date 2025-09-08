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

      if (data.matches) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches =
    leagueFilter === "all"
      ? matches
      : matches.filter((m) => m.league && m.league === leagueFilter);

  const leagues = [...new Set(matches.map((m) => m.league))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-center mb-6 text-purple-700">
        Sportshub Betting Miniapp ⚽
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={fetchMatches}
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          {loading ? "Loading..." : "Load Matches"}
        </button>
      </div>

      {matches.length > 0 && (
        <div className="mb-6 flex justify-center">
          <select
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
            className="p-2 border rounded-lg"
          >
            <option value="all">All Leagues</option>
            {leagues.map((league) => (
              <option key={league} value={league}>
                {league}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredMatches.map((match, i) => (
          <div
            key={i}
            className="bg-white shadow rounded-lg p-4 border hover:shadow-md"
          >
            <h2 className="font-bold text-lg text-purple-600 mb-2">
              {match.homeTeam} vs {match.awayTeam}
            </h2>
            <p className="text-sm text-gray-600 mb-2">{match.league}</p>
            <div className="flex gap-4">
              {match.odds &&
                Object.entries(match.odds).map(([team, odd]) => (
                  <button
                    key={team}
                    className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
                  >
                    {team}: {odd}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
