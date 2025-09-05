export default async function handler(req, res) {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "Start and end dates are required" });
  }

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${start}&dateTo=${end}`,
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY, // your API key in Vercel env
        },
      }
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch matches" });
    }

    const data = await response.json();

    // Filter only Premier League (2021) and Championship (2016)
    const filteredMatches = (data.matches || []).filter((match) =>
      ["2021", "2016"].includes(String(match.competition.id))
    );

    res.status(200).json({ matches: filteredMatches });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
