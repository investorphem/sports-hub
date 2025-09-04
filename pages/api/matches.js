export default async function handler(req, res) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY || "3f1cbd2315ee42188899deae4a6359a4";

  // Set date range: today → +7 days
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/PL/matches?dateFrom=${today}&dateTo=${nextWeek}`,
      {
        headers: { "X-Auth-Token": apiKey },
      }
    );

    if (!response.ok) {
      throw new Error(`Football API error: ${response.status}`);
    }

    const data = await response.json();

    res.status(200).json({
      matches: data.matches || [],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to fetch matches",
      details: error.message,
    });
  }
}
