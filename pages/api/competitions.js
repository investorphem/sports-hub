export default async function handler(req, res) {
  try {
    const apiRes = await fetch("https://api.football-data.org/v4/competitions", {
      headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      return res.status(apiRes.status).json({ error: data.message || "Error fetching competitions" });
    }

    res.status(200).json({ competitions: data.competitions || [] });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
