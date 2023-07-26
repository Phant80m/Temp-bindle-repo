// routes/messages.js

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const messagesFilePath = path.join(__dirname, '../data/messages.json');

// Define the route for "/chat/messages"
router.get('/messages', (req, res) => {
  fs.readFile(messagesFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading messages:', err);
      return res.status(500).json({ error: 'Error reading messages' });
    }

    const messages = JSON.parse(data);
    return res.json(messages);
  });
});

module.exports = router;
