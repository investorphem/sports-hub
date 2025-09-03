// /api/football.js
export default async function handler(req, res) {
  const { competitionId = "2021", dateFrom, dateTo } = req.query;

  // Default: today only if no range provided
  const today = new Date().toISOString().split("T")[0];
  const from = dateFrom || today;
  const to = dateTo || today;

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${competitionId}/matches?dateFrom=${from}&dateTo=${to}`,
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json({ matches: data.matches || [] });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
}
