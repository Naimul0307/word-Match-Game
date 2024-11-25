document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('results.html')) {
        displayResults();
    }
});

// Function to display results
function displayResults() {
    // Get score and word data from localStorage
    const score = parseInt(localStorage.getItem("score"), 10) || 0;
    const matchedWords = parseInt(localStorage.getItem("matchedWords"), 10) || 0;
    const totalWords = parseInt(localStorage.getItem("totalWords"), 10) || 0;

    // Display matched and total words
    document.getElementById("matched-words").textContent = matchedWords;
    document.getElementById("total-words").textContent = totalWords;

    const resultMessage = document.getElementById("result-message");
    const resultSummary = document.getElementById("result-summary");
    const scoreDisplay = document.getElementById("score-display");

    // Determine if the user ran out of time or scored points
    if (score > 0) {
        resultMessage.textContent = "Congratulations!";
        resultMessage.classList.add("congrats"); // Apply green color
    } else {
        resultMessage.textContent = "Time's Up!";
        resultMessage.classList.add("time-up"); // Apply red color
    }

    // Show the "Time's Up!" or "Congratulations!" message with animation
    setTimeout(() => {
        resultMessage.classList.add("visible");
    }, 500);

    // Show the result summary after 1 second
    setTimeout(() => {
        resultSummary.classList.add("visible");
    }, 1500);

    // Animate and display the score after 2 seconds
    setTimeout(() => {
        scoreDisplay.classList.add("visible");
        animateScore(0, score);
    }, 2500);

    // After 5 seconds, hide results-container and show top scores
    setTimeout(() => {
        document.getElementById("results-container").style.display = "none";  // Hide results
        displayTopScores();  // Display the top scores table
    }, 10000);  // Wait for 5 seconds before showing the top scores

    // Redirect to the home page after 25 seconds (5s for results, 20s for top scores)
    setTimeout(() => {
        window.location.href = "index.html"; // Redirect to the home page
    }, 30000);
}

// Animate the score from 0 to the final value
function animateScore(start, end) {
    const scoreDisplay = document.getElementById("score-display");
    let currentScore = start;

    const interval = setInterval(() => {
        if (currentScore <= end) {
            scoreDisplay.textContent = currentScore;
            currentScore++;
        } else {
            clearInterval(interval);
        }
    }, 50); // Adjust speed of animation
}

  
  function displayTopScores() {
    // Get existing scores from localStorage (or initialize an empty array if not present)
    let topScores = JSON.parse(localStorage.getItem("topScores")) || [];
  
    // Push the current score and name into the array
    const userName = localStorage.getItem("userName") || "Guest";
    const userEmail = localStorage.getItem("userEmail") || "guest@example.com";
    const userScore = localStorage.getItem("score");
    const userLastMatchTime = localStorage.getItem("lastMatchedTime")
    const userTime = localStorage.getItem("remainingTime");
  
    topScores.push({
      name: userName,
      email: userEmail,
      score: userScore,
      time: userTime,
      lastMatchTime : userLastMatchTime 
    });
  
    // Sort the scores in descending order (by score)
    topScores.sort((a, b) => b.score - a.score);
  
    // Keep only the top 10 scores
    topScores = topScores.slice(0, 10);
  
    // Save the updated scores back to localStorage
    localStorage.setItem("topScores", JSON.stringify(topScores));
  
    // Insert the top scores into the table
    const topScoresTable = document.getElementById("top-scores-table").getElementsByTagName('tbody')[0];
    topScoresTable.innerHTML = ''; // Clear the table
  
    topScores.forEach((score, index) => {
      const row = topScoresTable.insertRow();
      row.insertCell(0).textContent = index + 1;
      row.insertCell(1).textContent = score.name;
      row.insertCell(2).textContent = score.email;
      row.insertCell(3).textContent = score.score;
      row.insertCell(4).textContent = score.time;
      row.insertCell(5).textContent = score.lastMatchTime;
    });
  
    document.getElementById("top-scores-container").style.display = 'block';
  }

// Handle the "Back" button click
document.getElementById("back-btn").addEventListener("click", function() {
    window.location.href = "index.html"; // Redirect to home page
});