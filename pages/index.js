import { useState } from "react";

export default function Home() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    if (!startDate || !endDate) {
      setError("Please select a start and end date.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/matchesWithOdds?start=${startDate}&end=${endDate}`
      );
      const data = await res.json();

      if (res.ok) {
        setMatches(data.matches || []);
      } else {
        setError(data.error || "Failed to fetch matches");
      }
    } catch (err) {
      setError("Something went wrong while fetching matches.");
    } finally {
      setLoading(false);
    }
  };

  const handleBet = (match, pick, odd) => {
    console.log(
      `User placed bet: ${pick} on ${match.homeTeam} vs ${match.awayTeam} @ odd ${odd}`
    );
    alert(
      `Bet placed: ${pick} on ${match.homeTeam} vs ${match.awayTeam} (odd ${odd})`
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">⚽ Sports Hub</h1>

      {/* Date range form */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 rounded text-black"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 rounded text-black"
        />
        <button
          onClick={fetchMatches}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
        >
          {loading ? "Loading..." : "Load Matches"}
        </button>
      </div>

      {error && <p className="text-red-400 text-center mb-4">{error}</p>}

      {/* Matches list */}
      <div className="grid gap-4">
        {matches.length === 0 && !loading && (
          <p className="text-gray-400 text-center">
            No matches found. Try another date range.
          </p>
        )}

        {matches.map((match, idx) => (
          <div
            key={idx}
            className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col gap-3"
          >
            <div className="flex justify-between items-center">
              <span className="font-bold">{match.homeTeam}</span>
              <span className="text-gray-400">vs</span>
              <span className="font-bold">{match.awayTeam}</span>
            </div>
            <p className="text-sm text-gray-400">
              Kickoff: {new Date(match.utcDate).toLocaleString()}
            </p>

            {/* Odds buttons */}
            {match.odds ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBet(match, "Home", match.odds.home)}
                  className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded"
                >
                  Home {match.odds.home || "-"}
                </button>
                <button
                  onClick={() => handleBet(match, "Draw", match.odds.draw)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 py-2 rounded"
                >
                  Draw {match.odds.draw || "-"}
                </button>
                <button
                  onClick={() => handleBet(match, "Away", match.odds.away)}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded"
                >
                  Away {match.odds.away || "-"}
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No odds available</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
