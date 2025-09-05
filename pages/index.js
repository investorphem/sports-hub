import { useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchMatches = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/matches?start=${startDate}&end=${endDate}`
      );
      const data = await res.json();

      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
      } else {
        setMatches([]);
        setError("No matches found for this range.");
      }
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  // Let Farcaster know app is ready
  if (typeof window !== "undefined") {
    sdk.actions.ready();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Sports Hub ⚽</h1>

      {/* Date Range Picker */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border rounded-md w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border rounded-md w-full"
          />
        </div>
        <button
          onClick={fetchMatches}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md mt-4 md:mt-6"
        >
          Search
        </button>
      </div>

      {/* Matches */}
      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white shadow-md rounded-lg p-4 text-center"
          >
            <h2 className="font-bold text-lg mb-2">{match.competition.name}</h2>

            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <img
                  src={match.homeTeam.crest}
                  alt={match.homeTeam.name}
                  className="w-10 h-10 mb-1"
                />
                <span className="text-sm font-semibold text-center">
                  {match.homeTeam.name}
                </span>
              </div>

              <span className="text-lg font-bold">vs</span>

              <div className="flex flex-col items-center">
                <img
                  src={match.awayTeam.crest}
                  alt={match.awayTeam.name}
                  className="w-10 h-10 mb-1"
                />
                <span className="text-sm font-semibold text-center">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>

            <p className="mt-3 text-sm text-gray-700">
              {new Date(match.utcDate).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">Status: {match.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
