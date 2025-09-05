export default async function handler(req, res) {
  const { start, end, league } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "Missing start or end date" });
  }

  try {
    const apiRes = await fetch(
      `https://api.football-data.org/v4/competitions/${league}/matches?dateFrom=${start}&dateTo=${end}`,
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
      }
    );

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res
        .status(apiRes.status)
        .json({ error: data.message || "Error fetching matches" });
    }

    res.status(200).json({ matches: data.matches || [] });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
