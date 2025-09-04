export default async function handler(req, res) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY || "3f1cbd2315ee42188899deae4a6359a4";

  // ✅ Extract date range from query (e.g. /api/matches?dateFrom=2025-09-05&dateTo=2025-09-12)
  const { dateFrom, dateTo, competition } = req.query;

  // Defaults: today → next 7 days
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const from = dateFrom || today;
  const to = dateTo || nextWeek;

  // Default competition is PL (Premier League), allow user to change (e.g. "PL", "ELC")
  const comp = competition || "PL";

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${comp}/matches?dateFrom=${from}&dateTo=${to}`,
      {
        headers: { "X-Auth-Token": apiKey },
      }
    );

    let data = { matches: [] };

    if (response.ok) {
      data = await response.json();
    }

    // ✅ Add fallback demo matches if empty
    if (!data.matches || data.matches.length === 0) {
      return res.status(200).json({
        matches: [
          {
            id: 1,
            utcDate: `${from}T15:00:00Z`,
            homeTeam: { name: "Manchester United" },
            awayTeam: { name: "Liverpool FC" },
            competition: { name: comp === "PL" ? "Premier League" : "Championship" },
          },
          {
            id: 2,
            utcDate: `${to}T17:30:00Z`,
            homeTeam: { name: "Chelsea" },
            awayTeam: { name: "Arsenal" },
            competition: { name: comp === "PL" ? "Premier League" : "Championship" },
          },
        ],
      });
    }

    return res.status(200).json({ matches: data.matches });
  } catch (error) {
    console.error("API fetch error:", error);
    return res.status(500).json({
      matches: [],
      error: error.message,
    });
  }
}
