document.addEventListener('DOMContentLoaded', async function () {
  if (!window.location.pathname.endsWith('game.html')) {
    return;
  }

  const wordGrid = document.getElementById('word-grid');

  /*
   * =========================================================
   * GAME SETTINGS
   * =========================================================
   * Settings are loaded from the application's settings.json
   * through the Electron API.
   */
  let settings;

  try {
    settings = await window.myAPI.getSettings();
  } catch (error) {
    console.error('Could not load game settings:', error);
    settings = {};
  }

  const gameSettings = settings.game || {};

  const gridSize = Math.max(
    5,
    Math.min(30, Number(gameSettings.gridSize) || 17)
  );

  const wordCount = Math.max(
    1,
    Math.min(50, Number(gameSettings.wordCount) || 7)
  );

  let timeLeft = Math.max(
    10,
    Number(gameSettings.timerDuration) || 60
  );

  /*
   * =========================================================
   * GAME STATE
   * =========================================================
   */

  let words = [];
  let score = 0;
  let timerInterval;
  let matchedWords = [];
  let lastMatchedTime = null;

  /*
   * =========================================================
   * GRID SIZE
   * =========================================================
   */

  wordGrid.style.gridTemplateColumns = `repeat(${gridSize}, minmax(0, 1fr))`;
  wordGrid.style.gridTemplateRows = `repeat(${gridSize}, minmax(0, 1fr))`;

  /*
   * =========================================================
   * MATCH COLORS
   * =========================================================
   */

  const matchColorCount = 10;

  function getColorClassForWord(word) {
    const index = words.indexOf(word);
    return `matched-${index % matchColorCount}`;
  }

  /*
   * =========================================================
   * WORD LIST
   * =========================================================
   */

  function renderWordList() {
    const wordListEl = document.getElementById('word-list');

    wordListEl.innerHTML = '';

    words.forEach((word) => {
      const li = document.createElement('li');

      li.textContent = word;
      li.dataset.word = word;

      wordListEl.appendChild(li);
    });
  }

  /*
   * =========================================================
   * LOAD WORDS
   * =========================================================
   */

  function loadWords() {
    fetch('../public/xml/words.xml')
      .then((response) => response.text())
      .then((str) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(
          str,
          'application/xml'
        );

        const wordNodes = xmlDoc.getElementsByTagName('word');

        words = [];

        for (let i = 0; i < wordNodes.length; i++) {
          const word = wordNodes[i].textContent.trim().toUpperCase();

          if (word) {
            words.push(word);
          }
        }

        /*
         * Remove words that cannot fit inside the selected grid.
         */
        words = adjustWordsToGrid(words, gridSize);

        /*
         * Limit the number of words according to settings.
         */
        if (words.length > wordCount) {
          words = getRandomWords(words, wordCount);
        }

        /*
         * If the requested word count is larger than the
         * available XML words, the available words are used.
         */
        initGame();
      })
      .catch((error) => {
        console.error('Error loading XML:', error);
      });
  }

  /*
   * =========================================================
   * ADJUST WORDS TO GRID
   * =========================================================
   */

  function adjustWordsToGrid(wordArray, size) {
    return wordArray
      .map((word) => {
        if (word.length > size) {
          return word.substring(0, size);
        }

        return word;
      })
      .filter((word) => {
        return word.length > 1 && word.length <= size;
      });
  }

  /*
   * =========================================================
   * RANDOM WORD SELECTION
   * =========================================================
   */

  function getRandomWords(wordsArray, number) {
    const shuffled = [...wordsArray].sort(
      () => 0.5 - Math.random()
    );

    return shuffled.slice(0, number);
  }

  /*
   * =========================================================
   * CREATE GRID
   * =========================================================
   */

  function createGrid() {
    wordGrid.innerHTML = '';

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cell = document.createElement('div');

        cell.classList.add('grid-cell');

        cell.dataset.row = row;
        cell.dataset.col = col;

        wordGrid.appendChild(cell);
      }
    }
  }

  /*
   * =========================================================
   * PLACE WORDS
   * =========================================================
   */

  function placeWords() {
    const maxAttempts = 100;

    words.forEach((word) => {
      let placed = false;
      let attempts = 0;

      const directions = [
        'horizontal',
        'vertical'
      ];

      while (!placed && attempts < maxAttempts) {
        const direction =
          directions[
            Math.floor(Math.random() * directions.length)
          ];

        const startRow = Math.floor(
          Math.random() * gridSize
        );

        const startCol = Math.floor(
          Math.random() * gridSize
        );

        if (
          canPlaceWord(
            word,
            startRow,
            startCol,
            direction
          )
        ) {
          placed = true;

          for (let i = 0; i < word.length; i++) {
            const cell = getCellForWordPlacement(
              startRow,
              startCol,
              direction,
              i
            );

            if (cell) {
              cell.textContent = word[i];
              cell.dataset.letter = word[i];
            }
          }
        }

        attempts++;
      }

      if (!placed) {
        console.warn(
          `Could not place word "${word}" after ${maxAttempts} attempts.`
        );
      }
    });
  }

  /*
   * =========================================================
   * CHECK WORD PLACEMENT
   * =========================================================
   */

  function canPlaceWord(word, row, col, direction) {
    if (
      direction === 'horizontal' &&
      col + word.length > gridSize
    ) {
      return false;
    }

    if (
      direction === 'vertical' &&
      row + word.length > gridSize
    ) {
      return false;
    }

    for (let i = 0; i < word.length; i++) {
      const cell = getCellForWordPlacement(
        row,
        col,
        direction,
        i
      );

      if (cell && cell.textContent) {
        return false;
      }
    }

    return true;
  }

  /*
   * =========================================================
   * GET CELL FOR WORD PLACEMENT
   * =========================================================
   */

  function getCellForWordPlacement(
    row,
    col,
    direction,
    index
  ) {
    switch (direction) {
      case 'horizontal':
        return document.querySelector(
          `[data-row="${row}"][data-col="${col + index}"]`
        );

      case 'vertical':
        return document.querySelector(
          `[data-row="${row + index}"][data-col="${col}"]`
        );

      default:
        return null;
    }
  }

  /*
   * =========================================================
   * FILL RANDOM LETTERS
   * =========================================================
   */

  function fillRandomLetters() {
    const cells = document.querySelectorAll('.grid-cell');

    cells.forEach((cell) => {
      if (!cell.textContent) {
        const randomLetter = String.fromCharCode(
          Math.floor(Math.random() * 26) + 65
        );

        cell.textContent = randomLetter;
        cell.dataset.letter = randomLetter;
      }
    });
  }

  /*
   * =========================================================
   * DRAG SELECTION
   * =========================================================
   */

  let selectedCells = [];
  let isSelecting = false;
  let selectionDirection = null;

  function handleStart(event) {
    event.preventDefault();

    const cell = event.target;

    if (cell.classList.contains('grid-cell')) {
      selectedCells = [cell];

      cell.classList.add('selected');

      isSelecting = true;
      selectionDirection = null;
    }
  }

  function handleMove(event) {
    event.preventDefault();

    if (!isSelecting) {
      return;
    }

    let cell;

    if (event.targetTouches) {
      cell = document.elementFromPoint(
        event.targetTouches[0].clientX,
        event.targetTouches[0].clientY
      );
    } else {
      cell = event.target;
    }

    if (
      cell &&
      cell.classList.contains('grid-cell') &&
      !selectedCells.includes(cell)
    ) {
      const lastSelectedCell =
        selectedCells[selectedCells.length - 1];

      const rowDiff =
        parseInt(cell.dataset.row) -
        parseInt(lastSelectedCell.dataset.row);

      const colDiff =
        parseInt(cell.dataset.col) -
        parseInt(lastSelectedCell.dataset.col);

      if (rowDiff === 1 && colDiff === 0) {
        selectionDirection = 'vertical';
      } else if (
        rowDiff === 0 &&
        colDiff === 1
      ) {
        selectionDirection = 'horizontal';
      } else if (
        rowDiff === -1 &&
        colDiff === 0
      ) {
        selectionDirection = 'reverse-vertical';
      } else if (
        rowDiff === 0 &&
        colDiff === -1
      ) {
        selectionDirection = 'reverse-horizontal';
      }

      if (selectionDirection) {
        cell.classList.add('selected');
        selectedCells.push(cell);
      }
    }
  }

  function handleEnd() {
    if (!isSelecting) {
      return;
    }

    checkWordMatch();

    selectedCells.forEach((cell) => {
      cell.classList.remove('selected');
    });

    selectedCells = [];
    isSelecting = false;
    selectionDirection = null;
  }

  /*
   * =========================================================
   * CHECK WORD MATCH
   * =========================================================
   */

  function checkWordMatch() {
    const selectedWord = selectedCells
      .map((cell) => cell.dataset.letter)
      .join('');

    const reversedWord = selectedWord
      .split('')
      .reverse()
      .join('');

    if (
      words.includes(selectedWord) ||
      words.includes(reversedWord)
    ) {
      const wordToAdd = words.includes(selectedWord)
        ? selectedWord
        : reversedWord;

      const colorClass =
        getColorClassForWord(wordToAdd);

      selectedCells.forEach((cell) => {
        cell.classList.add(
          'matched',
          colorClass
        );
      });

      if (!matchedWords.includes(wordToAdd)) {
        matchedWords.push(wordToAdd);

        lastMatchedTime = timeLeft;

        const listItem = document.querySelector(
          `#word-list li[data-word="${wordToAdd}"]`
        );

        if (listItem) {
          listItem.classList.add(
            'found',
            colorClass
          );
        }

        updateScore();
      }
    }

    /*
     * Finish the game when all words are found.
     */
    if (
      matchedWords.length === words.length
    ) {
      clearInterval(timerInterval);

      localStorage.setItem(
        'remainingTime',
        timeLeft
      );

      gameOver();
    }
  }

  /*
   * =========================================================
   * UPDATE SCORE
   * =========================================================
   */

  function updateScore() {
    score++;

    document.getElementById(
      'score'
    ).textContent = `Score: ${score}`;
  }

  /*
   * =========================================================
   * START TIMER
   * =========================================================
   */

  function startTimer() {
    const timerDisplay =
      document.getElementById('time-left');

    const timerElement =
      document.getElementById('timer');

    /*
     * Display the configured starting time immediately.
     */
    timerDisplay.textContent = timeLeft;

    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;

        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 10) {
          timerDisplay.classList.add('time-low');

          playBeep();

          timerElement.style.borderColor = 'red';
        } else if (timeLeft <= 30) {
          timerElement.style.borderColor = 'yellow';
        } else {
          timerElement.style.borderColor = '#12b417';
        }
      } else {
        clearInterval(timerInterval);

        gameOver();
      }
    }, 1000);
  }

  /*
   * =========================================================
   * TIMER BEEP
   * =========================================================
   */

  function playBeep() {
    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {
      return;
    }

    const audioContext = new AudioContext();

    const oscillator =
      audioContext.createOscillator();

    const gainNode =
      audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';

    oscillator.frequency.setValueAtTime(
      1000,
      audioContext.currentTime
    );

    gainNode.gain.setValueAtTime(
      1,
      audioContext.currentTime
    );

    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.5
    );

    oscillator.start(
      audioContext.currentTime
    );

    oscillator.stop(
      audioContext.currentTime + 0.5
    );
  }

  /*
   * =========================================================
   * GAME OVER
   * =========================================================
   */

  function gameOver() {
    clearInterval(timerInterval);

    localStorage.setItem(
      'score',
      score
    );

    localStorage.setItem(
      'matchedWords',
      matchedWords.length
    );

    localStorage.setItem(
      'totalWords',
      words.length
    );

    localStorage.setItem(
      'remainingTime',
      timeLeft
    );

    localStorage.setItem(
      'lastMatchedTime',
      lastMatchedTime
    );

    const userName =
      localStorage.getItem('userName') ||
      'Guest';

    const userEmail =
      localStorage.getItem('userEmail') ||
      'guest@example.com';

    const resultData = {
      Name: userName,
      Email: userEmail,
      Score: score,
      Matched_Words: matchedWords.length,
      Total_Words: words.length,
      Remaining_Time: timeLeft,
      Date: new Date().toLocaleString()
    };

    if (
      window.myAPI &&
      window.myAPI.saveResult
    ) {
      window.myAPI
        .saveResult(resultData)
        .then((result) => {
          console.log(result.message);

          window.location.href =
            'results.html';
        })
        .catch((error) => {
          console.error(
            'Error saving result:',
            error
          );

          window.location.href =
            'results.html';
        });
    } else {
      console.warn(
        'Electron API not available.'
      );

      window.location.href =
        'results.html';
    }
  }

  /*
   * =========================================================
   * INITIALIZE GAME
   * =========================================================
   */

  function initGame() {
    createGrid();

    renderWordList();

    placeWords();

    fillRandomLetters();

    document.getElementById(
      'score'
    ).textContent = `Score: ${score}`;

    /*
     * Mouse controls
     */
    wordGrid.addEventListener(
      'mousedown',
      handleStart
    );

    wordGrid.addEventListener(
      'mousemove',
      handleMove
    );

    wordGrid.addEventListener(
      'mouseup',
      handleEnd
    );

    /*
     * Touch controls
     */
    wordGrid.addEventListener(
      'touchstart',
      handleStart,
      { passive: false }
    );

    wordGrid.addEventListener(
      'touchmove',
      handleMove,
      { passive: false }
    );

    wordGrid.addEventListener(
      'touchend',
      handleEnd
    );

    /*
     * Start timer after the existing 2-second delay.
     */
    setTimeout(startTimer, 2000);
  }

  /*
   * =========================================================
   * START GAME
   * =========================================================
   */

  loadWords();
});