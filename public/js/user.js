document.getElementById('user-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get the values from the input fields
    const username = document.getElementById('user-name').value || '';  // Default to empty string if not provided
    const email = document.getElementById('user-email').value || '';    // Default to empty string if not provided

    // Save the data (even if empty) using localStorage
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
    
    // Redirect to the game page
    window.location.href = 'game.html';
});
