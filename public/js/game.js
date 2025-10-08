document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.endsWith('game.html')) {
    const wordGrid = document.getElementById("word-grid");

    const gridSize = parseInt(localStorage.getItem("gridSize")) || 17;
    const wordCount = parseInt(localStorage.getItem("wordCount")) || 7;
    let timeLeft = parseInt(localStorage.getItem("timerDuration")) || 60;

    let words = [];
    let score = 0;
    let timerInterval;
    let matchedWords = [];
    let lastMatchedTime = null;

    // Apply dynamic grid size to CSS
    wordGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    wordGrid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    function loadWords() {
      fetch('../public/xml/words.xml')
        .then(response => response.text())
        .then(str => {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(str, "application/xml");
          const wordNodes = xmlDoc.getElementsByTagName('word');

          for (let i = 0; i < wordNodes.length; i++) {
            words.push(wordNodes[i].textContent.trim().toUpperCase());
          }

          words = adjustWordsToGrid(words, gridSize);

          if (words.length > wordCount) {
            words = getRandomWords(words, wordCount);
          }

          initGame();
        })
        .catch(err => console.error("Error loading XML:", err));
    }

    function adjustWordsToGrid(wordArray, size) {
      return wordArray
        .map(word => word.length > size ? word.substring(0, size) : word)
        .filter(w => w.length > 1 && w.length <= size);
    }

    function getRandomWords(wordsArray, num) {
      const shuffled = wordsArray.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    }

    function createGrid() {
      wordGrid.innerHTML = "";
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

    function placeWords() {
      const maxAttempts = 100;
      words.forEach((word) => {
        let placed = false;
        let attempts = 0;
        const directions = ["horizontal", "vertical"];

        while (!placed && attempts < maxAttempts) {
          const direction = directions[Math.floor(Math.random() * directions.length)];
          const startRow = Math.floor(Math.random() * gridSize);
          const startCol = Math.floor(Math.random() * gridSize);

          if (canPlaceWord(word, startRow, startCol, direction)) {
            placed = true;
            for (let i = 0; i < word.length; i++) {
              const cell = getCellForWordPlacement(startRow, startCol, direction, i);
              cell.textContent = word[i];
              cell.dataset.letter = word[i];
            }
          }
          attempts++;
        }

        if (!placed) {
          console.warn(`Could not place word "${word}" after ${maxAttempts} attempts.`);
        }
      });
    }

    function canPlaceWord(word, row, col, direction) {
      if (direction === "horizontal" && col + word.length > gridSize) return false;
      if (direction === "vertical" && row + word.length > gridSize) return false;

      for (let i = 0; i < word.length; i++) {
        const cell = getCellForWordPlacement(row, col, direction, i);
        if (cell && cell.textContent) return false;
      }
      return true;
    }

    function getCellForWordPlacement(row, col, direction, index) {
      switch (direction) {
        case "horizontal":
          return document.querySelector(`[data-row="${row}"][data-col="${col + index}"]`);
        case "vertical":
          return document.querySelector(`[data-row="${row + index}"][data-col="${col}"]`);
        default:
          return null;
      }
    }

    function fillRandomLetters() {
      const cells = document.querySelectorAll(".grid-cell");
      cells.forEach((cell) => {
        if (!cell.textContent) {
          const randomLetter = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
          cell.textContent = randomLetter;
          cell.dataset.letter = randomLetter;
        }
      });
    }

    // Drag selection
    let selectedCells = [];
    let isSelecting = false;
    let selectionDirection = null;

    function handleStart(event) {
      event.preventDefault();
      const cell = event.target;
      if (cell.classList.contains("grid-cell")) {
        selectedCells = [cell];
        cell.classList.add("selected");
        isSelecting = true;
        selectionDirection = null;
      }
    }

    function handleMove(event) {
      event.preventDefault();
      if (isSelecting) {
        let cell;
        if (event.targetTouches) {
          cell = document.elementFromPoint(event.targetTouches[0].clientX, event.targetTouches[0].clientY);
        } else {
          cell = event.target;
        }
        if (cell && cell.classList.contains("grid-cell") && !selectedCells.includes(cell)) {
          const lastSelectedCell = selectedCells[selectedCells.length - 1];
          const rowDiff = parseInt(cell.dataset.row) - parseInt(lastSelectedCell.dataset.row);
          const colDiff = parseInt(cell.dataset.col) - parseInt(lastSelectedCell.dataset.col);

          if (rowDiff === 1 && colDiff === 0) selectionDirection = "vertical";
          else if (rowDiff === 0 && colDiff === 1) selectionDirection = "horizontal";
          else if (rowDiff === -1 && colDiff === 0) selectionDirection = "reverse-vertical";
          else if (rowDiff === 0 && colDiff === -1) selectionDirection = "reverse-horizontal";

          if (selectionDirection) {
            cell.classList.add("selected");
            selectedCells.push(cell);
          }
        }
      }
    }

    function handleEnd() {
      if (isSelecting) {
        checkWordMatch();
        selectedCells.forEach((cell) => cell.classList.remove("selected"));
        selectedCells = [];
        isSelecting = false;
        selectionDirection = null;
      }
    }

    function checkWordMatch() {
      const selectedWord = selectedCells.map((cell) => cell.dataset.letter).join("");
      const reversedWord = selectedWord.split("").reverse().join("");

      if (words.includes(selectedWord) || words.includes(reversedWord)) {
        selectedCells.forEach((cell) => cell.classList.add("matched"));
        const wordToAdd = words.includes(selectedWord) ? selectedWord : reversedWord;
        if (!matchedWords.includes(wordToAdd)) {
          matchedWords.push(wordToAdd);
          lastMatchedTime = timeLeft;
        }
        updateScore();
      }

      if (matchedWords.length === words.length) {
        clearInterval(timerInterval);
        localStorage.setItem("remainingTime", timeLeft);
        gameOver();
      }
    }

    function updateScore() {
      score++;
      document.getElementById("score").textContent = `Score: ${score}`;
    }

    function startTimer() {
      const timerDisplay = document.getElementById("time-left");
      const timerElement = document.getElementById("timer");

      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          timerDisplay.textContent = timeLeft;
          if (timeLeft <= 10) {
            timerDisplay.classList.add("time-low");
            playBeep();
            timerElement.style.borderColor = 'red';
          } else if (timeLeft <= 30) {
            timerElement.style.borderColor = 'yellow';
          } else {
            timerElement.style.borderColor = '#4CAF50';
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
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      gainNode.gain.setValueAtTime(1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    }

    function gameOver() {
      clearInterval(timerInterval);

      localStorage.setItem("score", score);
      localStorage.setItem("matchedWords", matchedWords.length);
      localStorage.setItem("totalWords", words.length);
      localStorage.setItem("remainingTime", timeLeft);
      localStorage.setItem("lastMatchedTime", lastMatchedTime);

      const userName = localStorage.getItem("userName") || "Guest";
      const userEmail = localStorage.getItem("userEmail") || "guest@example.com";

      const resultData = {
        Name: userName,
        Email: userEmail,
        Score: score,
        Matched_Words: matchedWords.length,
        Total_Words: words.length,
        Remaining_Time: timeLeft,
        Date: new Date().toLocaleString()
      };

      if (window.myAPI && window.myAPI.saveResult) {
        window.myAPI.saveResult(resultData)
          .then((res) => {
            console.log(res.message);
            window.location.href = "results.html";
          })
          .catch(err => {
            console.error("Error saving result:", err);
            window.location.href = "results.html";
          });
      } else {
        console.warn("Electron API not available.");
        window.location.href = "results.html";
      }
    }

    function initGame() {
      createGrid();
      placeWords();
      fillRandomLetters();
      document.getElementById("score").textContent = `Score: ${score}`;

      wordGrid.addEventListener("mousedown", handleStart);
      wordGrid.addEventListener("mousemove", handleMove);
      wordGrid.addEventListener("mouseup", handleEnd);
      wordGrid.addEventListener("touchstart", handleStart);
      wordGrid.addEventListener("touchmove", handleMove);
      wordGrid.addEventListener("touchend", handleEnd);

      setTimeout(startTimer, 2000);
    }

    loadWords();
  }
});
