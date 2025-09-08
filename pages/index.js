import { useState } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("LIVE"); // default tab

  const loadMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/matchesWithOdds");
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter((m) => m.status === tab);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">⚽ SportsHub Betting</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        {["LIVE", "SCHEDULED", "FINISHED"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {t === "LIVE" && "🔴 Live"}
            {t === "SCHEDULED" && "⏳ Upcoming"}
            {t === "FINISHED" && "✅ Finished"}
          </button>
        ))}
      </div>

      <button
        onClick={loadMatches}
        className="px-4 py-2 bg-green-600 text-white rounded mb-4"
      >
        {loading ? "Loading..." : "Load Matches"}
      </button>

      {/* Match list */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <p>No matches found for {tab}.</p>
        ) : (
          filteredMatches.map((match) => (
            <div
              key={match.id}
              className="p-4 border rounded shadow-sm bg-white"
            >
              <p className="font-bold">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </p>
              <p>Status: {match.status}</p>
              <p>
                {match.utcDate
                  ? new Date(match.utcDate).toLocaleString()
                  : "No date"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
