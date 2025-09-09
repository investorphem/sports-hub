// pages/api/matches.js
export default async function handler(req, res) {
  const { tab } = req.query;
  const apiKey = process.env.ODDS_API_KEY;

  const region = "uk"; // adjust if you want us/eu/au
  const sports = [
    { key: "soccer_epl", name: "Premier League" },
    { key: "soccer_spain_la_liga", name: "La Liga" },
    { key: "soccer_italy_serie_a", name: "Serie A" },
    { key: "soccer_germany_bundesliga", name: "Bundesliga" },
    { key: "soccer_france_ligue_one", name: "Ligue 1" },
    { key: "soccer_uefa_champs_league", name: "Champions League" },
  ];

  let allMatches = [];

  for (const sport of sports) {
    let endpoint = "";

    if (tab === "live" || tab === "upcoming") {
      endpoint = `https://api.the-odds-api.com/v4/sports/${sport.key}/odds/?apiKey=${apiKey}&regions=${region}&markets=h2h&oddsFormat=decimal`;
    } else if (tab === "past") {
      endpoint = `https://api.the-odds-api.com/v4/sports/${sport.key}/odds-history/?apiKey=${apiKey}&regions=${region}&markets=h2h&oddsFormat=decimal`;
    }

    try {
      const response = await fetch(endpoint);
      if (!response.ok) continue; // skip failed sports
      const data = await response.json();

      const matches =
        data?.map((m) => ({
          homeTeam: m.home_team,
          awayTeam: m.away_team,
          competition: sport.name,
          odds: m.bookmakers?.[0]?.markets?.[0]?.outcomes || [],
        })) || [];

      allMatches = [...allMatches, ...matches];
    } catch (err) {
      console.error(`Failed to fetch ${sport.name}:`, err);
    }
  }

  const leagues = [...new Set(allMatches.map((m) => m.competition))];

  res.status(200).json({ matches: allMatches, leagues });
}
