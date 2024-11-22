document.addEventListener('DOMContentLoaded', function () {
    const userNameInput = document.getElementById('user-name');
    const userEmailInput = document.getElementById('user-email');
    const userSubmitBtn = document.getElementById('submit-user-info');

    // Event listener for User Info Form submission
    if (userSubmitBtn) {
        userSubmitBtn.addEventListener('click', function (event) {
            event.preventDefault(); // Prevent form submission
            const userName = userNameInput.value.trim();
            const userEmail = userEmailInput.value.trim();
            localStorage.setItem('userName', userName);
            localStorage.setItem('userEmail', userEmail);

            setTimeout(function () {
                window.location.href = 'game.html';
            });
        });
    }
});
