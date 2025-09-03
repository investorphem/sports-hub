export default async function handler(req, res) {
  const { competition = "2021", dateFrom, dateTo } = req.query;

  const today = new Date();
  const defaultFrom = today.toISOString().split("T")[0];
  const defaultTo = new Date(today.setDate(today.getDate() + 7))
    .toISOString()
    .split("T")[0];

  const from = dateFrom || defaultFrom;
  const to = dateTo || defaultTo;

  let url = `https://api.football-data.org/v4/competitions/${competition}/matches?dateFrom=${from}&dateTo=${to}`;

  try {
    const response = await fetch(url, {
      headers: { "X-Auth-Token": "3f1cbd2315ee42188899deae4a6359a4" }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Failed to fetch data" });
    }

    const data = await response.json();
    res.status(200).json({ matches: data.matches || [] });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
