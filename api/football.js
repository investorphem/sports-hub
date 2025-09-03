// api/football.js
export default async function handler(req, res) {
  const { type } = req.query; // ?type=live or ?type=fixtures
  const API_KEY = process.env.FOOTBALL_API_KEY; // set this in Vercel

  // Choose endpoint based on requested type
  const url =
    type === "live"
      ? "https://api.football-data.org/v4/matches?status=LIVE"
      : // fixtures: default fetch today's fixtures (dateFrom/dateTo)
        (() => {
          const today = new Date().toISOString().slice(0, 10);
          return `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${today}`;
        })();

  try {
    const r = await fetch(url, {
      headers: { "X-Auth-Token": API_KEY, Accept: "application/json" },
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ error: "upstream_error", detail: text });
    }

    const json = await r.json();

    // Normalize into a simple array of matches for the frontend
    const matches = (json.matches || []).map((m) => ({
      id: m.id,
      competition: m.competition?.name ?? "",
      homeTeam: m.homeTeam?.name ?? "Home",
      awayTeam: m.awayTeam?.name ?? "Away",
      status: m.status,
      scoreFull:
        m.score?.fullTime?.home !== null && m.score?.fullTime?.home !== undefined
          ? `${m.score.fullTime.home} - ${m.score.fullTime.away}`
          : null,
      utcDate: m.utcDate,
    }));

    // short cache on Vercel edge + allow stale while revalidate
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=30");
    return res.status(200).json({ matches });
  } catch (e) {
    console.error("football api error", e);
    return res.status(500).json({ error: "server_error", message: e.message });
  }
}
