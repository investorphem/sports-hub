import { useState } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [competition, setCompetition] = useState("PL"); // Premier League default
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchMatches = async () => {
    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    setLoading(true);
    setError("");
    try {
      let url = `/api/matches?competition=${competition}&dateFrom=${startDate}&dateTo=${endDate}`;
      const res = await fetch(url);

      if (!res.ok) throw new Error("Failed to fetch matches");

      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      setError(err.message);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">⚽ Sports Hub</h1>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-center mb-6">
        <button
          onClick={() => setCompetition("PL")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            competition === "PL"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          Premier League
        </button>
        <button
          onClick={() => setCompetition("ELC")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            competition === "ELC"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border"
          }`}
        >
          Championship
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-3 py-2 rounded-lg border text-gray-700"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-3 py-2 rounded-lg border text-gray-700"
        />
        <button
          onClick={fetchMatches}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg"
        >
          Search
        </button>
      </div>

      {/* Match List */}
      {loading && (
        <div className="text-center text-gray-600">Loading matches...</div>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="grid gap-4">
        {matches.length === 0 && !loading && !error && (
          <p className="text-center text-gray-600">No matches found</p>
        )}
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white shadow-md rounded-xl p-4 flex flex-col items-center"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col items-center flex-1">
                <img
                  src={match.homeTeam.crest || "/logo.png"}
                  alt={match.homeTeam.name}
                  className="w-10 h-10 mb-1"
                />
                <span className="text-sm font-semibold text-center">
                  {match.homeTeam.name}
                </span>
              </div>

              <span className="text-lg font-bold mx-3">vs</span>

              <div className="flex flex-col items-center flex-1">
                <img
                  src={match.awayTeam.crest || "/logo.png"}
                  alt={match.awayTeam.name}
                  className="w-10 h-10 mb-1"
                />
                <span className="text-sm font-semibold text-center">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>

            <div className="mt-3 text-gray-600 text-sm text-center">
              {new Date(match.utcDate).toLocaleString()}
              <br />
              Status:{" "}
              <span className="font-medium text-gray-800">{match.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
``                  className="w-10 h-10 mb-1"
                />
                <span className="text-sm font-semibold text-center">
                  {match.awayTeam.name}
                </span>
              </div>
            </div>

            <div className="mt-3 text-gray-600 text-sm text-center">
              {new Date(match.utcDate).toLocaleString()}
              <br />
              Status:{" "}
              <span className="font-medium text-gray-800">{match.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
