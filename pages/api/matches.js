// pages/api/matches.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    const { sport = "soccer", region = "uk", mkt = "h2h" } = req.query;

    const response = await axios.get("https://api.the-odds-api.com/v4/sports/soccer/odds", {
      params: {
        apiKey: process.env.ODDS_API_KEY,
        regions: region,
        markets: mkt,
        oddsFormat: "decimal",
        dateFormat: "iso"
      }
    });

    let matches = response.data || [];

    // Basic fuzzy match utility (instead of string-similarity)
    function isSimilar(str1, str2) {
      if (!str1 || !str2) return false;
      str1 = str1.toLowerCase();
      str2 = str2.toLowerCase();
      return str1.includes(str2) || str2.includes(str1);
    }

    // Example: filter by league if query param `league` is passed
    if (req.query.league) {
      const leagueQuery = req.query.league.toLowerCase();
      matches = matches.filter((match) =>
        isSimilar(match.sport_title || "", leagueQuery) ||
        isSimilar(match.home_team || "", leagueQuery) ||
        isSimilar(match.away_team || "", leagueQuery)
      );
    }

    res.status(200).json({ matches });
  } catch (error) {
    console.error("Error fetching matches:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
}
