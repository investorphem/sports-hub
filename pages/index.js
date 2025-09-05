import { useState } from "react";

export default function Home() {
  const [competition, setCompetition] = useState("premier");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    if (!dateFrom || !dateTo) {
      setError("Please select a date range");
      return;
    }
    setLoading(true);
    setError("");
    setMatches([]);

    try {
      const res = await fetch(
        `/api/matches?competition=${competition}&dateFrom=${dateFrom}&dateTo=${dateTo}`
      );
      const data = await res.json();

      if (res.ok) {
        setMatches(data.matches || []);
      } else {
        setError(data.error || "Failed to fetch matches");
      }
    } catch (err) {
      setError("Something went wrong while fetching matches");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">⚽ Sports Hub</h1>

      {/* Competition Selector */}
      <div className="mb-4">
        <label className="mr-2">Competition:</label>
        <select
          value={competition}
          onChange={(e) => setCompetition(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="premier">Premier League</option>
          <option value="championship">Championship</option>
        </select>
      </div>

      {/* Date Range */}
      <div className="mb-4">
        <label className="mr-2">From:</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="border p-2 rounded"
        />
        <label className="ml-4 mr-2">To:</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Fetch Button */}
      <button
        onClick={fetchMatches}
        className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
      >
        Get Matches
      </button>

      {/* Loading/Error */}
      {loading && <p className="mt-4">Loading matches...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {/* Matches */}
      <div className="mt-6">
        {matches.length === 0 && !loading && !error && (
          <p>No matches found for this range.</p>
        )}

        {matches.map((match) => (
          <div
            key={match.id}
            className="p-4 border rounded mb-3 shadow-sm bg-white"
          >
            <p className="font-semibold">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </p>
            <p className="text-sm text-gray-600">
              {new Date(match.utcDate).toLocaleString()}
            </p>
            <p className="text-sm">Status: {match.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
