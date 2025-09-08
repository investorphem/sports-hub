import { useState, useEffect } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [betSlip, setBetSlip] = useState([]);
  const [stake, setStake] = useState(0);
  const [betHistory, setBetHistory] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const savedHistory = localStorage.getItem("betHistory");
    if (savedHistory) setBetHistory(JSON.parse(savedHistory));
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matchesWithOdds");
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error("Error fetching matches:", err);
    }
    setLoading(false);
  };

  const addToBetSlip = (match, market, outcome) => {
    const bet = {
      matchId: match.id,
      home: match.home_team,
      away: match.away_team,
      league: match.sport_title,
      market,
      outcome,
      odds: outcome.price,
    };

    setBetSlip((prev) => [...prev, bet]);
  };

  const removeFromBetSlip = (index) => {
    setBetSlip((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateTotalOdds = () =>
    betSlip.reduce((total, b) => total * b.odds, 1);

  const placeBet = () => {
    if (betSlip.length === 0) return;

    const newBet = {
      id: Date.now(),
      bets: betSlip,
      stake,
      odds: calculateTotalOdds(),
      payout: stake * calculateTotalOdds(),
      time: new Date().toLocaleString(),
      status: "Pending",
    };

    const updatedHistory = [...betHistory, newBet];
    setBetHistory(updatedHistory);
    localStorage.setItem("betHistory", JSON.stringify(updatedHistory));

    setBetSlip([]);
    setStake(0);

    alert("✅ Bet placed successfully!");
  };

  const groupByLeague = (games) => {
    return games.reduce((groups, game) => {
      const league = game.sport_title || "Other";
      if (!groups[league]) groups[league] = [];
      groups[league].push(game);
      return groups;
    }, {});
  };

  const renderMatches = (status) => {
    const filtered = matches.filter((m) => m.status === status);
    const grouped = groupByLeague(filtered);

    return Object.keys(grouped).map((league) => (
      <div key={league} className="mb-6">
        <h2 className="text-lg font-bold mb-2">{league}</h2>
        {grouped[league].map((match) => (
          <div
            key={match.id}
            className="border p-3 mb-2 rounded bg-gray-50 shadow"
          >
            <p className="font-semibold">
              {match.home_team} vs {match.away_team}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {match.bookmakers?.[0]?.markets?.[0]?.outcomes?.map((o, i) => (
                <button
                  key={i}
                  onClick={() => addToBetSlip(match, match.bookmakers[0].title, o)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  {o.name} ({o.price})
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    ));
  };

  const filteredHistory = betHistory.filter((bet) =>
    filter === "All" ? true : bet.status === filter
  );

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">SportsHub</h1>

      {/* Tabs */}
      <div className="flex justify-around mb-4">
        {["upcoming", "live", "finished", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Load Matches */}
      {activeTab !== "history" && (
        <div className="mb-4 text-center">
          <button
            onClick={fetchMatches}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {loading ? "Loading..." : "Load Matches"}
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "upcoming" && renderMatches("upcoming")}
      {activeTab === "live" && renderMatches("live")}
      {activeTab === "finished" && renderMatches("finished")}

      {/* Bet Slip */}
      {activeTab !== "history" && betSlip.length > 0 && (
        <div className="border p-4 mt-4 rounded bg-white shadow">
          <h2 className="text-lg font-bold mb-2">Bet Slip</h2>
          {betSlip.map((b, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b py-1"
            >
              <span>
                {b.home} vs {b.away} - {b.outcome.name} ({b.odds})
              </span>
              <button
                onClick={() => removeFromBetSlip(i)}
                className="text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="mt-3">
            <input
              type="number"
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
              placeholder="Enter stake"
              className="border p-2 w-full mb-2 rounded"
            />
            <p>Total Odds: {calculateTotalOdds().toFixed(2)}</p>
            <p>
              Potential Payout: {(stake * calculateTotalOdds()).toFixed(2)}
            </p>
            <button
              onClick={placeBet}
              className="mt-2 w-full bg-blue-600 text-white py-2 rounded"
            >
              Place Bet
            </button>
          </div>
        </div>
      )}

      {/* Bet History */}
      {activeTab === "history" && (
        <div className="mt-4">
          <h2 className="text-lg font-bold mb-4">Bet History</h2>
          <div className="mb-4 flex space-x-2">
            {["All", "Pending", "Won", "Lost"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded ${
                  filter === f ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {filteredHistory.length === 0 ? (
            <p>No bets found.</p>
          ) : (
            filteredHistory.map((bet) => (
              <div
                key={bet.id}
                className="border p-3 mb-2 rounded bg-gray-50 shadow"
              >
                <p>
                  <strong>Time:</strong> {bet.time}
                </p>
                <p>
                  <strong>Stake:</strong> {bet.stake}
                </p>
                <p>
                  <strong>Total Odds:</strong> {bet.odds.toFixed(2)}
                </p>
                <p>
                  <strong>Potential Payout:</strong>{" "}
                  {bet.payout.toFixed(2)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`${
                      bet.status === "Won"
                        ? "text-green-600"
                        : bet.status === "Lost"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {bet.status}
                  </span>
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
