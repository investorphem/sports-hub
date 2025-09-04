// pages/api/matches.js
export default async function handler(req, res) {
  const { from, to, competition } = req.query;

  // Default competitions → Premier League (PL) + Championship (ELC)
  const comps = competition || "PL,ELC";

  try {
    const url = new URL("https://api.football-data.org/v4/matches");

    if (from) url.searchParams.append("dateFrom", from);
    if (to) url.searchParams.append("dateTo", to);
    if (comps) url.searchParams.append("competitions", comps);

    const response = await fetch(url.toString(), {
      headers: {
        "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY, // Securely stored in Vercel
      },
    });

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch matches" });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
