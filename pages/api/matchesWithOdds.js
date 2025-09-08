export default async function handler(req, res) {
  try {
    const apiKey = process.env.FOOTBALL_API_KEY; // set in Vercel env vars
    const url = `https://api.football-data.org/v4/matches?status=SCHEDULED,LIVE,IN_PLAY,PAUSED,FINISHED`;

    const response = await fetch(url, {
      headers: { "X-Auth-Token": apiKey },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    res.status(200).json({
      matches: data.matches || [],
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
}
