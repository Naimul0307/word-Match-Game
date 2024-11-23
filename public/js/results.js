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

// Function to display the top 10 scores
function displayTopScores() {
    // Retrieve the previous top scores from localStorage
    let topScores = JSON.parse(localStorage.getItem("topScores")) || [];

    // Sort the top scores:
    // 1. Sort by score (descending)
    // 2. If the score is equal, sort by remaining time (descending)
    // 3. If remaining time is zero, sort by last matched time (descending)
    topScores.sort((a, b) => {
        if (b.score === a.score) {
            if (b.time === a.time) {
                return b.lastMatchedTime - a.lastMatchedTime; // Sort by last matched time if score and time are equal
            }
            return b.time - a.time;  // Sort by remaining time if scores are equal
        }
        return b.score - a.score;  // Sort by score
    });

    // Keep only the top 10 scores
    topScores = topScores.slice(0, 10);

    // Display the top 10 scores in the table
    const topScoresTableBody = document.getElementById("top-scores-table").getElementsByTagName('tbody')[0];
    topScores.forEach((entry, index) => {
        const row = topScoresTableBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.score}</td>
            <td>${entry.time > 0 ? entry.time : entry.lastMatchedTime}</td>
        `;
    });

    // Show the top scores container
    document.getElementById("top-scores-container").style.display = "block";
}

// Handle the "Back" button click
document.getElementById("back-btn").addEventListener("click", function() {
    window.location.href = "index.html"; // Redirect to home page
});
