import { useState } from "react";

export default function Home() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [league, setLeague] = useState("PL");
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
      const response = await fetch(
        `/api/matchesWithOdds?start=${startDate}&end=${endDate}&league=${league}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch matches");
      }

      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Bet Click
  const handleBet = (matchId, option) => {
    console.log(`Bet placed: Match ${matchId}, Option: ${option}`);
    alert(`Bet placed on ${option} for match ${matchId}`);
    // ✅ Later: Replace with Base chain contract call
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">⚽ Sports Hub</h1>

      {/* Filters */}
      <div className="bg-white shadow p-4 rounded-lg mb-6">
        <label className="block mb-2 font-medium">Select League</label>
        <select
          value={league}
          onChange={(e) => setLeague(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="PL">Premier League</option>
          <option value="ELC">Championship</option>
        </select>

        <label className="block mb-2 font-medium">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <label className="block mb-2 font-medium">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={fetchMatches}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Loading..." : "Load Matches"}
        </button>
      </div>

      {/* Errors */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* Matches List */}
      <div className="space-y-4">
        {matches.length === 0 && !loading && (
          <p className="text-center text-gray-500">No matches found</p>
        )}

        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white shadow p-4 rounded-lg border"
          >
            <h2 className="text-lg font-bold text-gray-800">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </h2>
            <p className="text-sm text-gray-600">
              {new Date(match.utcDate).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Status: {match.status}</p>

            {/* Odds */}
            {match.odds ? (
              <div className="mt-2 text-sm text-gray-700">
                <p>
                  Odds:{" "}
                  <span className="ml-2 font-semibold text-indigo-600">
                    Home {match.odds.home}
                  </span>{" "}
                  |{" "}
                  <span className="ml-2 font-semibold text-indigo-600">
                    Draw {match.odds.draw}
                  </span>{" "}
                  |{" "}
                  <span className="ml-2 font-semibold text-indigo-600">
                    Away {match.odds.away}
                  </span>
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500">Odds not available</p>
            )}

            {/* ✅ Betting Buttons */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleBet(match.id, "Home")}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Bet Home
              </button>
              <button
                onClick={() => handleBet(match.id, "Draw")}
                className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
              >
                Bet Draw
              </button>
              <button
                onClick={() => handleBet(match.id, "Away")}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Bet Away
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
