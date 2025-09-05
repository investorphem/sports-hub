export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing match ID" });
  }

  try {
    const apiRes = await fetch(`https://api.football-data.org/v4/matches/${id}`, {
      headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: data.message || "Error fetching match data" });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
