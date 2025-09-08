export default async function handler(req, res) {
  try {
    const apiKey = process.env.ODDS_API_KEY; // Put this in Vercel environment
    const sport = "soccer"; // or use "soccer_epl" for just Premier League
    const region = "uk"; // regions: uk, us, eu, au
    const markets = "h2h"; // head-to-head (1X2 betting)
    const oddsFormat = "decimal"; // decimal odds
    const dateFormat = "iso";

    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${region}&markets=${markets}&oddsFormat=${oddsFormat}&dateFormat=${dateFormat}&apiKey=${apiKey}`
    );

    if (!response.ok) {
      const errorData = await response.text();
      return res
        .status(response.status)
        .json({ error: "Failed to fetch odds", details: errorData });
    }

    const data = await response.json();

    // Normalize to match structure expected by frontend
    const matches = data.map((game) => ({
      id: game.id,
      utcDate: game.commence_time,
      competition: { name: game.sport_title },
      homeTeam: { name: game.home_team },
      awayTeam: { name: game.away_team },
      status: new Date(game.commence_time) <= new Date() ? "LIVE" : "UPCOMING",
      bookmakers: game.bookmakers || [],
    }));

    res.status(200).json({ matches });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
