document.addEventListener("DOMContentLoaded", function () {
    displayResults();
    setupButtons();
});


// =====================================================
// SETUP BUTTONS
// =====================================================

function setupButtons() {

    const continueButton =
        document.getElementById("continue-btn");

    const backButton =
        document.getElementById("back-btn");


    // ---------- Continue Button ----------

    if (continueButton) {

        continueButton.addEventListener("click", function () {

            hideResultPopup();

            // Wait for popup closing animation
            setTimeout(function () {

                displayTopScores();

            }, 500);

        });
    }


    // ---------- Back to Home Button ----------

    if (backButton) {

        backButton.addEventListener("click", function () {

            window.location.href = "index.html";

        });
    }
}


// =====================================================
// DISPLAY RESULT POPUP
// =====================================================

function displayResults() {

    const score =
        parseInt(localStorage.getItem("score"), 10) || 0;

    const matchedWords =
        parseInt(localStorage.getItem("matchedWords"), 10) || 0;

    const totalWords =
        parseInt(localStorage.getItem("totalWords"), 10) || 0;


    const matchedWordsElement =
        document.getElementById("matched-words");

    const totalWordsElement =
        document.getElementById("total-words");

    const resultMessage =
        document.getElementById("result-message");

    const resultSummary =
        document.getElementById("result-summary");

    const scoreDisplay =
        document.getElementById("score-display");

    const tryAgainMessage =
        document.getElementById("try-again-message");

    const resultOverlay =
        document.getElementById("result-overlay");


    if (!resultOverlay) {

        console.error("Result popup not found.");

        return;
    }


    // =================================================
    // SET RESULT DATA
    // =================================================

    if (matchedWordsElement) {

        matchedWordsElement.textContent =
            matchedWords;
    }


    if (totalWordsElement) {

        totalWordsElement.textContent =
            totalWords;
    }


    const allWordsMatched =
        matchedWords === totalWords &&
        totalWords > 0;

    const hasScore =
        score > 0;


    // =================================================
    // SUCCESS / FAIL
    // =================================================

    if (allWordsMatched && hasScore) {

        resultMessage.textContent =
            "🎉 Congratulations!";

        resultMessage.classList.add("congrats");

        resultMessage.classList.remove("time-up");

        tryAgainMessage.textContent = "";

    } else {

        resultMessage.textContent =
            "❌ Game Over!";

        resultMessage.classList.add("time-up");

        resultMessage.classList.remove("congrats");

        tryAgainMessage.textContent =
            "Try Again!";
    }


    // =================================================
    // SHOW POPUP ANIMATION
    // =================================================

    requestAnimationFrame(function () {

        resultOverlay.classList.add("show");

    });


    // =================================================
    // ANIMATE SCORE
    // =================================================

    setTimeout(function () {

        animateScore(0, score);

    }, 700);


    // =================================================
    // AUTOMATICALLY SHOW LEADERBOARD AFTER 6 SECONDS
    // =================================================

    setTimeout(function () {

        hideResultPopup();


        // Wait for popup closing animation
        setTimeout(function () {

            displayTopScores();

        }, 500);

    }, 6000);
}


// =====================================================
// HIDE RESULT POPUP
// =====================================================

function hideResultPopup() {

    const resultOverlay =
        document.getElementById("result-overlay");


    if (!resultOverlay) {

        return;
    }


    resultOverlay.classList.remove("show");
}


// =====================================================
// SCORE ANIMATION
// =====================================================

function animateScore(start, end) {

    const scoreDisplay =
        document.getElementById("score-display");


    if (!scoreDisplay) {

        return;
    }


    let currentScore = start;


    if (end <= start) {

        scoreDisplay.textContent =
            `Score: ${end}`;

        return;
    }


    const interval =
        setInterval(function () {

            if (currentScore <= end) {

                scoreDisplay.textContent =
                    `Score: ${currentScore}`;

                currentScore++;

            } else {

                clearInterval(interval);
            }

        }, 50);
}


// =====================================================
// DISPLAY LEADERBOARD
// =====================================================

async function displayTopScores() {

    const leaderboard =
        document.getElementById(
            "top-scores-container"
        );


    if (!leaderboard) {

        return;
    }


    // Prevent the leaderboard from being opened again
    // multiple times
    if (leaderboard.classList.contains("show")) {

        return;
    }


    // =================================================
    // SHOW LEADERBOARD
    // =================================================

    requestAnimationFrame(function () {

        leaderboard.classList.add("show");

    });


    try {

        // =================================================
        // CHECK ELECTRON API
        // =================================================

        if (
            !window.myAPI ||
            typeof window.myAPI.getResults !== "function"
        ) {

            console.error(
                "window.myAPI.getResults() is not available."
            );

            showNoScores();

        } else {

            let results =
                await window.myAPI.getResults();


            // =================================================
            // NO RESULTS
            // =================================================

            if (
                !results ||
                !Array.isArray(results) ||
                results.length === 0
            ) {

                showNoScores();

            } else {

                // =================================================
                // FILTER VALID SCORES
                // =================================================

                results = results.filter(function (result) {

                    return (
                        (result.Score || 0) > 0 &&
                        (result.Remaining_Time || 0) > 0
                    );

                });


                if (results.length === 0) {

                    showNoScores();

                } else {

                    // =================================================
                    // HIGHEST SCORE FIRST
                    // =================================================

                    results.sort(function (a, b) {

                        return (
                            (b.Score || 0) -
                            (a.Score || 0)
                        );

                    });


                    // =================================================
                    // TOP 10
                    // =================================================

                    const topResults =
                        results.slice(0, 10);


                    const tableBody =
                        document.querySelector(
                            "#top-scores-table tbody"
                        );


                    if (tableBody) {

                        tableBody.innerHTML = "";


                        topResults.forEach(
                            function (result, index) {

                                const row =
                                    tableBody.insertRow();


                                row.insertCell(0)
                                    .textContent =
                                    index + 1;


                                row.insertCell(1)
                                    .textContent =
                                    result.Name || "";


                                row.insertCell(2)
                                    .textContent =
                                    result.Score || 0;


                                row.insertCell(3)
                                    .textContent =
                                    result.Remaining_Time || 0;

                            }
                        );
                    }
                }
            }
        }

    } catch (error) {

        console.error(
            "Error loading leaderboard:",
            error
        );

        showNoScores();
    }


    // =================================================
    // LEADERBOARD STAYS FOR 16 SECONDS
    // THEN GO HOME
    // =================================================

    setTimeout(function () {

        window.location.href = "index.html";

    }, 16000);
}


// =====================================================
// NO SCORES
// =====================================================

function showNoScores() {

    const tableBody =
        document.querySelector(
            "#top-scores-table tbody"
        );


    if (tableBody) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="4">
                    No valid scores yet
                </td>
            </tr>
        `;
    }
}