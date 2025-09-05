export default async function handler(req, res) {
  const { competition, dateFrom, dateTo } = req.query;

  if (!competition || !dateFrom || !dateTo) {
    return res.status(400).json({ error: "Missing competition or date range" });
  }

  try {
    const apiRes = await fetch(
      `https://api.football-data.org/v4/competitions/${competition}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY },
      }
    );

    if (!apiRes.ok) {
      const error = await apiRes.json();
      return res.status(apiRes.status).json({ error });
    }

    const data = await apiRes.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch matches" });
  }
}
