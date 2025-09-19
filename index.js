const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ----------- TA LISTE DE COMMANDES ----------- //
const cmds = [
  {
    itemName: "tictactoe",
    price: 250 000 000,
    category: "games",
    description: "Play tictactoe with your Friends or bot!",
    author: "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝚇𝙴 3.0★彡",
    link: "https://pastebin.com/CXmZGZQW"
  },
  {
    itemName: "love",
    price: 100 000 000,
    category: "games",
    description: "casino game",
    author: "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝚇𝙴 3.0★彡",
    link: "https://pastebin.com/raw/7WxQDRPF"
  }
  // Ajoute d'autres commandes ici !
];

// ----------- ROUTES ----------- //
app.get("/", (req, res) => {
  res.json({ message: "🚀 CommandStore API en ligne !" });
});

app.get("/api/commands", (req, res) => {
  res.json(cmds);
});

app.get("/api/commands/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const cmd = cmds.find(c => c.itemName.toLowerCase() === name);
  if (!cmd) return res.status(404).json({ error: "Commande non trouvée" });
  res.json(cmd);
});

// ----------- Serveur ----------- //
app.listen(PORT, () => {
  console.log(`🚀 API CommandStore running on http://localhost:${PORT}`);
});