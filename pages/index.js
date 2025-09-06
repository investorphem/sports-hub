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
      </div
