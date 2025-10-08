document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('results.html')) {
        displayResults();
    }
});

// Function to display results
function displayResults() {
    const score = parseInt(localStorage.getItem("score"), 10) || 0;
    const matchedWords = parseInt(localStorage.getItem("matchedWords"), 10) || 0;
    const totalWords = parseInt(localStorage.getItem("totalWords"), 10) || 0;

    document.getElementById("matched-words").textContent = matchedWords;
    document.getElementById("total-words").textContent = totalWords;

    const resultMessage = document.getElementById("result-message");
    const resultSummary = document.getElementById("result-summary");
    const scoreDisplay = document.getElementById("score-display");
    const tryAgainMessage = document.getElementById("try-again-message");

    // ✅ Determine final result condition
    const allWordsMatched = matchedWords === totalWords && totalWords > 0;
    const hasScore = score > 0;

    if (allWordsMatched && hasScore) {
        // 🎉 Win condition
        resultMessage.textContent = "🎉 Congratulations!";
        resultMessage.classList.add("congrats");
    } else {
        // ❌ Fail condition
        resultMessage.textContent = "❌ Fail!";
        resultMessage.classList.add("time-up");
    }

    setTimeout(() => resultMessage.classList.add("visible"), 500);
    setTimeout(() => resultSummary.classList.add("visible"), 1500);
    setTimeout(() => {
        scoreDisplay.classList.add("visible");
        animateScore(0, score);
    }, 2500);

    setTimeout(() => {
        if (!allWordsMatched) {
            tryAgainMessage.textContent = "Try Again!";
            tryAgainMessage.classList.add("visible");
        }
    }, 5000);

    setTimeout(() => {
        document.getElementById("results-container").style.display = "none";
        displayTopScores();
    }, 10000);

    setTimeout(() => {
        window.location.href = "index.html";
    }, 30000);
}


// Animate the score counter
function animateScore(start, end) {
    const scoreDisplay = document.getElementById("score-display");
    let currentScore = start;
    const interval = setInterval(() => {
        if (currentScore <= end) {
            scoreDisplay.textContent = `Score: ${currentScore}`;
            currentScore++;
        } else {
            clearInterval(interval);
        }
    }, 50);
}

// Display only the latest result in table and send to Excel
// Display only top 10 valid scores (exclude score=0 or time=0)
async function displayTopScores() {
    let results = await window.myAPI.getResults();

    if (!results || results.length === 0) {
        console.warn("No results found.");
        return;
    }

    // ✅ Filter out players with score = 0 or remaining time = 0/null/undefined
    results = results.filter(r => (r.Score || 0) > 0 && (r.Remaining_Time || 0) > 0);

    if (results.length === 0) {
        console.warn("No valid scores found.");
        document.querySelector("#top-scores-table tbody").innerHTML =
            `<tr><td colspan="4" style="text-align:center;">No valid scores yet</td></tr>`;
        document.getElementById("top-scores-container").style.display = "block";
        return;
    }

    // Sort descending by Score
    results.sort((a, b) => (b.Score || 0) - (a.Score || 0));

    // Take top 10
    const topResults = results.slice(0, 10);

    const topScoresTable = document.querySelector("#top-scores-table tbody");
    topScoresTable.innerHTML = "";

    topResults.forEach((result, index) => {
        const row = topScoresTable.insertRow();

        row.insertCell(0).textContent = index + 1;            // Rank
        row.insertCell(1).textContent = result.Name || "";   // Name
        row.insertCell(2).textContent = result.Score || 0;   // Score
        row.insertCell(3).textContent = result.Remaining_Time || 0; // Time
    });

    document.getElementById("top-scores-container").style.display = "block";
}

