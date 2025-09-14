const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Exemple de base de données en mémoire (plus tard on peut brancher MongoDB)
let commands = [
  {
    itemName: "tictactoe",
    authorName: "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝚇𝙴 3.0★彡",
    rank: "VIP",
    price: 5000,
    pastebinLink: "https://pastebin.com/xxxxx",
    category: "games"
  },
  {
    itemName: "dames",
    authorName: "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝚇𝙴 3.0★彡",
    rank: "VIP+",
    price: 10000,
    pastebinLink: "https://pastebin.com/yyyyy",
    category: "games"
  }
]

/**
 * ➤ Routes
 */

// 1. Obtenir toutes les commandes
app.get("/api/commands", (req, res) => {
  res.json(commands)
})

// 2. Obtenir une commande par nom
app.get("/api/commands/:name", (req, res) => {
  const name = req.params.name.toLowerCase()
  const cmd = commands.find(c => c.itemName.toLowerCase() === name)
  if (!cmd) return res.status(404).json({})
  res.json(cmd)
})

// 3. Ajouter / Modifier une commande (PUT)
app.put("/api/commands/:name", (req, res) => {
  const name = req.params.name.toLowerCase()
  const newCommand = { ...req.body, itemName: req.params.name }

  // Vérifie si la commande existe
  const index = commands.findIndex(c => c.itemName.toLowerCase() === name)
  if (index >= 0) {
    commands[index] = newCommand
  } else {
    commands.push(newCommand)
  }

  res.json({ success: true, command: newCommand })
})

// 4. Supprimer une commande
app.delete("/api/commands/:name", (req, res) => {
  const name = req.params.name.toLowerCase()
  commands = commands.filter(c => c.itemName.toLowerCase() !== name)
  res.json({ success: true })
})

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`🚀 API CommandStore running on http://localhost:${PORT}`)
})
