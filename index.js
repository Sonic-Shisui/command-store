const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ---------- Base de données en mémoire ---------- //
let commands = [
  {
    itemName: "tictactoe",
    authorName: "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝚇𝙴 3.0★彡",
    rank: "VIP",
    price: "100.000.000€",
    pastebinLink: "https://pastebin.com/xxxxx",
    category: "games"
  },
  {
    itemName: "dames",
    authorName: "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝚇𝙴 3.0★彡",
    rank: "VIP+",
    price: "150.000.000€",
    pastebinLink: "https://pastebin.com/yyyyy",
    category: "games"
  }
];

/**
 * ➤ Routes
 */

// Route racine
app.get("/", (req, res) => {
  res.json({ message: "🚀 CommandStore API en ligne !" });
});

// 1. Obtenir toutes les commandes
app.get("/api/commands", (req, res) => {
  res.json(commands);
});

// 2. Obtenir une commande par nom
app.get("/api/commands/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const cmd = commands.find(c => c.itemName.toLowerCase() === name);
  if (!cmd) return res.status(404).json({ error: "Commande non trouvée" });
  res.json(cmd);
});

// 3. Ajouter / Modifier une commande (PUT)
app.put("/api/commands/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const newCommand = { ...req.body, itemName: req.params.name };

  // Vérifie si la commande existe
  const index = commands.findIndex(c => c.itemName.toLowerCase() === name);
  if (index >= 0) {
    commands[index] = newCommand;
  } else {
    commands.push(newCommand);
  }

  res.json({ success: true, command: newCommand });
});

// 4. Supprimer une commande
app.delete("/api/commands/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const initialLength = commands.length;
  commands = commands.filter(c => c.itemName.toLowerCase() !== name);

  if (commands.length === initialLength) {
    return res.status(404).json({ error: "Commande non trouvée" });
  }

  res.json({ success: true });
});

// ---------- Gestion des routes inconnues ---------- //
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 API CommandStore running on http://localhost:${PORT}`);
});
