import Link from "next/link";

// Inside your matches.map loop
<li key={match.id} style={{ marginBottom: "10px" }}>
  <Link href={`/match/${match.id}`}>
    <strong>
      {match.homeTeam.name} vs {match.awayTeam.name}
    </strong>
  </Link>
  <br />
  {new Date(match.utcDate).toLocaleString()} <br />
  Status: {match.status}
</li>