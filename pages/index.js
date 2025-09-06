// pages/index.js
import Head from "next/head";
import { useEffect, useState } from "react";

export default function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [leagueFilter, setLeagueFilter] = useState("all");

  const loadMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error("Error loading matches:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const filteredMatches =
    leagueFilter === "all"
      ? matches
      : matches.filter((m) =>
          m.sport_title.toLowerCase().includes(leagueFilter.toLowerCase())
        );

  return (
    <>
      <Head>
        <title>SportsHub Betting</title>
        {/* Embed meta for Farcaster */}
        <meta
          name="fc:miniapp"
          content='{"version":"1","imageUrl":"https://sports-hub-three.vercel.app","button":{"title":"⚽ Bet Now","action":{"type":"launch_miniapp","url":"https://sports-hub-three.vercel.app","name":"SportsHub","splashImageUrl":"https://sports-hub-three.vercel.app","splashBackgroundColor":"#ffffff"}}}'
        />
        <meta
          name="fc:frame"
          content='{"version":"1","imageUrl":"https://sports-hub-three.vercel.app","button":{"title":"⚽ Bet Now","action":{"type":"launch_frame","url":"https://sports-hub-three.vercel.app","name":"SportsHub","splashImageUrl":"https://sports-hub-three.vercel.app","splashBackgroundColor":"#ffffff"}}}'
        />
      </Head>

      <main style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
        <h1 style={{ textAlign: "center" }}>⚽ SportsHub Betting</h1>
        <p style={{ textAlign: "center" }}>
          Browse matches and odds. Soon: bet on-chain 🎉
        </p>

        {/* Filter */}
        <div style={{ margin: "20px 0", textAlign: "center" }}>
          <label htmlFor="league">Filter by League: </label>
          <select
            id="league"
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="soccer">Soccer</option>
            <option value="basketball">Basketball</option>
            <option value="tennis">Tennis</option>
          </select>
        </div>

        {/* Matches */}
        {loading ? (
          <p style={{ textAlign: "center" }}>Loading matches...</p>
        ) : filteredMatches.length === 0 ? (
          <p style={{ textAlign: "center" }}>No matches available.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {filteredMatches.map((match) => (
              <li
                key={match.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "12px",
                  padding: "15px",
                  marginBottom: "15px",
                  background: "#fff",
                }}
              >
                <h3>{match.sport_title}</h3>
                <p>
                  {match.home_team} vs {match.away_team}
                </p>
                {match.bookmakers?.[0]?.markets?.[0]?.outcomes?.map(
                  (outcome, idx) => (
                    <p key={idx}>
                      {outcome.name}: {outcome.price}
                    </p>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
