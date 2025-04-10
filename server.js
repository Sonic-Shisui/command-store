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
      "itemName": "emojyReply",
      "pastebinLink": "https://pastebin.com/raw/Y8vVaM6u",
      "price": 10000000000,
      "authorName": "L'Uchiha Perdu",
      "category": "Reply",
      "rank": "C"
    },
    {
      "itemName": "out2",
      "pastebinLink": "https://pastebin.com/raw/Bdm4xepY",
      "price": 2000000000000,
      "authorName": "L'Uchiha Perdu ",
      "category": "Utility",
      "rank": "A"
    },
    {
      "itemName": "Fadil",
      "pastebinLink": "https://pastebin.com/Anarque",
      "price": 1500000000000000000000,
      "authorName": "L'Uchiha Perdu",
      "category": "AI",
      "rank": "S"
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

app.put('/api/commands/:name', (req, res) => {
  try {
    const commands = fs.readJsonSync(commandsFile)
    const cmdIndex = commands.findIndex(cmd => cmd.itemName.toLowerCase() === req.params.name.toLowerCase())
    
    if (cmdIndex !== -1) {
      commands[cmdIndex] = { ...commands[cmdIndex], ...req.body }
    } else {
      commands.push(req.body)
    }

    fs.writeJsonSync(commandsFile, commands)
    res.json({ message: 'Commande mise à jour ou ajoutée avec succès.', command: req.body })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande.' })
  }
})

app.get('/', (req, res) => {
  res.send('API CommandStore is running!')
})

app.listen(PORT, () => {
  console.log(`Serveur en marche sur le port ${PORT}`)
})