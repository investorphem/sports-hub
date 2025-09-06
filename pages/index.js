import { useState } from "react";

export default function Home() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/matchesWithOdds?start=${startDate}&end=${endDate}`
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch matches");
      } else {
        setMatches(data.matches || []);
      }
    } catch (err) {
      setError("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6 text-blue-600">
        Sports Hub ⚽
      </h1>

      {/* Date pickers */}
      <div className="flex flex-col md:flex-row gap-4 justify-center mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded-lg"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded-lg"
        />
        <button
          onClick={fetchMatches}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          {loading ? "Loading..." : "Load Matches"}
        </button>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Matches list */}
      <div className="grid gap-4">
        {matches.length > 0 ? (
          matches.map((match, idx) => (
            <div
              key={idx}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-2"
            >
              <h2 className="text-lg font-semibold text-gray-800">
                {match.homeTeam} vs {match.awayTeam}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(match.date).toLocaleString()}
              </p>
              <p className="text-sm text-gray-700">Status: {match.status}</p>

              {match.odds ? (
                <div className="flex justify-around mt-2">
                  <div className="text-center">
                    <p className="text-sm">Home</p>
                    <p className="font-bold text-green-600">{match.odds.home}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm">Draw</p>
                    <p className="font-bold text-yellow-600">{match.odds.draw}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm">Away</p>
                    <p className="font-bold text-red-600">{match.odds.away}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Odds unavailable</p>
              )}
            </div>
          ))
        ) : (
          !loading && (
            <p className="text-center text-gray-500">
              No matches found for this range.
            </p>
          )
        )}
      </div>
    </div>
  );
}
