import { useState } from "react";

export default function Home() {
  const [league, setLeague] = useState("PL"); // Default Premier League
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
        `/api/matches?start=${startDate}&end=${endDate}&league=${league}`
      );
      const data = await res.json();

      if (res.ok) {
        setMatches(data.matches || []);
      } else {
        setError(data.error || "Failed to fetch matches.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch matches.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">
        ⚽ Sports Hub
      </h1>

      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-4 w-full max-w-xl">
        {/* League Dropdown */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium mb-1">League</label>
          <select
            value={league}
            onChange={(e) => setLeague(e.target.value)}
            className="border rounded px-3 py-2 focus:ring focus:ring-indigo-400"
          >
            <option value="PL">Premier League</option>
            <option value="ELC">Championship</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2 focus:ring focus:ring-indigo-400"
          />
        </div>

        {/* End Date */}
        <div className="flex flex-col flex-1">
          <label className="text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2 focus:ring focus:ring-indigo-400"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={fetchMatches}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg self-end sm:self-center"
        >
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 font-semibold mb-4">{error}</p>
      )}

      {/* Loading */}
      {loading && <p className="text-gray-600">Loading matches...</p>}

      {/* Matches */}
      <div className="grid gap-4 w-full max-w-2xl">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div
              key={match.id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center"
            >
              <div className="flex flex-col text-center sm:text-left">
                <p className="font-bold text-lg">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(match.utcDate).toLocaleString()}
                </p>
              </div>
              <span
                className={`mt-2 sm:mt-0 px-3 py-1 text-sm font-medium rounded ${
                  match.status === "FINISHED"
                    ? "bg-green-100 text-green-700"
                    : match.status === "SCHEDULED"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {match.status}
              </span>
            </div>
          ))
        ) : (
          !loading && (
            <p className="text-gray-500 italic">No matches found for this range.</p>
          )
        )}
      </div>
    </div>
  );
}
