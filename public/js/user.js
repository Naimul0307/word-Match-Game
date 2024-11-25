document.getElementById('user-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get the values from the input fields
    const userName = document.getElementById('user-name').value || "Guest";  // Default to empty string if not provided
    const userEmail = document.getElementById('user-email').value ||"guest@example.com"; // Default to empty string if not provided

    // Save the data using localStorage with different keys
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', userEmail);

    // Redirect to the game page
    window.location.href = 'game.html';
});
