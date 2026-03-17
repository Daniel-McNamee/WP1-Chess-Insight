const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 3000;

// GET /api/player/:username
app.get("/api/player/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const response = await axios.get(
      `https://api.chess.com/pub/player/${username}`
    );

    const data = response.data;

    res.json({
      username: data.username,
      name: data.name,
      title: data.title,
      avatar: data.avatar,
      country: data.country?.split('/').pop(),
      joined: data.joined
    });
  } catch (error) {
    res.status(404).json({ error: "Player not found" });
  }
});

// GET /api/player/:username/stats
app.get("/api/player/:username/stats", async (req, res) => {
  const { username } = req.params;

  try {
    const response = await axios.get(
      `https://api.chess.com/pub/player/${username}/stats`
    );

    const stats = response.data;

    res.json({
      username,
      blitz: stats.chess_blitz?.last?.rating || null,
      rapid: stats.chess_rapid?.last?.rating || null,
      bullet: stats.chess_bullet?.last?.rating || null
    });
  } catch (error) {
    res.status(404).json({ error: "Stats not found" });
  }
});


// GET recent games (last 15)
app.get("/api/player/:username/games", async (req, res) => {
  const { username } = req.params;

  try {
    // get archive list
    const archivesRes = await axios.get(
      `https://api.chess.com/pub/player/${username}/games/archives`
    );

    const archives = archivesRes.data.archives;

    if (!archives || archives.length === 0) {
      return res.json([]);
    }

    // take last 3 months 
    const recentArchives = archives.slice(-3);

    let allGames = [];

    // fetch each archive
    for (const url of recentArchives) {
      const gamesRes = await axios.get(url);
      allGames = allGames.concat(gamesRes.data.games);
    }

    // newest first
    allGames.sort((a, b) => b.end_time - a.end_time);

    // limit to 15
    const latest15 = allGames.slice(0, 15);

    // simplify
    const simplified = latest15.map(g => {
    const player = username.toLowerCase();

    const isWhite = g.white.username.toLowerCase() === player;
    const playerResult = isWhite ? g.white.result : g.black.result;

    let resultLabel = "Draw";

    if (playerResult === "win") resultLabel = "Win";
    else if (["checkmated", "resigned", "timeout", "lose"].includes(playerResult))
      resultLabel = "Loss";

    return {
      white: g.white.username,
      black: g.black.username,
      result: resultLabel,
      date: g.end_time,
      pgn: g.pgn
    };
  });

    res.json(simplified);

  } catch (error) {
    res.status(404).json({ error: "Games not found" });
  }
});


// Endpoint used to search for player username suggestions
app.get('/api/players/search/:query', async (req, res) => {

  // Convert the search query to lowercase so the match is not case sensitive
  const query = req.params.query.toLowerCase();

  try {

    // Request leaderboard data from API
    const response = await fetch('https://api.chess.com/pub/leaderboards');
    const data = await response.json();

    // Array to store usernames that match query
    const players = [];

    // Loop through leaderboard categories returned by the API
    Object.values(data).forEach(board => {

      // Each leaderboard contains a list of player objects
      board.forEach(player => {

        // Check if the player's username contains the search text
        if (player.username.toLowerCase().includes(query)) {

          // If it matches add the username to the results list
          players.push(player.username);
        
        }
      });
    });

    // Remove duplicate usernames and limit the results to ten suggestions
    const unique = [...new Set(players)].slice(0, 10);

    // Send the suggestions back to the frontend
    res.json(unique);

  } catch (err) {
    // If the request fails return an error
    res.status(500).json({ error: 'Search failed' });
  }
});


app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});