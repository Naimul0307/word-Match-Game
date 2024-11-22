// Display the results
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

    // Redirect to the index page after 10 seconds
    setTimeout(() => {
        window.location.href = "index.html"; // Replace with your main game page URL
    }, 10000);
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

// Restart the game
function restartGame() {
    window.location.href = "index.html"; // Replace with your main game page URL
}

// Initialize the results page
document.addEventListener("DOMContentLoaded", displayResults);