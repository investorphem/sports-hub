import stringSimilarity from "string-similarity";

export default async function handler(req, res) {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: "Missing start or end date" });
  }

  try {
    // Fetch football-data matches (all competitions in range)
    const matchRes = await fetch(
      `https://api.football-data.org/v4/matches?dateFrom=${start}&dateTo=${end}`,
      {
        headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY },
      }
    );
    const matchData = await matchRes.json();

    if (!matchRes.ok) {
      return res
        .status(matchRes.status)
        .json({ error: matchData.message || "Error fetching matches" });
    }

    // Odds API leagues we want to cover
    const leagues = [
      "soccer_epl", // Premier League
      "soccer_efl_champ", // Championship
      "soccer_spain_la_liga", // La Liga
      "soccer_italy_serie_a", // Serie A
      "soccer_germany_bundesliga", // Bundesliga
      "soccer_uefa_champs_league", // Champions League
    ];

    // Fetch odds for each league in parallel
    const oddsResults = await Promise.all(
      leagues.map((league) =>
        fetch(
          `https://api.the-odds-api.com/v4/sports/${league}/odds/?regions=eu&markets=h2h&apiKey=${process.env.ODDS_API_KEY}`
        ).then((r) => r.json())
      )
    );

    // Merge all odds into one array
    const oddsData = oddsResults.flat();

    // Fuzzy match function
    function findBestOdds(home, away) {
      let bestMatch = null;
      let bestScore = 0;

      oddsData.forEach((game) => {
        const scoreHome = stringSimilarity.compareTwoStrings(
          home.toLowerCase(),
          game.home_team.toLowerCase()
        );
        const scoreAway = stringSimilarity.compareTwoStrings(
          away.toLowerCase(),
          game.away_team.toLowerCase()
        );

        const avgScore = (scoreHome + scoreAway) / 2;
        if (avgScore > bestScore) {
          bestScore = avgScore;
          bestMatch = game;
        }
      });

      if (bestScore < 0.5) return null; // too weak

      const markets = bestMatch.bookmakers?.[0]?.markets?.[0]?.outcomes || [];
      return {
        home: markets.find(
          (m) =>
            m.name.toLowerCase().includes("home") ||
            m.name === bestMatch.home_team
        )?.price,
        away: markets.find(
          (m) =>
            m.name.toLowerCase().includes("away") ||
            m.name === bestMatch.away_team
        )?.price,
        draw: markets.find((m) => m.name === "Draw")?.price,
      };
    }

    // Merge matches with odds
    const matchesWithOdds = (matchData.matches || []).map((m) => ({
      id: m.id,
      competition: m.competition?.name || "Unknown League",
      homeTeam: m.homeTeam.name,
      awayTeam: m.awayTeam.name,
      utcDate: m.utcDate,
      odds: findBestOdds(m.homeTeam.name, m.awayTeam.name),
    }));

    res.status(200).json({ matches: matchesWithOdds });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
