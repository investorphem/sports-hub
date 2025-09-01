export default async function handler(req, res) {
  const { type } = req.query;
  const url =
    type === "live"
      ? "https://api.football-data.org/v4/matches?status=LIVE"
      : "https://api.football-data.org/v4/matches?status=SCHEDULED";

  try {
    const response = await fetch(url, {
      headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
    });
    const json = await response.json();

    const matches = json.matches.map(m => ({
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      score: m.score.fullTime.home !== null
        ? `${m.score.fullTime.home} - ${m.score.fullTime.away}`
        : "N/A",
      date: m.utcDate,
    }));

    res.status(200).json(matches);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
}
