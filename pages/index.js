import { useState } from "react";

export default function Home() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [league, setLeague] = useState("all");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    if (!startDate || !endDate) {
      setError("Please select a start and end date");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `/api/matches?start=${startDate}&end=${endDate}&league=${league}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch matches");
      }

      setMatches(data.matches || []);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">⚽ Sports Hub Betting</h1>

      {/* Filters */}
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-4 mb-6">
        <label className="block mb-2 font-medium">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />

        <label className="block mb-2 font-medium">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />

        <label className="block mb-2 font-medium">League</label>
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        >
          <option value="all">All</option>
          <option value="premier">Premier League</option>
          <option value="championship">Championship</option>
        </select>

        <button
          onClick={fetchMatches}
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Loading..." : "Load Matches"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-center text-red-500 font-medium mb-4">{error}</p>
      )}

      {/* Matches */}
      <div className="grid gap-4 max-w-2xl mx-auto">
        {matches.length === 0 && !loading && !error && (
          <p className="text-center text-gray-500">No matches found</p>
        )}

        {matches.map((match, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
          >
            <h2 className="text-lg font-semibold mb-2">
              {match.home_team} vs {match.away_team}
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              Start Time: {new Date(match.commence_time).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">
              League: {match.sport_title || "Unknown"}
            </p>
            {match.bookmakers && match.bookmakers.length > 0 && (
              <div className="mt-2">
                <p className="font-medium">Odds:</p>
                {match.bookmakers[0].markets[0].outcomes.map((o, j) => (
                  <p key={j} className="text-sm">
                    {o.name}: {o.price}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
