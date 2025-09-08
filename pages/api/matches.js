export default async function handler(req, res) {
  const { start, end, league } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "Missing start or end date" });
  }

  try {
    const url = new URL("https://api.the-odds-api.com/v4/sports/soccer/odds");
    url.searchParams.set("regions", "uk");
    url.searchParams.set("markets", "h2h");
    url.searchParams.set("dateFormat", "iso");
    url.searchParams.set("oddsFormat", "decimal");
    url.searchParams.set("apiKey", process.env.ODDS_API_KEY);

    // optional league filter
    if (league && league !== "all") {
      url.searchParams.set("bookmakers", league);
    }

    const apiRes = await fetch(url.toString());

    if (!apiRes.ok) {
      const errorData = await apiRes.json();
      return res
        .status(apiRes.status)
        .json({ error: errorData.message || "Failed to fetch matches" });
    }

    const data = await apiRes.json();

    res.status(200).json({ matches: data || [] });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
