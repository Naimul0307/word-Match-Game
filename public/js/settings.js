document.addEventListener('DOMContentLoaded', function () {
  // Load saved values (if any)
  const savedGridSize = localStorage.getItem('gridSize');
  const savedTimerDuration = localStorage.getItem('timerDuration');
  const savedWordCount = localStorage.getItem('wordCount');

  // If values exist, set them in the form
  if (savedGridSize) document.getElementById('grid-size').value = savedGridSize;
  if (savedTimerDuration) document.getElementById('timer-duration').value = savedTimerDuration;
  if (savedWordCount) document.getElementById('word-count').value = savedWordCount;

  // Save new values on submit
  document.getElementById('settings-info-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const gridSize = document.getElementById('grid-size').value;
    const timerDuration = document.getElementById('timer-duration').value;
    const wordCount = document.getElementById('word-count').value;

    // Save values in localStorage
    localStorage.setItem('gridSize', gridSize);
    localStorage.setItem('timerDuration', timerDuration);
    localStorage.setItem('wordCount', wordCount);

    // Redirect to home or game page
    window.location.href = 'index.html';
  });
});
