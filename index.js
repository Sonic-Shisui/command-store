const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

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

// ---------- Configuration GitHub ---------- //
const GITHUB_REPO_API = "https://api.github.com/repos/Sonic-Shisui/HedgehogGPT/contents";

// ---------- Fonction pour récupérer les fichiers du repo ---------- //
async function fetchCommandsFromGitHub() {
  try {
    console.log("🔄 Synchronisation avec le dépôt GitHub...");

    const response = await fetch(GITHUB_REPO_API);
    const files = await response.json();

    if (!Array.isArray(files)) {
      console.error("❌ Erreur lors de la récupération du dépôt GitHub :", files);
      return;
    }

    // Filtrer uniquement les fichiers JavaScript (commandes)
    const commandFiles = files.filter(file => file.name.endsWith(".js"));

    // Tableau temporaire
    const newCommands = [];

    // Récupérer le contenu de chaque fichier
    for (const file of commandFiles) {
      const fileResponse = await fetch(file.download_url);
      const content = await fileResponse.text();

      const extracted = extractCommandInfo(content, file.name);
      if (extracted) newCommands.push(extracted);
    }

    // Mettre à jour la base de données locale
    if (newCommands.length > 0) {
      commands = newCommands;
      console.log(`✅ ${commands.length} commandes synchronisées depuis GitHub.`);
    } else {
      console.log("⚠️ Aucune commande valide trouvée dans le repo.");
    }
  } catch (err) {
    console.error("❌ Erreur lors de la synchronisation GitHub :", err);
  }
}

// ---------- Fonction pour extraire les infos d'une commande ---------- //
function extractCommandInfo(content, filename) {
  try {
    const nameMatch = content.match(/name:\s*["'`](.*?)["'`]/);
    const descMatch = content.match(/description:\s*["'`](.*?)["'`]/);
    const categoryMatch = content.match(/category:\s*["'`](.*?)["'`]/);

    return {
      itemName: nameMatch ? nameMatch[1] : filename.replace(".js", ""),
      authorName: "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝚇𝙴 3.0★彡",
      rank: "VIP",
      price: "Gratuit",
      pastebinLink: `https://github.com/Sonic-Shisui/HedgehogGPT/blob/main/${filename}`,
      category: categoryMatch ? categoryMatch[1] : "Autres",
      description: descMatch ? descMatch[1] : "Aucune description disponible"
    };
  } catch (err) {
    console.error("Erreur d'extraction :", err);
    return null;
  }
}

// ---------- Synchronisation automatique toutes les 10 min ---------- //
fetchCommandsFromGitHub();
setInterval(fetchCommandsFromGitHub, 10 * 60 * 1000);

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

// ---------- Lancer le serveur ---------- //
app.listen(PORT, () => {
  console.log(`🚀 API CommandStore running on http://localhost:${PORT}`);
});