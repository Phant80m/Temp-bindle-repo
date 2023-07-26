const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const chat = require('./modules/chat');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const messagesRouter = require('./routes/messages');

// Mount the messages router under the /chat URL
app.use('/chat', messagesRouter);
// Serve the frontend at /chat
app.use('/chat', express.static(path.join(__dirname, 'public')));

// Socket.IO connection
io.on('connection', (socket) => {
  // Load messages from the JSON file and send them to the newly connected client
  chat.loadMessages()
    .then((messages) => {
      socket.emit('loadMessages', messages);
    })
    .catch((err) => {
      console.error('Error loading messages:', err);
    });

  // Listen for new messages
  socket.on('sendMessage', (data) => {
    const { username, message } = data;

    // Generate the current date and time
    const timestamp = new Date().toLocaleString();

    // Save the message and emit it to all connected clients
    chat.saveMessage(username, message, timestamp)
      .then((messages) => {
        io.emit('newMessage', { username, message, timestamp });
      })
      .catch((err) => {
        console.error('Error saving message:', err);
      });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Inject styles into index.html before starting the server

const port = 3000;
const localIP = '0.0.0.0'
server.listen(port, localIP, () => {
  console.log(`Server is running on http://${localIP}:${port}`);
});
