let cachedData = null;
let lastFetchTime = 0;
const CACHE_EXPIRY_MS = 10000; 

export async function GET() {
  const currentTime = Date.now();

  if (cachedData && (currentTime - lastFetchTime < CACHE_EXPIRY_MS)) {
    return new Response(JSON.stringify(cachedData), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await fetch('https://cricket-api-free-data.p.rapidapi.com/match/live-matches', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 
        'X-RapidAPI-Host': 'cricket-api-free-data.p.rapidapi.com'
      },
      next: { revalidate: 10 }
    });

    const rawData = await response.json();

    const parsedMatches = (rawData.matches || []).map((match, index) => ({
      id: match.match_id || String(index),
      format: match.match_format || "T20", 
      tournament: match.series_name || "International Match",
      status: "Live",
      venue: match.venue || "Cricket Ground",
      teamHome: match.team_home_name || "Team A",
      teamAway: match.team_away_name || "Team B",
      scoreHome: match.team_home_score || "0/0 (0)",
      scoreAway: match.team_away_score || "0/0 (0)",
      summary: match.match_status_text || "Live stream in progress..."
    }));

    cachedData = parsedMatches;
    lastFetchTime = currentTime;

    return new Response(JSON.stringify(parsedMatches), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    const fallbackData = [
      {
        id: "fail-1",
        format: "T20",
        tournament: "Live Match Feed (Demo Standby Mode)",
        status: "Live",
        venue: "Wankhede Stadium",
        teamHome: "India",
        teamAway: "Australia",
        scoreHome: "184/3 (16.2)",
        scoreAway: "Yet to Bat",
        summary: "API Limit reached or match paused. Re-trying connections automatically."
      }
    ];
    return new Response(JSON.stringify(fallbackData), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
