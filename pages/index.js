import { useEffect, useState } from "react";
import sdk from "@farcaster/miniapp-sdk";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sport, setSport] = useState("soccer_epl");
  const [date, setDate] = useState("");

  useEffect(() => {
    // ✅ Tell Farcaster the app is ready
    sdk.actions.ready();
  }, []);

  const fetchMatches = async () => {
    if (!date) {
      setError("Please select a date.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/matchesWithOdds?sport=${sport}&date=${date}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch matches");
      }

      setMatches(data.matches || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold text-center mb-4">⚽ Sports Hub</h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <select
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        >
          <option value="soccer_epl">Premier League</option>
          <option value="soccer_efl_champ">Championship</option>
          <option value="all">All Leagues</option>
        </select>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
        />

        <button
          onClick={fetchMatches}
          disabled={loading}
          className="p-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load Matches"}
        </button>
      </div>

      {/* Errors */}
      {error && (
        <p className="text-red-400 text-center mb-4">{error}</p>
      )}

      {/* Matches */}
      <div className="space-y-4">
        {matches.length === 0 && !loading && (
          <p className="text-gray-400 text-center">No matches found.</p>
        )}

        {matches.map((match, i) => (
          <div
            key={i}
            className="p-4 bg-gray-800 rounded-lg shadow flex flex-col"
          >
            <span className="text-sm text-gray-400">
              {match.league || "Unknown League"}
            </span>
            <h2 className="text-lg font-semibold mb-2">
              {match.home_team} vs {match.away_team}
            </h2>
            <p className="text-sm text-gray-300 mb-2">
              {new Date(match.commence_time).toLocaleString()}
            </p>

            {match.odds && match.odds.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 text-sm">
                {match.odds.map((o, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-700 p-2 rounded text-center"
                  >
                    <p className="font-bold">{o.name}</p>
                    <p>{o.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Odds not available</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
