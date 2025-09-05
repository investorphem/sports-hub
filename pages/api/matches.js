export default async function handler(req, res) {
  const { competition, dateFrom, dateTo } = req.query;

  // Map supported competitions
  const competitionMap = {
    premier: "PL",       // Premier League
    championship: "ELC", // Championship
  };

  // Default to Premier League if not provided
  const comp = competitionMap[competition] || "PL";

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY, // ✅ Keep API key safe
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Football API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json({ matches: data.matches || [] });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
}
