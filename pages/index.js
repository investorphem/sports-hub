import { useState, useEffect } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1); // pagination
  const perPage = 10;

  const leagues = [
    { id: "all", name: "All Leagues" },
    { id: "Premier League", name: "Premier League" },
    { id: "Championship", name: "Championship" },
    { id: "Primera Division", name: "La Liga" },
    { id: "Serie A", name: "Serie A" },
    { id: "Bundesliga", name: "Bundesliga" },
    { id: "UEFA Champions League", name: "Champions League" },
  ];

  async function loadMatches() {
    if (!start || !end) {
      alert("Please select both start and end date");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/matchesWithOdds?start=${start}&end=${end}`);
      const data = await res.json();
      setMatches(data.matches || []);
      setPage(1); // reset pagination
    } catch (err) {
      console.error(err);
      alert("Failed to fetch matches");
    }
    setLoading(false);
  }

  // Reset pagination when filters/search change
  useEffect(() => {
    setPage(1);
  }, [selectedLeague, searchTerm]);

  // Group matches by competition
  function groupByLeague(matches) {
    return matches.reduce((groups, match) => {
      const league = match.competition || "Unknown";
      if (!groups[league]) groups[league] = [];
      groups[league].push(match);
      return groups;
    }, {});
  }

  // Apply league filter
  let filteredMatches =
    selectedLeague === "all"
      ? matches
      : matches.filter((m) => m.competition === selectedLeague);

  // Apply search filter (by team name)
  if (searchTerm.trim() !== "") {
    const lower = searchTerm.toLowerCase();
    filteredMatches = filteredMatches.filter(
      (m) =>
        m.homeTeam.toLowerCase().includes(lower) ||
        m.awayTeam.toLowerCase().includes(lower)
    );
  }

  // Pagination slice
  const paginatedMatches = filteredMatches.slice(0, page * perPage);

  const groupedMatches =
    selectedLeague === "all"
      ? groupByLeague(paginatedMatches)
      : { [selectedLeague]: paginatedMatches };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Football Matches & Odds</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
        />
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
        />

        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(e.target.value)}
          className="p-2 border rounded w-full md:w-auto"
        >
          {leagues.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search team..."
          className="p-2 border rounded w-full md:w-auto"
        />

        <button
          onClick={loadMatches}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Loading..." : "Load Matches"}
        </button>
      </div>

      {/* Matches */}
      {Object.keys(groupedMatches).length === 0 ? (
        <p className="text-center text-red-500">No matches found for this range.</p>
      ) : (
        Object.entries(groupedMatches).map(([league, matches]) => (
          <div key={league} className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{league}</h2>
            <div className="space-y-2">
              {matches.map((match) => (
                <div key={match.id} className="bg-white shadow p-3 rounded">
                  <p className="font-bold">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(match.utcDate).toLocaleString()}
                  </p>
                  {match.odds ? (
                    <div className="flex gap-4 mt-2">
                      <span>Home: {match.odds.home || "-"}</span>
                      <span>Draw: {match.odds.draw || "-"}</span>
                      <span>Away: {match.odds.away || "-"}</span>
                    </div>
                  ) : (
                    <p className="text-gray-400">Odds not available</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Load More */}
      {filteredMatches.length > paginatedMatches.length && (
        <div className="text-center mt-6">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
