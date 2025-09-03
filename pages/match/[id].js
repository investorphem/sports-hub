
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function MatchDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMatch = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/match?id=${id}`);
      const data = await res.json();
      setMatch(data);
    } catch (error) {
      console.error("Error fetching match details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
    const interval = setInterval(fetchMatch, 30000); // auto-refresh every 30s
    return () => clearInterval(interval);
  }, [id]);

  if (loading && !match) return <p className="text-center mt-10">Loading match details...</p>;
  if (!match) return <p className="text-center mt-10">Match not found.</p>;

  const homeTeam = match.homeTeam?.name || "Home";
  const awayTeam = match.awayTeam?.name || "Away";
  const homeCrest = match.homeTeam?.crest;
  const awayCrest = match.awayTeam?.crest;

  const homeScore = match.score?.fullTime?.home ?? "-";
  const awayScore = match.score?.fullTime?.away ?? "-";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
      >
        ← Back
      </button>

      <h1 className="text-xl font-bold text-center mb-6">⚽ Match Details</h1>

      <div className="bg-white shadow-md rounded-lg p-6 text-center">
        <div className="flex justify-center items-center gap-6 mb-4">
          <div className="flex flex-col items-center">
            <img src={homeCrest} alt={homeTeam} className="w-10 h-10 object-contain" />
            <span>{homeTeam}</span>
          </div>

          <div className="text-2xl font-bold">
            {homeScore} : {awayScore}
          </div>

          <div className="flex flex-col items-center">
            <img src={awayCrest} alt={awayTeam} className="w-10 h-10 object-contain" />
            <span>{awayTeam}</span>
          </div>
        </div>

        <p className="text-gray-600">
          {match.status} • {new Date(match.utcDate).toLocaleString()}
        </p>
        {match.venue && <p className="mt-2">🏟 Venue: {match.venue}</p>}
        {match.referees?.length > 0 && (
          <p className="text-sm text-gray-500">Referee: {match.referees[0].name}</p>
        )}
      </div>

      {match.goals && match.goals.length > 0 && (
        <div className="mt-6 bg-white p-4 shadow-md rounded-lg">
          <h2 className="font-bold mb-3">⚽ Goals Timeline</h2>
          <ul className="space-y-2">
            {match.goals.map((goal, idx) => (
              <li key={idx} className="flex justify-between">
                <span>
                  {goal.minute}' - {goal.scorer?.name}
                </span>
                <span>{goal.team?.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
