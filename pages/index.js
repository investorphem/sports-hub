import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [betSlip, setBetSlip] = useState([]);
  const [betHistory, setBetHistory] = useState([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await axios.get("/api/matches");
        setMatches(res.data || []);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  // Save slip in localStorage
  useEffect(() => {
    if (betSlip.length > 0) {
      localStorage.setItem("betSlip", JSON.stringify(betSlip));
    }
  }, [betSlip]);

  // Load saved slip
  useEffect(() => {
    const savedSlip = localStorage.getItem("betSlip");
    if (savedSlip) setBetSlip(JSON.parse(savedSlip));
  }, []);

  const handleSelectBet = (match, outcome, odd) => {
    if (!odd) return;

    // Remove previous selection for this match (no duplicate bets)
    const updatedSlip = betSlip.filter((b) => b.id !== match.id);

    // Add new bet
    updatedSlip.push({
      id: match.id,
      teams: `${match.home_team} vs ${match.away_team}`,
      outcome,
      odd,
    });

    setBetSlip(updatedSlip);
  };

  const placeBet = () => {
    if (betSlip.length === 0) return;

    const totalOdds = betSlip.reduce((acc, bet) => acc * bet.odd, 1);

    const newBet = {
      id: Date.now(),
      selections: [...betSlip],
      totalOdds,
      payout: (10 * totalOdds).toFixed(2), // assume stake = 10
      time: new Date().toLocaleString(),
    };

    setBetHistory([newBet, ...betHistory]);
    setBetSlip([]);
    localStorage.removeItem("betSlip");
  };

  // Team logo fallback
  const getTeamLogo = (team) =>
    `https://api.logoapi.com/football/${encodeURIComponent(team)}.png`;

  const handleImageError = (e) => {
    e.target.src = "/default-logo.png";
  };

  // League logo fallback
  const getLeagueLogo = (league) =>
    `https://api.logoapi.com/leagues/${encodeURIComponent(league)}.png`;

  const handleLeagueError = (e) => {
    e.target.src = "/default-league.png";
  };

  // Group matches by league
  const groupedMatches = matches.reduce((groups, match) => {
    const league = match.league || "Other";
    if (!groups[league]) groups[league] = [];
    groups[league].push(match);
    return groups;
  }, {});

  if (loading) return <p className="text-center mt-10">Loading matches...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-center mb-6">⚽ SportsHub Betting</h1>

      {/* Matches grouped by league */}
      {Object.entries(groupedMatches).map(([league, leagueMatches]) => (
        <div key={league} className="mb-8">
          {/* League header */}
          <div className="flex items-center gap-2 mb-3">
            <img
              src={getLeagueLogo(league)}
              alt={league}
              onError={handleLeagueError}
              className="w-8 h-8"
            />
            <h2 className="text-lg font-semibold">{league}</h2>
          </div>

          {/* League matches */}
          <div className="space-y-6">
            {leagueMatches.map((match) => {
              const homeOdd =
                match.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(
                  (o) => o.name === match.home_team
                )?.price;

              const awayOdd =
                match.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(
                  (o) => o.name === match.away_team
                )?.price;

              const drawOdd =
                match.bookmakers?.[0]?.markets?.[0]?.outcomes?.find(
                  (o) => o.name === "Draw"
                )?.price;

              return (
                <div key={match.id} className="p-4 border rounded shadow">
                  {/* Match header */}
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={getTeamLogo(match.home_team)}
                        alt={match.home_team}
                        onError={handleImageError}
                        className="w-6 h-6"
                      />
                      <span className="font-semibold">{match.home_team}</span>
                    </div>
                    <span className="text-gray-500">vs</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={getTeamLogo(match.away_team)}
                        alt={match.away_team}
                        onError={handleImageError}
                        className="w-6 h-6"
                      />
                      <span className="font-semibold">{match.away_team}</span>
                    </div>
                  </div>

                  {/* Odds buttons aligned under teams */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <button
                      className={`p-2 rounded ${
                        betSlip.find(
                          (b) => b.id === match.id && b.outcome === "Home"
                        )
                          ? "bg-green-600 text-white"
                          : "bg-gray-200"
                      }`}
                      onClick={() => handleSelectBet(match, "Home", homeOdd)}
                    >
                      {homeOdd || "-"} <br /> Home
                    </button>

                    <button
                      className={`p-2 rounded ${
                        betSlip.find(
                          (b) => b.id === match.id && b.outcome === "Draw"
                        )
                          ? "bg-green-600 text-white"
                          : "bg-gray-200"
                      }`}
                      onClick={() => handleSelectBet(match, "Draw", drawOdd)}
                    >
                      {drawOdd || "-"} <br /> Draw
                    </button>

                    <button
                      className={`p-2 rounded ${
                        betSlip.find(
                          (b) => b.id === match.id && b.outcome === "Away"
                        )
                          ? "bg-green-600 text-white"
                          : "bg-gray-200"
                      }`}
                      onClick={() => handleSelectBet(match, "Away", awayOdd)}
                    >
                      {awayOdd || "-"} <br /> Away
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Bet Slip */}
      <div className="mt-6 p-4 border rounded shadow">
        <h2 className="font-bold mb-2">🧾 Bet Slip</h2>
        {betSlip.length === 0 ? (
          <p>No selections yet.</p>
        ) : (
          <>
            {betSlip.map((bet) => (
              <p key={bet.id}>
                {bet.teams} — {bet.outcome} @ {bet.odd}
              </p>
            ))}
            <button
              onClick={placeBet}
              className="mt-3 w-full bg-blue-600 text-white p-2 rounded"
            >
              Place Bet
            </button>
          </>
        )}
      </div>

      {/* Bet History */}
      <div className="mt-6 p-4 border rounded shadow">
        <h2 className="font-bold mb-2">📜 Bet History</h2>
        {betHistory.length === 0 ? (
          <p>No bets placed yet.</p>
        ) : (
          betHistory.map((bet) => (
            <div key={bet.id} className="border-b py-2">
              <p className="font-semibold">
                {bet.selections
                  .map((s) => `${s.teams} (${s.outcome})`)
                  .join(", ")}
              </p>
              <p>Total Odds: {bet.totalOdds.toFixed(2)}</p>
              <p>Payout: {bet.payout}</p>
              <p className="text-sm text-gray-500">{bet.time}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
