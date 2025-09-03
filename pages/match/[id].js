import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MatchDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [match, setMatch] = useState(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/match?id=${id}`)
        .then((res) => res.json())
        .then((data) => setMatch(data));
    }
  }, [id]);

  if (!match) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>⚽ {match.homeTeam.name} vs {match.awayTeam.name}</h1>
      <p>Date: {match.utcDate}</p>
      <p>Status: {match.status}</p>
      {match.score && (
        <p>
          Score: {match.score.fullTime.home} - {match.score.fullTime.away}
        </p>
      )}
      <button onClick={() => router.back()}>⬅ Back</button>
    </div>
  );
}
