export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "Match ID is required" });

  const url = `https://api.football-data.org/v4/matches/${id}`;

  try {
    const response = await fetch(url, {
      headers: { "X-Auth-Token": "3f1cbd2315ee42188899deae4a6359a4" }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch match" });
    }

    const data = await response.json();
    res.status(200).json(data.match || {});
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
