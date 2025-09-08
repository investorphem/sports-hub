export default async function handler(req, res) {
  try {
    const apiRes = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_epl/odds?regions=eu&oddsFormat=decimal`,
      {
        headers: { "X-API-Key": process.env.ODDS_API_KEY },
      }
    );

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res
        .status(apiRes.status)
        .json({ error: data.message || "Error fetching odds" });
    }

    const matches =
      data?.map((game) => ({
        league: game.sport_title,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        odds:
          game.bookmakers?.[0]?.markets?.[0]?.outcomes?.reduce(
            (acc, outcome) => {
              acc[outcome.name] = outcome.price;
              return acc;
            },
            {}
          ) || {},
      })) || [];

    res.status(200).json({ matches });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
