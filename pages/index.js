import { useEffect, useState } from "react";

const leagueLogos = {
  "English Premier League": "https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg",
  "Spanish La Liga": "https://upload.wikimedia.org/wikipedia/en/7/78/LaLiga_Santander.svg",
  "UEFA Champions League": "https://upload.wikimedia.org/wikipedia/en/f/f2/UEFA_Champions_League_logo_2.svg",
  "German Bundesliga": "https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg",
};

function getLeagueLogo(league) {
  return leagueLogos[league] || "https://cdn-icons-png.flaticon.com/512/40/40361.png";
}

function getTeamLogo(teamName) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=random&rounded=true`;
}

export default function Home() {
  const [matches, setMatches] = useState({ live: {}, upcoming: {}, past: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("live");
  const [selectedLeague, setSelectedLeague] = useState("All");
  const [betSlip, setBetSlip] = useState([]);
  const [betHistory, setBetHistory] = useState([]);

  // Fetch matches
  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/matchesWithOdds");
        const data = await res.json();
        setMatches(data);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  // Load saved bets
  useEffect(() => {
    const savedSlip = localStorage.getItem("betSlip");
    const savedHistory = localStorage.getItem("betHistory");
    if (savedSlip) setBetSlip(JSON.parse(savedSlip));
    if (savedHistory) setBetHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem("betSlip", JSON.stringify(betSlip));
  }, [betSlip]);

  useEffect(() => {
    localStorage.setItem("betHistory", JSON.stringify(betHistory));
  }, [betHistory]);

  function toggleBet(match, outcome) {
    const betId = `${match.id}-${outcome.name}`;
    const exists = betSlip.find(b => b.id === betId);
    if (exists) {
      setBetSlip(betSlip.filter(b => b.id !== betId));
    } else {
      setBetSlip([
        ...betSlip,
        {
          id: betId,
          match: `${match.home_team} vs ${match.away_team}`,
          outcome: outcome.name,
          odds: outcome.price,
        },
      ]);
    }
  }

  function getTotalOdds() {
    return betSlip.reduce((acc, b) => acc * (b.odds || 1), 1).toFixed(2);
  }

  function placeBet() {
    if (betSlip.length === 0) return;
    const newHistory = [
      ...betHistory,
      { id: Date.now(), bets: betSlip, totalOdds: getTotalOdds() },
    ];
    setBetHistory(newHistory);
    setBetSlip([]);
  }

  const leagues = [
    "All",
    ...new Set([
      ...Object.keys(matches.live),
      ...Object.keys(matches.upcoming),
      ...Object.keys(matches.past),
    ]),
  ];

  function renderMatches(group) {
    if (loading) return <p>Loading matches...</p>;
    if (!group || Object.keys(group).length === 0) return <p>No matches.</p>;

    return Object.entries(group).map(([league, leagueMatches]) => {
      if (selectedLeague !== "All" && selectedLeague !== league) return null;
      return (
        <div key={league} className="mb-6 pb-20"> {/* extra bottom padding for nav */}
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <img src={getLeagueLogo(league)} alt={league} className="w-6 h-6" />
            {league}
          </h2>
          {leagueMatches.map(match => {
            const outcomes = match.bookmakers?.[0]?.markets?.[0]?.outcomes || [];
            return (
              <div key={match.id} className="border p-3 rounded mb-2 bg-white shadow">
                <p className="mb-2 font-semibold flex items-center gap-2">
                  <img src={getTeamLogo(match.home_team)} alt={match.home_team} className="w-6 h-6" />
                  {match.home_team} vs{" "}
                  <img src={getTeamLogo(match.away_team)} alt={match.away_team} className="w-6 h-6" />
                  {match.away_team}
                </p>
                <div className="flex gap-2">
                  {outcomes.map(outcome => {
                    const betId = `${match.id}-${outcome.name}`;
                    const isSelected = betSlip.find(b => b.id === betId);
                    return (
                      <button
                        key={betId}
                        className={`px-3 py-1 rounded ${
                          isSelected ? "bg-red-500 text-white" : "bg-green-500 text-white"
                        }`}
                        onClick={() => toggleBet(match, outcome)}
                      >
                        {outcome.name} ({outcome.price})
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pb-20">
      {/* League Filter */}
      {["live", "upcoming", "past"].includes(activeTab) && (
        <div className="mb-4">
          <select
            className="border p-2 rounded"
            value={selectedLeague}
            onChange={e => setSelectedLeague(e.target.value)}
          >
            {leagues.map(l => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      {activeTab === "live" && renderMatches(matches.live)}
      {activeTab === "upcoming" && renderMatches(matches.upcoming)}
      {activeTab === "past" && renderMatches(matches.past)}

      {activeTab === "betslip" && (
        <div>
          <h2 className="text-lg font-bold mb-2">Your Bet Slip</h2>
          {betSlip.length === 0 ? (
            <p>No bets added yet.</p>
          ) : (
            <ul className="mb-4">
              {betSlip.map(b => (
                <li key={b.id} className="mb-2">
                  {b.match} → {b.outcome} @ {b.odds}
                </li>
              ))}
            </ul>
          )}
          <p className="font-bold mb-4">Total Odds: {getTotalOdds()}</p>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={placeBet}
          >
            Place Bet
          </button>
        </div>
      )}

      {activeTab === "history" && (
        <div>
          <h2 className="text-lg font-bold mb-2">Bet History</h2>
          {betHistory.length === 0 ? (
            <p>No bets placed yet.</p>
          ) : (
            <ul>
              {betHistory.map(h => (
                <li key={h.id} className="border p-3 rounded mb-2 bg-gray-50 shadow">
                  <p className="font-semibold mb-1">Total Odds: {h.totalOdds}</p>
                  <ul className="ml-4 list-disc">
                    {h.bets.map(b => (
                      <li key={b.id}>
                        {b.match} → {b.outcome} @ {b.odds}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex justify-around py-2">
        {[
          { key: "live", label: "⚽ Live" },
          { key: "upcoming", label: "⏳ Upcoming" },
          { key: "past", label: "📜 Past" },
          { key: "betslip", label: "🎟️ Slip" },
          { key: "history", label: "🏦 History" },
        ].map(tab => (
          <button
            key={tab.key}
            className={`flex-1 py-2 ${
              activeTab === tab.key ? "text-blue-600 font-bold" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
