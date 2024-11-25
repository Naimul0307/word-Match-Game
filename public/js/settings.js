document.getElementById('settings-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const gridSize = document.getElementById('grid-size').value;
  const timerDuration = document.getElementById('timer-duration').value;

  // Save the data (e.g., using localStorage or sending it to a server)
  localStorage.setItem('gridSize', gridSize);
  localStorage.setItem('timerDuration', timerDuration);
  // Redirect to the game page
  window.location.href = 'index.html';
});
