// pages/api/matches.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    const { sport = "soccer", region = "uk", mkt = "h2h" } = req.query;

    // Odds API endpoint
    const apiUrl = `https://api.the-odds-api.com/v4/sports/${sport}/odds/`;

    const response = await axios.get(apiUrl, {
      params: {
        apiKey: process.env.ODDS_API_KEY, // set in Vercel env variables
        regions: region,
        markets: mkt,
        oddsFormat: "decimal"
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching matches:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
}
