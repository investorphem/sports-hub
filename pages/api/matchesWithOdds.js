export default async function handler(req, res) {
  const { start, end, league } = req.query;

  if (!start || !end || !league) {
    return res.status(400).json({ error: "Missing start, end, or league" });
  }

  try {
    // Fetch fixtures from Football-Data API
    const matchesRes = await fetch(
      `https://api.football-data.org/v4/competitions/${league}/matches?dateFrom=${start}&dateTo=${end}`,
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
      }
    );
    const matchesData = await matchesRes.json();

    if (!matchesRes.ok) {
      return res.status(matchesRes.status).json({ error: matchesData.message || "Error fetching matches" });
    }

    // Fetch odds from The Odds API
    const oddsRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_${league.toLowerCase()}/odds/?regions=uk&oddsFormat=decimal&apiKey=${process.env.ODDS_API_KEY}`
    );
    const oddsData = await oddsRes.json();

    if (!oddsRes.ok) {
      return res.status(oddsRes.status).json({ error: oddsData.message || "Error fetching odds" });
    }

    // Match odds with fixtures
    const mergedMatches = matchesData.matches.map((match) => {
      const odds = oddsData.find(
        (o) =>
          o.home_team.toLowerCase().includes(match.homeTeam.name.toLowerCase().split(" ")[0]) &&
          o.away_team.toLowerCase().includes(match.awayTeam.name.toLowerCase().split(" ")[0])
      );

      return {
        ...match,
        odds: odds
          ? {
              home: odds.bookmakers[0]?.markets[0]?.outcomes.find((o) => o.name === odds.home_team)?.price || "-",
              draw: odds.bookmakers[0]?.markets[0]?.outcomes.find((o) => o.name === "Draw")?.price || "-",
              away: odds.bookmakers[0]?.markets[0]?.outcomes.find((o) => o.name === odds.away_team)?.price || "-",
            }
          : null,
      };
    });

    res.status(200).json({ matches: mergedMatches });
  } catch (error) {
    console.error("Merge error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
