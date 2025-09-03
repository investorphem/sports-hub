import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function MatchDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function fetchMatch() {
      setLoading(true);
      try {
        const res = await fetch(`/api/match?id=${id}`);
        const data = await res.json();
        setMatch(data);
      } catch (err) {
        console.error("Error fetching match:", err);
      }
      setLoading(false);
    }

    fetchMatch();
  }, [id]);

  if (loading) return <p>Loading match details...</p>;
  if (!match) return <p>No match found.</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>
        ⚽ {match.homeTeam.name} vs {match.awayTeam.name}
      </h1>
      <p>
        <strong>Date:</strong>{" "}
        {new Date(match.utcDate).toLocaleString()}
      </p>
      <p>
        <strong>Status:</strong> {match.status}
      </p>
      <p>
        <strong>Competition:</strong> {match.competition.name}
      </p>
      <p>
        <strong>Venue:</strong> {match.venue || "TBA"}
      </p>

      {match.score.fullTime.homeTeam !== null && (
        <p>
          <strong>Final Score:</strong>{" "}
          {match.score.fullTime.homeTeam} - {match.score.fullTime.awayTeam}
        </p>
      )}

      <button onClick={() => router.back()} style={{ marginTop: "20px" }}>
        ⬅ Back
      </button>
    </div>
  );
}
