import { useState } from "react";

export default function Home() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMatches = async () => {
    if (!start || !end) {
      setError("Please select both start and end dates.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/matches?start=${start}&end=${end}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch matches");

      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="title">⚽ Sports Hub</h1>

      {/* Date Filters */}
      <div className="card">
        <label className="block mb-2 font-semibold">Start Date</label>
        <input
          type="date"
          className="input mb-3"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />

        <label className="block mb-2 font-semibold">End Date</label>
        <input
          type="date"
          className="input mb-3"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />

        <button onClick={fetchMatches} className="button w-full">
          {loading ? "Loading..." : "Search Matches"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-600 text-center font-semibold mt-2">{error}</p>
      )}

      {/* Matches */}
      <div className="mt-4">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} className="card">
              <div className="flex justify-between items-center">
                <span className="font-bold">{match.homeTeam.name}</span>
                <span className="text-sm text-gray-500">vs</span>
                <span className="font-bold">{match.awayTeam.name}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {new Date(match.utcDate).toLocaleString()}
              </p>
              <p className="text-sm mt-1">
                Status: <span className="font-semibold">{match.status}</span>
              </p>
              <button className="button w-full mt-3">Bet with Token 🎟</button>
            </div>
          ))
        ) : (
          !loading && <p className="text-center text-gray-600">No matches found.</p>
        )}
      </div>
    </div>
  );
}
