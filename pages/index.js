import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [competition, setCompetition] = useState("PL"); // Default Premier League

  useEffect(() => {
    const fetchData = async () => {
      if (!startDate || !endDate) return;
      setLoading(true);
      try {
        const res = await fetch(
          `/api/matches?competition=${competition}&startDate=${startDate}&endDate=${endDate}`
        );
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (err) {
        setError("Failed to fetch matches");
      }
      setLoading(false);

      // ✅ Tell Farcaster the app is ready
      sdk.actions.ready();
    };

    fetchData();
  }, [competition, startDate, endDate]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <h1 className="text-2xl font-bold text-center text-indigo-700 mb-4">
        ⚽ Sports Hub
      </h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold">Competition</label>
          <select
            value={competition}
            onChange={(e) => setCompetition(e.target.value)}
            className="border p-2 rounded-lg"
          >
            <option value="PL">Premier League</option>
            <option value="ELC">Championship</option>
          </select>

          <label className="text-sm font-semibold mt-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 rounded-lg"
          />

          <label className="text-sm font-semibold mt-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 rounded-lg"
          />
        </div>
      </div>

      {/* Matches */}
      <div>
        {loading && <p className="text-center">Loading matches...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && matches.length === 0 && (
          <p className="text-center text-gray-500">No matches found</p>
        )}

        <div className="grid gap-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-white p-4 rounded-2xl shadow flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-gray-800">
                  {match.homeTeam.name} vs {match.awayTeam.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(match.utcDate).toLocaleString()}
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  Status: {match.status}
                </p>
              </div>
              <div className="text-xl font-bold text-indigo-700">
                {match.score.fullTime.home ?? "-"} :{" "}
                {match.score.fullTime.away ?? "-"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
