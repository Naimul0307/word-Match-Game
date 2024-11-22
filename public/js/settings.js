const form = document.getElementById("settings-form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const gridSize = parseInt(document.getElementById("grid-size").value);
  const timeLeft = parseInt(document.getElementById("time-limit").value);
  const wordCount = parseInt(document.getElementById("word-count").value);

  // Save settings to localStorage
  localStorage.setItem("gridSize", gridSize);
  localStorage.setItem("timeLeft", timeLeft);
  localStorage.setItem("wordCount", wordCount);

  alert("Settings saved! Start the game to apply changes.");
});
