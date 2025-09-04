export default async function handler(req, res) {
  try {
    const apiKey = "3f1cbd2315ee42188899deae4a6359a4"; // your football-data.org key
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Fetch matches for Premier League + Championship
    const response = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${nextWeek}`,
      {
        headers: { "X-Auth-Token": apiKey },
      }
    );

    if (!response.ok) {
      throw new Error(`Football API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter Premier League (PL) and Championship (ELC)
    const filtered = (data.matches || []).filter(
      (m) =>
        m.competition?.code === "PL" || m.competition?.code === "ELC"
    );

    // Format matches
    const matches = filtered.map((m) => ({
      homeTeam: m.homeTeam?.name,
      awayTeam: m.awayTeam?.name,
      date: new Date(m.utcDate).toLocaleString(),
      competition: m.competition?.name,
    }));

    res.status(200).json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
