const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// JSON File Database
const DB_PATH = path.join(__dirname, 'db.json');

function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch {
    return { polls: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// GET /polls
app.get('/polls', (req, res) => {
  const db = readDB();
  res.json(db.polls);
});

// POST /polls
app.post('/polls', (req, res) => {
  const { question, options } = req.body;
  if (!question || !options || options.length < 2 || options.length > 4) {
    return res.status(400).json({ error: 'Question and 2-4 options required' });
  }
  const db = readDB();
  const poll = {
    id: uuidv4(),
    question,
    options: options.map(text => ({ text, votes: 0 })),
    createdAt: new Date(),
    voters: []
  };
  db.polls.push(poll);
  writeDB(db);
  res.status(201).json(poll);
});

// POST /polls/:id/vote
app.post('/polls/:id/vote', (req, res) => {
  const { id } = req.params;
  const { optionIndex, voterId } = req.body;
  const db = readDB();
  const poll = db.polls.find(p => p.id === id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  if (poll.voters.includes(voterId)) {
    return res.status(400).json({ error: 'You have already voted!' });
  }
  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return res.status(400).json({ error: 'Invalid option' });
  }
  poll.options[optionIndex].votes++;
  poll.voters.push(voterId);
  writeDB(db);
  res.json(poll);
});

// DELETE /polls/:id
app.delete('/polls/:id', (req, res) => {
  const db = readDB();
  const index = db.polls.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Poll not found' });
  db.polls.splice(index, 1);
  writeDB(db);
  res.json({ message: 'Poll deleted successfully' });
});

// GET /polls/:id/results
app.get('/polls/:id/results', (req, res) => {
  const db = readDB();
  const poll = db.polls.find(p => p.id === req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  const results = poll.options.map(opt => ({
    text: opt.text,
    votes: opt.votes,
    percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0
  }));
  res.json({ question: poll.question, results, totalVotes });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});