const fs = require('fs');
const path = require('path');

const messagesFilePath = path.join(__dirname, '..', 'data', 'messages.json');
const stylesFilePath = path.join(__dirname, '..', 'public', 'styles.css');

const randomOptions = [
  'Option 1',
  'Option 2',
  'Option 3',
];
function loadMessages() {
  return new Promise((resolve, reject) => {
    fs.readFile(messagesFilePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const messages = JSON.parse(data);
        const modifiedMessages = replaceLinksInMessages(messages);
        resolve(modifiedMessages);
      }
    });
  });
}

function saveMessage(username, message, timestamp, profilePictureLink) {
  // Regular expression to match HTML tags and ending tags
  const htmlTagsRegex = /<\s*\/?\s*[a-zA-Z]+\s*[^<>]*\s*>/g;

  // Check if the message contains HTML tags or ending tags
  if (htmlTagsRegex.test(message)) {
    return Promise.reject(new Error('Invalid message: contains HTML tags or ending tags'));
  }

  // Truncate the username to 35 characters
  username = username.slice(0, 35);

  // Truncate the message to 350 characters
  message = message.slice(0, 350);

  return new Promise((resolve, reject) => {
    fs.readFile(messagesFilePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const messages = JSON.parse(data);

        // Check again after parsing, in case the JSON data was manually modified
        if (messages.some(msg => htmlTagsRegex.test(msg.message))) {
          return reject(new Error('Invalid data in messages: contains HTML tags or ending tags'));
        }

        messages.push({ username, message, timestamp, profilePictureLink });

        fs.writeFile(messagesFilePath, JSON.stringify(messages), (err) => {
          if (err) {
            reject(err);
          } else {
            const modifiedMessages = replaceLinksInMessages(messages);
            resolve(modifiedMessages);
          }
        });
      }
    });
  });
}

// Step 3: Create a function to replace links in messages
function replaceLinksInMessages(messages) {
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/|www\.)\S+\.(com|net|co)\S*/g;

  // Iterate through each message
  for (let i = 0; i < messages.length; i++) {
    const { message } = messages[i];

    // Replace URLs in the message with a random option from the array
    messages[i].message = message.replace(urlRegex, () => {
      const randomIndex = Math.floor(Math.random() * randomOptions.length);
      return randomOptions[randomIndex];
    });
  }

  return messages;
}


module.exports = {
  loadMessages,
  saveMessage,
};
