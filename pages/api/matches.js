// pages/api/matches.js
export default async function handler(req, res) {
  try {
    const sport = "soccer_epl"; // Example: Premier League
    const region = "uk";        // Regions: us, uk, eu, au
    const markets = "h2h";      // head-to-head odds

    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/${sport}/odds/?regions=${region}&markets=${markets}&apiKey=${process.env.ODDS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch odds");
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Failed to load matches" });
  }
}
