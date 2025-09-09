import { useEffect, useState } from "react";

export default function Home() {
  const [tab, setTab] = useState("live");
  const [matches, setMatches] = useState([]); // always array
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("All");
  const [betSlip, setBetSlip] = useState([]);
  const [betHistory, setBetHistory] = useState([]);

  const leagueLogos = {
    "Premier League": "https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg",
    "La Liga": "https://upload.wikimedia.org/wikipedia/en/1/13/La_Liga.png",
    "Serie A": "https://upload.wikimedia.org/wikipedia/en/e/e1/Serie_A_logo_%282019%29.png",
    "Bundesliga": "https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg",
    "Ligue 1": "https://upload.wikimedia.org/wikipedia/en/b/ba/Ligue_1_Uber_Eats_logo.png",
    "Champions League": "https://upload.wikimedia.org/wikipedia/en/b/bf/UEFA_Champions_League_logo_2.svg",
  };

  const getTeamLogo = (teamName) => {
    if (!teamName) return "";
    const domain = teamName.replace(/\s+/g, "").toLowerCase() + ".com";
    return `https://logo.clearbit.com/${domain}`;
  };

  useEffect(() => {
    loadMatches(tab);

    if (typeof window !== "undefined") {
      const savedSlip = localStorage.getItem("betSlip");
      const savedHistory = localStorage.getItem("betHistory");
      if (savedSlip) setBetSlip(JSON.parse(savedSlip));
      if (savedHistory) setBetHistory(JSON.parse(savedHistory));
    }
  }, [tab]);

  const loadMatches = async (currentTab) => {
    try {
      const response = await fetch(`/api/matches?tab=${currentTab}`);
      const data = await response.json();
      setMatches(Array.isArray(data.matches) ? data.matches : []);
      setLeagues(["All", ...(data.leagues || [])]);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setMatches([]);
    }
  };

  const addToSlip = (match, outcome) => {
    const newSlip = [...betSlip, { ...match, selected: outcome }];
    setBetSlip(newSlip);
    if (typeof window !== "undefined") {
      localStorage.setItem("betSlip", JSON.stringify(newSlip));
    }
  };

  const placeBets = () => {
    const newHistory = [...betHistory, { bets: betSlip, timestamp: new Date() }];
    setBetHistory(newHistory);
    if (typeof window !== "undefined") {
      localStorage.setItem("betHistory", JSON.stringify(newHistory));
      localStorage.removeItem("betSlip");
    }
    setBetSlip([]);
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex justify-around mb-4">
        {["live", "upcoming", "past", "betHistory"].map((t) => (
          <button
            key={t}
            className={`px-3 py-2 rounded ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => setTab(t)}
          >
            {t === "live" && "⚽ Live"}
            {t === "upcoming" && "⏳ Upcoming"}
            {t === "past" && "📜 Past"}
            {t === "betHistory" && "📝 Bet History"}
          </button>
        ))}
      </div>

      {/* League Filter */}
      {tab !== "betHistory" && leagues.length > 0 && (
        <div className="mb-4">
          <label className="mr-2">Filter by League:</label>
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="p-2 border rounded"
          >
            {leagues.map((league) => (
              <option key={league} value={league}>
                {league}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Matches */}
      {tab !== "betHistory" &&
        matches
          .filter(
            (m) => selectedLeague === "All" || m.competition === selectedLeague
          )
          .map((match, idx) => (
            <div key={idx} className="mb-4 p-3 border rounded shadow">
              <div className="flex items-center mb-2">
                {leagueLogos[match.competition] && (
                  <img
                    src={leagueLogos[match.competition]}
                    alt={match.competition}
                    className="w-6 h-6 mr-2"
                  />
                )}
                <span className="font-bold">{match.competition}</span>
              </div>

              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <img
                    src={getTeamLogo(match.homeTeam)}
                    onError={(e) => (e.target.style.display = "none")}
                    alt={match.homeTeam}
                    className="w-6 h-6 mr-2"
                  />
                  <span>{match.homeTeam}</span>
                </div>
                <span>vs</span>
                <div className="flex items-center">
                  <img
                    src={getTeamLogo(match.awayTeam)}
                    onError={(e) => (e.target.style.display = "none")}
                    alt={match.awayTeam}
                    className="w-6 h-6 mr-2"
                  />
                  <span>{match.awayTeam}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                {(match.odds || []).map((o, i) => (
                  <button
                    key={i}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                    onClick={() => addToSlip(match, o)}
                  >
                    {o.name}: {o.price}
                  </button>
                ))}
              </div>
            </div>
          ))}

      {/* Bet History */}
      {tab === "betHistory" && (
        <div>
          {betHistory.length === 0 && <p>No bets placed yet.</p>}
          {betHistory.map((entry, i) => (
            <div key={i} className="mb-3 p-3 border rounded">
              <p className="text-sm text-gray-500">
                {new Date(entry.timestamp).toLocaleString()}
              </p>
              {entry.bets.map((b, j) => (
                <p key={j}>
                  {b.homeTeam} vs {b.awayTeam} —{" "}
                  <strong>{b.selected.name}</strong> @ {b.selected.price}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Bet Slip */}
      {tab !== "betHistory" && betSlip.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <h3 className="font-bold mb-2">Your Bet Slip</h3>
          {betSlip.map((b, i) => (
            <p key={i}>
              {b.homeTeam} vs {b.awayTeam} —{" "}
              <strong>{b.selected.name}</strong> @ {b.selected.price}
            </p>
          ))}
          <button
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
            onClick={placeBets}
          >
            Place Bets
          </button>
        </div>
      )}
    </div>
  );
}
