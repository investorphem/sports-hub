export default async function handler(req, res) {
  const { league } = req.query;

  if (!league) {
    return res.status(400).json({ error: "Missing league code" });
  }

  try {
    const apiRes = await fetch(
      `https://api.football-data.org/v4/competitions/${league}/standings`,
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
      }
    );

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: data.message || "Error fetching standings" });
    }

    res.status(200).json({ standings: data.standings || [] });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
