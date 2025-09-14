const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_API_URL = "https://api.github.com/repos/Sonic-Shisui/HedgehogGPT/contents";

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ---------- Base de données en mémoire ---------- //
let commands = [];

/**
 * ➤ Récupérer les commandes depuis GitHub
 */
async function fetchCommandsFromGitHub() {
  try {
    const response = await fetch(GITHUB_API_URL);
    const files = await response.json();

    // Filtrer les fichiers de commandes (par exemple, ceux avec l'extension .js)
    const commandFiles = files.filter(file => file.name.endsWith(".js"));

    // Récupérer le contenu de chaque fichier de commande
    for (const file of commandFiles) {
      const fileResponse = await fetch(file.download_url);
      const fileContent = await fileResponse.text();

      // Extraire les informations de la commande depuis le contenu du fichier
      const command = extractCommandInfo(fileContent);
      if (command) {
        commands.push(command);
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes depuis GitHub :", error);
  }
}

/**
 * ➤ Extraire les informations d'une commande depuis le contenu du fichier
 * @param {string} content - Contenu du fichier de commande
 * @returns {object|null} - Objet représentant la commande ou null si non valide
 */
function extractCommandInfo(content) {
  try {
    // Exemple d'extraction basée sur une structure hypothétique
    const nameMatch = content.match(/name:\s*"(.*?)"/);
    const priceMatch = content.match(/price:\s*"(.*?)"/);
    const categoryMatch = content.match(/category:\s*"(.*?)"/);

    if (nameMatch && priceMatch && categoryMatch) {
      return {
        itemName: nameMatch[1],
        price: parseFloat(priceMatch[1].replace(/[^\d.-]/g, "")), // Nettoyer le prix
        category: categoryMatch[1],
        description: "Description non fournie", // À adapter selon le contenu
      };
    }
  } catch (error) {
    console.error("Erreur lors de l'extraction des informations de commande :", error);
  }
  return null;
}

/**
 * ➤ Routes
 */

// Route racine
app.get("/", (req, res) => {
  res.json({ message: "🚀 CommandStore API en ligne !" });
});

// 1. Obtenir toutes les commandes
app.get("/api/commands", async (req, res) => {
  if (commands.length === 0) {
    await fetchCommandsFromGitHub();
  }
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