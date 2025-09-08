export default async function handler(req, res) {
  try {
    const apiKey = process.env.FOOTBALL_DATA_API_KEY || "3f1cbd2315ee42188899deae4a6359a4";

    const response = await fetch("https://api.the-odds-api.com/v4/sports/soccer/odds", {
      headers: { "x-api-key": apiKey },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch matches" });
    }

    const data = await response.json();

    // Normalize matches
    const matches = data.map((match) => ({
      id: match.id,
      sport_title: match.sport_title,
      commence_time: match.commence_time,
      status: getMatchStatus(match.commence_time),
      home_team: match.home_team,
      away_team: match.away_team,
      bookmakers: match.bookmakers || [],
    }));

    res.status(200).json({ matches });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Helper: classify matches
function getMatchStatus(commence_time) {
  const now = new Date();
  const start = new Date(commence_time);

  if (start > now) return "upcoming";

  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2 hours
  if (now >= start && now <= end) return "live";

  return "finished";
}
