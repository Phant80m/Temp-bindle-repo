const express = require('express');
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const toml = require('toml');
const chat = require('./modules/chat');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const messagesRouter = require('./routes/messages');

// Load configuration from chat.toml or use defaults if it doesn't exist
let config;
try {
  config = toml.parse(fs.readFileSync('chat.toml'));
} catch (err) {
  console.error('Error reading chat.toml, using default configuration.');
  config = {
    server: {
      ip: "127.0.0.1",
      port: 3000,
      timezone: "UTC" // Default to UTC if not specified
    },
    frontend: {
      dir: "./public"
    }
  };
}

// Set the server timezone
process.env.TZ = config.server.timezone;

// Serve static files from the configured directory
app.use(express.static(path.join(__dirname, config.frontend.dir)));

// Mount the messages router under the /chat URL
app.use('/chat', messagesRouter);
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, config.frontend.dir, 'favicon.ico'));
});
// Serve the frontend at /chat
const publicPath = path.join(__dirname, config.frontend.dir);
const chatHtmlPath = path.join(publicPath, 'chat.html');
app.get('/chat', (req, res) => {
  res.sendFile(chatHtmlPath);
});

// Serve version information from version.toml as JSON at /version
app.get('/version', (req, res) => {
  try {
    const versionData = fs.readFileSync('version.toml', 'utf8');
    const versionJson = toml.parse(versionData);
    res.json(versionJson);
  } catch (err) {
    console.error('Error reading version.toml:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  const userIP = socket.handshake.address;

  // Log the user's IP address
  console.log(`User connected with IP address: ${userIP}`);
  
  const timeZone = config.server.timezone;
  const options = { timeZone: timeZone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
  const formatter = new Intl.DateTimeFormat('en-AU', options);
  const timestamp = formatter.format(new Date());

  // Create a log object
  const logEntry = {
    ip: userIP,
    timestamp: timestamp
  };

  // Write the log to the file
  fs.readFile('./data/iplog.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading iplog.json:', err);
      return;
    }

    const ipLog = JSON.parse(data);
    ipLog.push(logEntry);

    fs.writeFile('./data/iplog.json', JSON.stringify(ipLog, null, 2), (err) => {
      if (err) {
        console.error('Error writing iplog.json:', err);
      }
    });
  });

  // Listen for new messages
  socket.on('sendMessage', (data) => {
    const { username, message } = data;

    // Generate the current date and time
    const timeZone = config.server.timezone;
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
  res.status(404).sendFile(path.join(__dirname, config.frontend.dir, '404.html'));
});
const port = config.server.port;
const localIP = config.server.ip;
server.listen(port, localIP, () => {
  console.log(`Server is running on http://${localIP}:${port}`);
});
