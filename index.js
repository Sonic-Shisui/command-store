const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_API_URL = "https://api.github.com/repos/Sonic-Shisui/HedgehogGPT/contents";

app.use(cors());
app.use(bodyParser.json());

// ---------- Base de données en mémoire ---------- //
let commands = [
  // Tu peux ajouter ici tes commandes par défaut ou laisser vide
];

// ➤ Récupérer les commandes depuis GitHub (une seule fois)
async function fetchCommandsFromGitHub() {
  try {
    const response = await fetch(GITHUB_API_URL);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const files = await response.json();

    // Filtrer les fichiers .js
    const commandFiles = files.filter(file => file.name.endsWith(".js"));

    for (const file of commandFiles) {
      const fileResponse = await fetch(file.download_url);
      if (!fileResponse.ok) continue;
      const fileContent = await fileResponse.text();

      // Extraction basique (adapte si tu veux plus d'infos)
      const nameMatch = fileContent.match(/name:\s*"(.*?)"/);
      const priceMatch = fileContent.match(/price:\s*"?([\d,.]+)"?/);
      const categoryMatch = fileContent.match(/category:\s*"(.*?)"/);
      const descMatch = fileContent.match(/description:\s*"(.*?)"/);
      const authorMatch = fileContent.match(/author:\s*"(.*?)"/);

      if (nameMatch) {
        commands.push({
          itemName: nameMatch[1],
          price: priceMatch ? parseFloat(priceMatch[1].replace(/[^\d.]/g, "")) : 0,
          category: categoryMatch ? categoryMatch[1] : "other",
          description: descMatch ? descMatch[1] : "No description",
          author: authorMatch ? authorMatch[1] : "",
          link: file.download_url
        });
      }
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes depuis GitHub :", error);
  }
}

// ➤ Initialiser les commandes au démarrage
(async () => {
  await fetchCommandsFromGitHub();
})();

// ---------- ROUTES ---------- //

// Route d'accueil
app.get("/", (req, res) => {
  res.json({ message: "🚀 CommandStore API en ligne !" });
});

// ➤ GET toutes les commandes
app.get("/api/commands", (req, res) => {
  res.json(commands);
});

// ➤ GET une commande par nom
app.get("/api/commands/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const cmd = commands.find(c => c.itemName.toLowerCase() === name);
  if (!cmd) return res.status(404).json({ error: "Commande non trouvée" });
  res.json(cmd);
});

// ➤ POST ajouter une nouvelle commande
app.post("/api/commands", (req, res) => {
  const { itemName, price, category, description, author, link } = req.body;
  if (!itemName || !price || !category || !description) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }
  const exists = commands.find(c => c.itemName.toLowerCase() === itemName.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: "Commande déjà existante." });
  }
  const newCmd = { itemName, price, category, description, author: author || "", link: link || "" };
  commands.push(newCmd);
  res.json({ success: true, command: newCmd });
});

// ➤ PUT modifier une commande existante
app.put("/api/commands/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const index = commands.findIndex(c => c.itemName.toLowerCase() === name);
  if (index === -1) return res.status(404).json({ error: "Commande non trouvée" });
  commands[index] = { ...commands[index], ...req.body, itemName: commands[index].itemName };
  res.json({ success: true, command: commands[index] });
});

// ➤ DELETE supprimer une commande
app.delete("/api/commands/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const initialLength = commands.length;
  commands = commands.filter(c => c.itemName.toLowerCase() !== name);
  if (commands.length === initialLength) {
    return res.status(404).json({ error: "Commande non trouvée" });
  }
  res.json({ success: true });
});

// ➤ Recharger les commandes depuis GitHub (admin only, optionnel)
app.post("/api/reload", async (req, res) => {
  commands = [];
  await fetchCommandsFromGitHub();
  res.json({ success: true, message: "Commandes rechargées depuis GitHub." });
});

// Route inconnue
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 API CommandStore running on http://localhost:${PORT}`);
});