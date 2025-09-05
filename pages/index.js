import { useState } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filter, setFilter] = useState("all"); // all, premier, championship

  const fetchMatches = async () => {
    if (!startDate || !endDate) {
      setError("Please select a date range.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/matches?start=${startDate}&end=${endDate}`);
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

  // Filter logic
  const filteredMatches = matches.filter((m) => {
    if (filter === "premier" && m.competition.id !== 2021) return false;
    if (filter === "championship" && m.competition.id !== 2016) return false;
    return true;
  });

  // Logo chooser
  const getCompetitionIcon = (id) => {
    if (id === 2021) return "🦁"; // Premier League
    if (id === 2016) return "🏟️"; // Championship
    return "🏆"; // Others
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-center mb-6">⚽ Sports Hub</h1>

      {/* Date Range Inputs */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          onClick={fetchMatches}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* League Filter Tabs */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-white border"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("premier")}
          className={`px-4 py-2 rounded ${
            filter === "premier" ? "bg-blue-600 text-white" : "bg-white border"
          }`}
        >
          Premier League 🦁
        </button>
        <button
          onClick={() => setFilter("championship")}
          className={`px-4 py-2 rounded ${
            filter === "championship"
              ? "bg-blue-600 text-white"
              : "bg-white border"
          }`}
        >
          Championship 🏟️
        </button>
      </div>

      {loading && <p className="text-center text-gray-600">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Matches */}
      <div className="space-y-4">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <div key={match.id} className="bg-white p-4 rounded shadow-md">
              <p className="text-sm text-gray-500 font-semibold flex items-center gap-2">
                <span>{getCompetitionIcon(match.competition.id)}</span>
                {match.competition.name}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold">{match.homeTeam.name}</span>
                <span className="text-gray-500">vs</span>
                <span className="font-bold">{match.awayTeam.name}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(match.utcDate).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Status: {match.status}</p>
            </div>
          ))
        ) : (
          !loading && (
            <p className="text-center text-gray-600">
              No matches found for this range.
            </p>
          )
        )}
      </div>
    </div>
  );
}
