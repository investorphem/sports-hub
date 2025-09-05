import { useState } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");

  const fetchMatches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/matches?competition=PL");
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      setError("Failed to fetch matches");
    }
    setLoading(false);
  };

  const openBetModal = (match) => {
    setSelectedMatch(match);
    setBetAmount("");
    setSelectedTeam("");
  };

  const placeBet = () => {
    alert(
      `Bet placed!\nMatch: ${selectedMatch.homeTeam.name} vs ${selectedMatch.awayTeam.name}\nTeam: ${selectedTeam}\nAmount: ${betAmount} tokens`
    );
    setSelectedMatch(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">⚽ Sports Hub</h1>
      <button
        onClick={fetchMatches}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4"
      >
        Load Matches
      </button>

      {loading && <p className="text-center">Loading matches...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      <div className="space-y-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white p-4 rounded-lg shadow-md text-center"
          >
            <p className="font-semibold">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(match.utcDate).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">Status: {match.status}</p>
            <button
              onClick={() => openBetModal(match)}
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded-lg"
            >
              Bet Now
            </button>
          </div>
        ))}
      </div>

      {selectedMatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-2">Place Your Bet</h2>
            <p className="mb-2">
              {selectedMatch.homeTeam.name} vs {selectedMatch.awayTeam.name}
            </p>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="border w-full p-2 mb-2"
            >
              <option value="">Choose Team</option>
              <option value={selectedMatch.homeTeam.name}>
                {selectedMatch.homeTeam.name}
              </option>
              <option value={selectedMatch.awayTeam.name}>
                {selectedMatch.awayTeam.name}
              </option>
            </select>
            <input
              type="number"
              placeholder="Enter amount"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="border w-full p-2 mb-2"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setSelectedMatch(null)}
                className="bg-gray-400 text-white px-3 py-1 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={placeBet}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg"
                disabled={!selectedTeam || !betAmount}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
