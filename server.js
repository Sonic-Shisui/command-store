const express = require('express')
const fs = require('fs-extra')
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000
const commandsFile = 'commands.json'

app.use(express.json())
app.use(cors())

if (!fs.existsSync(commandsFile)) {
  fs.writeFileSync(commandsFile, JSON.stringify([
    {
      "itemName": "join",
      "pastebinLink": "https://pastebin.com/LIEN_ICI",
      "price": 100000000,
      "authorName": "L'Uchiha Perdu"
    },
    {
      "itemName": "leave",
      "pastebinLink": "https://pastebin.com/AUTRE_LIEN",
      "price": 200000000,
      "authorName": "ミ★𝐒𝐎𝐍𝐈𝐂✄𝐄𝐗𝐄 3.0★彡"
    },
    {
      "itemName": "kick",
      "pastebinLink": "https://pastebin.com/ENCORE_UN_LIEN",
      "price": 150000000,
      "authorName": "L'Uchiha Perdu"
    }
  ]))
}

app.get('/api/commands', (req, res) => {
  try {
    const commands = fs.readJsonSync(commandsFile)
    res.json(commands)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des commandes.' })
  }
})

app.get('/api/commands/:name', (req, res) => {
  try {
    const commands = fs.readJsonSync(commandsFile)
    const command = commands.find(cmd => cmd.itemName.toLowerCase() === req.params.name.toLowerCase())
    res.json(command || {})
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la commande.' })
  }
})

// Ajout de la nouvelle route POST ici
app.post('/api/commands', (req, res) => {
  try {
    const commands = fs.readJsonSync(commandsFile)
    const newCommand = req.body

    // Validation basique
    if (!newCommand.itemName || !newCommand.pastebinLink || typeof newCommand.price !== 'number') {
      return res.status(400).json({ error: 'Données de commande invalides.' })
    }

    commands.push(newCommand)
    fs.writeJsonSync(commandsFile, commands)
    res.status(201).json(newCommand)
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout de la commande.' })
  }
})

app.get('/', (req, res) => {
  res.send('API CommandStore is running!')
})

app.listen(PORT, () => {
  console.log(`Serveur en marche sur le port ${PORT}`)
})
