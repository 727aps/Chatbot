const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Function to add a message to the chat window
function addMessage(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;
  messageDiv.textContent = message;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to handle bot responses and detect options
function processBotResponse(botResponse) {
  const optionsRegex = /\[([^\]]+)\]\(#\)/g; // Match options [Text](#)
  const plainMessage = botResponse.replace(optionsRegex, "").trim();
  const options = [...botResponse.matchAll(optionsRegex)].map((match) => match[1]);

  // Display the main message
  if (plainMessage) addMessage(plainMessage, "bot");

  // Render options as buttons
  if (options.length > 0) {
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "options-container";

    options.forEach((option) => {
      const button = document.createElement("button");
      button.className = "option-btn";
      button.textContent = option;
      button.addEventListener("click", () => {
        addMessage(option, "user");
        sendMessageToBot(option); // Send the selected option to Rasa
      });
      optionsContainer.appendChild(button);
    });

    chatMessages.appendChild(optionsContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Function to send a message to the Rasa bot
async function sendMessageToBot(message) {
  const url = "http://localhost:5005/webhooks/rest/webhook"; // Rasa REST API endpoint

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sender: "user", message }),
    });

    if (!response.ok) {
      throw new Error("Error connecting to the bot");
    }

    const botResponses = await response.json();

    // Process each bot response
    if (botResponses.length > 0) {
      botResponses.forEach((res) => {
        processBotResponse(res.text || "");
      });
    } else {
      addMessage("I didn't understand that. Can you rephrase?", "bot");
    }
  } catch (error) {
    addMessage("Error: Unable to reach the bot server.", "bot");
  }
}

// Handle send button click
sendBtn.addEventListener("click", () => {
  const message = userInput.value.trim();
  if (message) {
    addMessage(message, "user");
    sendMessageToBot(message);
    userInput.value = "";
  }
});

// Handle Enter key press
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
  }
});
