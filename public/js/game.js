document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.endsWith('game.html')) {
    const wordGrid = document.getElementById("word-grid");
    let words = []; // To hold words from XML
    let score = 0; // Initialize score
    let timerInterval; // To store the timer interval
    let matchedWords = [];
    let lastMatchedTime = null;
    const gridSize = parseInt(localStorage.getItem("gridSize")) || 17; // Default to 17 if not set
    let timeLeft = parseInt(localStorage.getItem("timerDuration")) || 60; // Default to 60 seconds
    
    // Fetch words from XML file
    function loadWords() {
      fetch('../public/xml/words.xml')  // Load the XML file (ensure it's in the same directory)
        .then(response => response.text())
        .then(str => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(str, "application/xml");
          const wordNodes = xmlDoc.getElementsByTagName('word');
          
          // Get words from the XML and push them into the words array
          for (let i = 0; i < wordNodes.length; i++) {
            words.push(wordNodes[i].textContent);
          }
    
          // Randomly select 5 words if there are more than 5
          if (words.length >5) {
            words = getRandomWords(words, 5);  // Get 5 random words
          }
    
          initGame(); // Initialize the game after loading words
        })
        .catch(err => console.error("Error loading XML:", err));
    }
    
    // Function to randomly select 'n' words from the words array
    function getRandomWords(wordsArray, num) {
      const shuffled = wordsArray.sort(() => 0.5 - Math.random());  // Shuffle the array
      return shuffled.slice(0, num);  // Return the first 'num' words from the shuffled array
    }
    
    
    // Create grid
    function createGrid() {
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const cell = document.createElement("div");
          cell.classList.add("grid-cell");
          cell.dataset.row = row;
          cell.dataset.col = col;
          wordGrid.appendChild(cell);
        }
      }
    }
    
    
    // Place words in the grid
    function placeWords() {
      words.forEach((word) => {
        // const direction = ["horizontal", "vertical", "diagonal", "reverse-horizontal", "reverse-vertical"][Math.floor(Math.random() * 5)];
        // const direction = ["horizontal", "vertical", "reverse-horizontal", "reverse-vertical"][Math.floor(Math.random() * 4)];
        const direction = ["horizontal", "vertical"][Math.floor(Math.random() * 2)];
        let placed = false;
        while (!placed) {
          const startRow = Math.floor(Math.random() * gridSize);
          const startCol = Math.floor(Math.random() * gridSize);
          placed = canPlaceWord(word, startRow, startCol, direction);
          if (placed) {
            for (let i = 0; i < word.length; i++) {
              const cell = getCellForWordPlacement(startRow, startCol, direction, i);
              cell.textContent = word[i];
              cell.dataset.letter = word[i];
            }
          }
        }
      });
    }
    
    // Check if the word can be placed
    function canPlaceWord(word, row, col, direction) {
      if (direction === "horizontal" && col + word.length > gridSize) return false;
      if (direction === "vertical" && row + word.length > gridSize) return false;
      // if (direction === "diagonal" && (row + word.length > gridSize || col + word.length > gridSize)) return false;
      // if (direction === "reverse-horizontal" && col - word.length < -1) return false;
      // if (direction === "reverse-vertical" && row - word.length < -1) return false;
    
      for (let i = 0; i < word.length; i++) {
        const cell = getCellForWordPlacement(row, col, direction, i);
        if (cell && cell.textContent) return false;
      }
      return true;
    }
    
    // Get the cell based on direction
    function getCellForWordPlacement(row, col, direction, index) {
      switch (direction) {
        case "horizontal":
          return document.querySelector(`[data-row="${row}"][data-col="${col + index}"]`);
        case "vertical":
          return document.querySelector(`[data-row="${row + index}"][data-col="${col}"]`);
        // case "diagonal":
        //   return document.querySelector(`[data-row="${row + index}"][data-col="${col + index}"]`);
        // case "reverse-horizontal":
        //   return document.querySelector(`[data-row="${row}"][data-col="${col - index}"]`);
        // case "reverse-vertical":
        //   return document.querySelector(`[data-row="${row - index}"][data-col="${col}"]`);
        default:
          return null;
      }
    }
    
    // Fill empty grid cells with random letters
    function fillRandomLetters() {
      const cells = document.querySelectorAll(".grid-cell");
      cells.forEach((cell) => {
        if (!cell.textContent) {
          const randomLetter = String.fromCharCode(Math.floor(Math.random() * 26) + 65); // Random uppercase letter
          cell.textContent = randomLetter;
          cell.dataset.letter = randomLetter;
        }
      });
    }
    
    // Handle mouse and touch events for drag-to-select
    let selectedCells = [];
    let isSelecting = false; // Flag to check if the user is currently selecting
    let selectionDirection = null; // Track the direction of the selection
    
    // Handle mouse and touch start
    function handleStart(event) {
      // Prevent default to stop touch scrolling behavior
      event.preventDefault();
    
      const cell = event.target;
      if (cell.classList.contains("grid-cell")) {
        selectedCells = [cell];
        cell.classList.add("selected");
        isSelecting = true;
        selectionDirection = null; // Reset the direction
      }
    }
    
    // Handle mouse and touch movement
    function handleMove(event) {
      // Prevent default to stop touch scrolling behavior
      event.preventDefault();
    
      if (isSelecting) {
        let cell;
        if (event.targetTouches) {
          // For touch events, use the first touch point
          cell = document.elementFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
        } else {
          // For mouse events
          cell = event.target;
        }
    
        if (cell && cell.classList.contains("grid-cell") && !selectedCells.includes(cell)) {
          const lastSelectedCell = selectedCells[selectedCells.length - 1];
    
          // Calculate difference in rows and columns
          const rowDiff = parseInt(cell.dataset.row) - parseInt(lastSelectedCell.dataset.row);
          const colDiff = parseInt(cell.dataset.col) - parseInt(lastSelectedCell.dataset.col);
    
          // Set the selection direction based on movement
          if (rowDiff === 1 && colDiff === 0) {
            selectionDirection = "vertical";
          } else if (rowDiff === 0 && colDiff === 1) {
            selectionDirection = "horizontal";
          // } else if (rowDiff === 1 && colDiff === 1) {
          //   selectionDirection = "diagonal-right"; // Bottom-right diagonal
          // } else if (rowDiff === -1 && colDiff === -1) {
          //   selectionDirection = "diagonal-left"; // Top-left diagonal
          // } else if (rowDiff === 1 && colDiff === -1) {
          //   selectionDirection = "diagonal-right"; // Bottom-left diagonal
          // } else if (rowDiff === -1 && colDiff === 1) {
          //   selectionDirection = "diagonal-left"; // Top-right diagonal
          } else if (rowDiff === -1 && colDiff === 0) {
            selectionDirection = "reverse-vertical";
          } else if (rowDiff === 0 && colDiff === -1) {
            selectionDirection = "reverse-horizontal";
          }
    
          // If the direction is consistent, add the cell to the selection
          if (selectionDirection) {
            cell.classList.add("selected");
            selectedCells.push(cell);
          }
        }
      }
    }
    
    // Handle mouse and touch end
    function handleEnd() {
      if (isSelecting) {
        checkWordMatch(); // Check if the dragged cells form a word
        selectedCells.forEach((cell) => cell.classList.remove("selected"));
        selectedCells = [];
        isSelecting = false;
        selectionDirection = null;
      }
    }
    
    // Check if selected cells match a word
    function checkWordMatch() {
      const selectedWord = selectedCells.map((cell) => cell.dataset.letter).join("");
      const reversedWord = selectedWord.split("").reverse().join(""); // For reverse matching
    
      if (words.includes(selectedWord) || words.includes(reversedWord)) {
        selectedCells.forEach((cell) => cell.classList.add("matched"));
    
        // Add the matched word to the matchedWords array if it's not already added
        const wordToAdd = words.includes(selectedWord) ? selectedWord : reversedWord;
        if (!matchedWords.includes(wordToAdd)) {
          matchedWords.push(wordToAdd);
    
          // Save the current remaining time as the last matched time
          lastMatchedTime = timeLeft;
        }
    
        updateScore(); // Update the score when a word is matched
      }
    
      // Check if all words are matched
      if (matchedWords.length === words.length) {
        clearInterval(timerInterval); // Stop the timer
        localStorage.setItem("remainingTime", timeLeft); // Save remaining time
        gameOver(); // End the game
      }
    }
    
    // Update score
    function updateScore() {
      score++;
      document.getElementById("score").textContent = `Score: ${score}`;
    }
    
    
    // Timer functionality with beep and animation
    function startTimer() {
      const timerDisplay = document.getElementById("time-left");
      const timerElement = document.getElementById("timer");
    
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          timerDisplay.textContent = timeLeft;
    
          // Add animation and beep when timeLeft is less than or equal to 10 seconds
          if (timeLeft <= 10) {
            timerDisplay.classList.add("time-low"); // Add animation class
            playBeep(); // Play the beep sound
            timerElement.style.borderColor = 'red'; // Slowly transition to re
          } else if (timeLeft <= 30) {
            timerElement.style.borderColor = 'yellow'; // Slowly transition to yellow
          } else {
            timerElement.style.borderColor = '#4CAF50'; // Slowly transition to gree
          }
        } else {
          clearInterval(timerInterval);
          gameOver();
        }
      }, 1000);
    }
    
    
    function playBeep() {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
    
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
    
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime); // Beep frequency
      gainNode.gain.setValueAtTime(1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5); // Beep duration
    
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }
  

    function gameOver() {
      clearInterval(timerInterval); // Ensure the timer is stopped
    
      // Save data to localStorage
      localStorage.setItem("score", score);
      localStorage.setItem("matchedWords", matchedWords.length);
      localStorage.setItem("totalWords", words.length);
      localStorage.setItem("remainingTime", timeLeft); // Save remaining time
      localStorage.setItem("lastMatchedTime", lastMatchedTime); // Save last matched time
    
      const userName = localStorage.getItem("userName") || "Guest";
      const userEmail = localStorage.getItem("userEmail") || "guest@example.com";
    
      localStorage.setItem("userName", userName); // Save user name
      localStorage.setItem("userEmail", userEmail); // Save user email
    
      // Redirect to the results page
      window.location.href = "results.html";
    }
    
    // Initialize the game
    function initGame() {
      createGrid();
      placeWords();
      fillRandomLetters();
    
      // Display the initial score
      const scoreContainer = document.getElementById("score");
      scoreContainer.textContent = `Score: ${score}`;
    
      // Add mouse and touch event listeners to the grid
      wordGrid.addEventListener("mousedown", handleStart);
      wordGrid.addEventListener("mousemove", handleMove);
      wordGrid.addEventListener("mouseup", handleEnd);
    
      // Touch events for mobile and tablets
      wordGrid.addEventListener("touchstart", handleStart);
      wordGrid.addEventListener("touchmove", handleMove);
      wordGrid.addEventListener("touchend", handleEnd);
    
      // Delay the timer start by 2 seconds
      setTimeout(() => {
        startTimer();
      }, 2000); // 2000 milliseconds = 2 seconds
    }
    
    // Start the game by loading words
    loadWords();    
  }
});
