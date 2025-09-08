import { useEffect, useState } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("live");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [betSlip, setBetSlip] = useState([]);
  const [betHistory, setBetHistory] = useState([]);

  // Load bet slip & history from localStorage
  useEffect(() => {
    const savedSlip = localStorage.getItem("betSlip");
    const savedHistory = localStorage.getItem("betHistory");
    if (savedSlip) setBetSlip(JSON.parse(savedSlip));
    if (savedHistory) setBetHistory(JSON.parse(savedHistory));
  }, []);

  // Save bet slip & history automatically
  useEffect(() => {
    localStorage.setItem("betSlip", JSON.stringify(betSlip));
  }, [betSlip]);

  useEffect(() => {
    localStorage.setItem("betHistory", JSON.stringify(betHistory));
  }, [betHistory]);

  // Fetch matches
  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (err) {
        console.error("Error fetching matches:", err);
      }
    }
    fetchMatches();
  }, []);

  const addToBetSlip = (match, outcome, odds) => {
    const newSlip = [...betSlip, { match, outcome, odds }];
    setBetSlip(newSlip);
  };

  const removeFromBetSlip = (index) => {
    const newSlip = betSlip.filter((_, i) => i !== index);
    setBetSlip(newSlip);
  };

  const placeBet = (stake) => {
    if (!stake || betSlip.length === 0) return;
    const totalOdds = betSlip.reduce((acc, b) => acc * b.odds, 1).toFixed(2);
    const potentialWin = (stake * totalOdds).toFixed(2);
    const newHistory = [
      {
        bets: betSlip,
        stake,
        totalOdds,
        potentialWin,
        date: new Date().toISOString(),
      },
      ...betHistory,
    ];
    setBetHistory(newHistory);
    setBetSlip([]);
    localStorage.removeItem("betSlip");
  };

  // Filter matches by tab + league
  const filteredMatches = matches.filter((m) => {
    const now = new Date();
    const matchDate = new Date(m.utcDate);
    if (activeTab === "live" && m.status !== "LIVE") return false;
    if (activeTab === "upcoming" && !(matchDate > now)) return false;
    if (activeTab === "past" && !(matchDate < now)) return false;
    if (selectedLeague !== "all" && m.competition?.name !== selectedLeague)
      return false;
    return true;
  });

  const leagues = [
    ...new Set(matches.map((m) => m.competition?.name).filter(Boolean)),
  ];

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex space-x-3 mb-4">
        {[
          { key: "live", label: "⚡ Live" },
          { key: "upcoming", label: "⏳ Upcoming" },
          { key: "past", label: "📜 Past" },
          { key: "all", label: "🌍 All Leagues" },
          { key: "slip", label: "🎟️ Bet Slip" },
          { key: "history", label: "📖 Bet History" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1 rounded ${
              activeTab === tab.key ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* League filter */}
      {["live", "upcoming", "past", "all"].includes(activeTab) && (
        <div className="mb-3">
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="all">All Leagues</option>
            {leagues.map((league, i) => (
              <option key={i} value={league}>
                {league}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Match list */}
      {["live", "upcoming", "past", "all"].includes(activeTab) && (
        <div className="space-y-3">
          {filteredMatches.length === 0 ? (
            <p className="text-gray-600">No matches available.</p>
          ) : (
            filteredMatches.map((m, i) => (
              <div key={i} className="border p-3 rounded shadow-sm bg-white">
                <p className="font-semibold">
                  {m.homeTeam.name} vs {m.awayTeam.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(m.utcDate).toLocaleString()} |{" "}
                  {m.competition?.name}
                </p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() =>
                      addToBetSlip(
                        `${m.homeTeam.name} vs ${m.awayTeam.name}`,
                        "Home Win",
                        2.1
                      )
                    }
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Home (2.1)
                  </button>
                  <button
                    onClick={() =>
                      addToBetSlip(
                        `${m.homeTeam.name} vs ${m.awayTeam.name}`,
                        "Draw",
                        3.2
                      )
                    }
                    className="px-2 py-1 bg-yellow-500 text-white rounded text-sm"
                  >
                    Draw (3.2)
                  </button>
                  <button
                    onClick={() =>
                      addToBetSlip(
                        `${m.homeTeam.name} vs ${m.awayTeam.name}`,
                        "Away Win",
                        2.8
                      )
                    }
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Away (2.8)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Bet Slip */}
      {activeTab === "slip" && (
        <div>
          <h2 className="font-bold mb-2">Your Bet Slip</h2>
          {betSlip.length === 0 ? (
            <p className="text-gray-600">No bets added.</p>
          ) : (
            <div className="space-y-2">
              {betSlip.map((b, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <p className="text-sm">
                    {b.match} - {b.outcome}{" "}
                    <span className="font-semibold">({b.odds})</span>
                  </p>
                  <button
                    onClick={() => removeFromBetSlip(i)}
                    className="text-red-500 text-sm"
                  >
                    ❌
                  </button>
                </div>
              ))}
              <div className="mt-3">
                <input
                  type="number"
                  placeholder="Enter stake"
                  id="stakeInput"
                  className="border p-2 rounded w-full mb-2"
                />
                <button
                  onClick={() =>
                    placeBet(parseFloat(document.getElementById("stakeInput").value))
                  }
                  className="w-full bg-blue-600 text-white p-2 rounded"
                >
                  Place Bet
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bet History */}
      {activeTab === "history" && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Bet History</h2>
            {betHistory.length > 0 && (
              <button
                onClick={() => {
                  if (
                    window.confirm("Are you sure you want to clear all bet history?")
                  ) {
                    setBetHistory([]);
                    localStorage.removeItem("betHistory");
                  }
                }}
                className="text-red-500 text-sm underline"
              >
                Clear History
              </button>
            )}
          </div>
          {betHistory.length === 0 ? (
            <p className="text-gray-600">No bets placed yet.</p>
          ) : (
            <div className="space-y-3">
              {betHistory.map((entry, idx) => (
                <div key={idx} className="border p-3 rounded bg-white shadow-sm">
                  <p className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleString()}
                  </p>
                  <div className="mt-1">
                    {entry.bets.map((b, i) => (
                      <p key={i} className="text-sm">
                        {b.match} - {b.outcome}{" "}
                        <span className="font-semibold">({b.odds})</span>
                      </p>
                    ))}
                  </div>
                  <div className="mt-2 text-sm">
                    <p>
                      Stake: <span className="font-semibold">{entry.stake}</span>
                    </p>
                    <p>
                      Total Odds:{" "}
                      <span className="font-semibold">{entry.totalOdds}</span>
                    </p>
                    <p>
                      Potential Win:{" "}
                      <span className="font-semibold">{entry.potentialWin}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
