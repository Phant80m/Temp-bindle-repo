const fs = require('fs');
const path = require('path');

const messagesFilePath = path.join(__dirname, '..', 'data', 'messages.json');
const stylesFilePath = path.join(__dirname, '..', 'public', 'styles.css');

function loadMessages() {
  return new Promise((resolve, reject) => {
    fs.readFile(messagesFilePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const messages = JSON.parse(data);
        resolve(messages);
      }
    });
  });
}

function saveMessage(username, message, timestamp) {
  return new Promise((resolve, reject) => {
    fs.readFile(messagesFilePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const messages = JSON.parse(data);
        messages.push({ username, message, timestamp });

        fs.writeFile(messagesFilePath, JSON.stringify(messages), (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(messages);
          }
        });
      }
    });
  });
}

function getStylesCSS() {
  return new Promise((resolve, reject) => {
    fs.readFile(stylesFilePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function injectStylesToIndexHTML() {
  fs.readFile(path.join(__dirname, '..', 'public', 'index.html'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return;
    }

    getStylesCSS()
      .then((styles) => {
        // Inject styles into the index.html file
        const updatedData = data.replace('</head>', `<style>${styles}</style></head>`);

        fs.writeFile(path.join(__dirname, '..', 'public', 'index.html'), updatedData, (err) => {
          if (err) {
            console.error('Error injecting styles to index.html:', err);
          } else {
            console.log('Styles injected into index.html.');
          }
        });
      })
      .catch((err) => {
        console.error('Error reading styles.css:', err);
      });
  });
}

module.exports = {
  loadMessages,
  saveMessage,
  getStylesCSS,
  injectStylesToIndexHTML,
};
