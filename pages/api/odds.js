export default async function handler(req, res) {
  const { league } = req.query;

  if (!league) {
    return res.status(400).json({ error: "League is required" });
  }

  try {
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/soccer_${league.toLowerCase()}/odds/?regions=uk&oddsFormat=decimal&apiKey=${process.env.ODDS_API_KEY}`
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || "Failed to fetch odds" });
    }

    res.status(200).json({ odds: data });
  } catch (error) {
    console.error("Odds fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
