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


// GET recent games
app.get("/api/player/:username/games", async (req, res) => {
  const { username } = req.params;

  try {
    // get archives list
    const archivesRes = await axios.get(
      `https://api.chess.com/pub/player/${username}/games/archives`
    );

    const archives = archivesRes.data.archives;

    if (!archives || archives.length === 0) {
      return res.json([]);
    }

    // latest month URL
    const latestArchive = archives[archives.length - 1];

    // fetch games
    const gamesRes = await axios.get(latestArchive);

    const games = gamesRes.data.games;

    // return simplified list
    const simplified = games.map(g => ({
      white: g.white.username,
      black: g.black.username,
      result: g.white.result,
      date: g.end_time,
      pgn: g.pgn
    }));

    res.json(simplified);

  } catch (error) {
    res.status(404).json({ error: "Games not found" });
  }
});



app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});