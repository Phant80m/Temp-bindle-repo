function checkRedirectFromRoot() {
  const urlParams = new URLSearchParams(window.location.search);
  const fromRoot = urlParams.get('fromRoot');
  if (fromRoot === 'true') {
    // User arrived from the root redirect, show a popup
    showPopup('Redirected from / successfull!', true);
    // Store the information in sessionStorage to avoid showing the popup on reload
    sessionStorage.setItem('redirectedFromRoot', 'true');
  }
}
function handleVisibilityChange() {
  if (document.hidden) {
    // Page is not visible, change the title
    document.title = "Come back to Chat!";
  } else {
    // Page is visible again, restore the original title
    document.title = "Chat";
  }
}

// Add event listener for visibility change
document.addEventListener("visibilitychange", handleVisibilityChange);
window.onload = function() {
            var inputField = document.getElementById('message');

            // Prevent context menu (right-click menu) from appearing
            inputField.addEventListener('contextmenu', function(event) {
                showPopup("Copying and pasting not allowed!");
                event.preventDefault();
            });

            // Prevent copy and paste by intercepting key combinations
            inputField.addEventListener('copy', function(event) {
                showPopup("Copying not allowed!");
                event.preventDefault();
            });

            inputField.addEventListener('paste', function(event) {
                showPopup("Pasting not allowed!");
                event.preventDefault();
            });
        }

var myDialog = document.getElementById('myDialog');
    var closeDialogButton = document.getElementById('closeDialog');

    // Open the dialog when a button is clicked
    document.getElementById('openDialogButton').addEventListener('click', function() {
        myDialog.showModal();
    });

    // Close the dialog when the close button is clicked
    closeDialogButton.addEventListener('click', function() {
        myDialog.close();
    });

document.addEventListener('DOMContentLoaded', () => {
  const redirectedFromRoot = sessionStorage.getItem('redirectedFromRoot');
  if (redirectedFromRoot === null || redirectedFromRoot === 'true') {
    checkRedirectFromRoot();
    // Reset the sessionStorage value to avoid showing the popup on reload
    sessionStorage.setItem('redirectedFromRoot', 'false');
  }
});

      // Socket.IO connection
      const socket = io();
      // DOM elements
      const chatMessages = document.getElementById('chat-messages');
      const usernameInput = document.getElementById('username');
      const messageInput = document.getElementById('message');
      const sendButton = document.getElementById('sendButton');
      const scrollLockButton = document.getElementById('scrollLockButton');
      // Constants for character limits
      const maxUsernameLength = 35;
      const maxMessageLength = 300;
      // Variable to keep track of the scrollLock state
      let scrollLocked = false;
      // Function to toggle scrollLock state
      function toggleScrollLock() {
        scrollLocked = !scrollLocked;
        if (scrollLocked) {
          scrollLockButton.innerText = 'ScrollLock';
          scrollLockButton.style.backgroundColor = '#eba0ac';
        } else {
          scrollLockButton.innerText = 'ScrollUnlock';
          scrollLockButton.style.backgroundColor = '#a6e3a1';
          // If scrollLock is turned off, scroll to the bottom to see new messages
          const scrollingElement = document.scrollingElement || document.body;
          scrollingElement.scrollTop = scrollingElement.scrollHeight;
        }
      }
      // Handle the "ScrollLock" button click event
      scrollLockButton.addEventListener('click', () => {
        toggleScrollLock();
      });
      // Function to add a new message to the chat
      function addMessage(username, message, timestamp) {
        const formattedTimestamp = timestamp.replace(/[\[\]()]/g, '');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message-wrapper');
        messageDiv.innerHTML = `
             
											<div class="username-timestamp">
												<strong class="username">${username}</strong>
												<em class="timestamp">${formattedTimestamp}</em>
											</div>
											<div class="msgContent">${message}</div>
           `;
        messageDiv.querySelector('strong').textContent = username;
        messageDiv.querySelector('em').textContent = formattedTimestamp;
        messageDiv.querySelector('div:last-child').textContent = message;
        chatMessages.appendChild(messageDiv);
      }
      // Load existing messages from the server
      socket.on('loadMessages', (messages) => {
        messages.forEach(({
          username,
          message,
          timestamp
        }) => {
          addMessage(username, message, timestamp);
        });
      });
      // Handle the "Send" button click event
      sendButton.addEventListener('click', () => {
        sendMessage();
      });
      // Handle "Enter" key press in the message input field
      messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault(); // Prevent form submission
          sendMessage();
        }
      });
// Function to show a popup message
function showPopup(message, isRedirect = false) {
  const popup = document.getElementById('popup');
  popup.textContent = message;
  popup.style.opacity = '1';

  // Check if it's a redirect and apply a green background
  if (isRedirect) {
    popup.style.backgroundColor = '#a6e3a1'; // Green background
    popup.style.color = '#181926';
  } else {
    popup.style.backgroundColor = '#eba0ac'; // Default background
    popup.style.color = '#181926';
  }

  setTimeout(() => {
    popup.style.opacity = '0';
  }, 3000); // Hide the popup after 3 seconds
}

      // Function to send a message to the server
      function sendMessage() {
        let isOnCooldown = false;
        // Check if the user is currently on cooldown
        if (isOnCooldown) {
          return; // Exit the function without sending the message
        }
        const username = usernameInput.value.trim().slice(0, maxUsernameLength);
        let message = messageInput.value.trim().slice(0, maxMessageLength);
        if (username && message) {
        const linkPattern = /(https?:\/\/[^\s]+\.(com|net|co)[^\s]*)/g;
          const htmlTagsRegex = /<\s*\/?\s*[a-zA-Z]+\s*[^<>]*\s*>/g;
          if (!linkPattern.test(message)) {
            // Check if the message contains HTML tags or ending tags
            if (htmlTagsRegex.test(message)) {
              showPopup('Message not sent: contains HTML');
              return; // Exit the function without sending the message
            }
            socket.emit('sendMessage', {
              username,
              message
            });
            messageInput.value = '';
            // Set the cooldown flag to true
            isOnCooldown = true;
            // Reset the cooldown flag after 0.2 seconds
            setTimeout(() => {
              isOnCooldown = false;
            }, 200);
          } else {
            showPopup('Messages containing links are not allowed.');
          }
        }
      }
      // Handle new messages from the server
      socket.on('newMessage', ({
        username,
        message,
        timestamp
      }) => {
        addMessage(username, message, timestamp);
        if (!scrollLocked) {
          const scrollingElement = document.scrollingElement || document.body;
          scrollingElement.scrollTop = scrollingElement.scrollHeight;
        }
      });
