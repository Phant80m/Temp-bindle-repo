const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const chat = require('./modules/chat');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const messagesRouter = require('./routes/messages');
app.use(express.static(__dirname + '/public'));

// Mount the messages router under the /chat URL
app.use('/chat', messagesRouter);
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});
// Serve the frontend at /chat
const publicPath = path.join(__dirname, 'public');
const chatHtmlPath = path.join(publicPath, 'chat.html');
app.get('/chat', (req, res) => {
  res.sendFile(chatHtmlPath);
});

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
    const timeZone = "Australia/Sydney";
    const options = { timeZone: timeZone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const formatter = new Intl.DateTimeFormat('en-AU', options);
    const timestamp = formatter.format(new Date());

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
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});
const port = 3000;
const localIP = '0.0.0.0'
server.listen(port, localIP, () => {
  console.log(`Server is running on http://${localIP}:${port}`);
});
