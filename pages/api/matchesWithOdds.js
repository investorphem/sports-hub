export default async function handler(req, res) {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "Missing start or end date" });
  }

  try {
    // Fetch matches from The Odds API
    const apiRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${process.env.ODDS_API_KEY}&regions=eu&markets=h2h&dateFormat=iso&oddsFormat=decimal`
    );

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res
        .status(apiRes.status)
        .json({ error: data.message || "Error fetching matches" });
    }

    // Filter matches by date range
    const filteredMatches = data.filter((match) => {
      const matchDate = new Date(match.commence_time);
      return (
        matchDate >= new Date(start) &&
        matchDate <= new Date(end)
      );
    });

    // Map data into simpler format
    const matches = filteredMatches.map((match) => ({
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      date: match.commence_time,
      status: "Scheduled",
      odds: match.bookmakers?.[0]?.markets?.[0]?.outcomes
        ? {
            home: match.bookmakers[0].markets[0].outcomes.find(
              (o) => o.name === match.home_team
            )?.price,
            draw: match.bookmakers[0].markets[0].outcomes.find(
              (o) => o.name === "Draw"
            )?.price,
            away: match.bookmakers[0].markets[0].outcomes.find(
              (o) => o.name === match.away_team
            )?.price,
          }
        : null,
    }));

    res.status(200).json({ matches });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
