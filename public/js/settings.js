document.getElementById("settings-form").addEventListener("submit", (e) => {
  e.preventDefault();

  // Get values from the form
  const gridSize = parseInt(document.getElementById("grid-size").value, 10);
  const timerDuration = parseInt(document.getElementById("timer-duration").value, 10);
 
 
  // Save settings to localStorage
  localStorage.setItem("gridSize", gridSize);
  localStorage.setItem("timerDuration", timerDuration);
 

  // Show a confirmation message or redirect to the game
  alert("Settings saved successfully!");
  window.location.href = "index.html"; // Redirect to the game page
});
