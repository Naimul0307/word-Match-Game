document.addEventListener('DOMContentLoaded', function () {
  // Load saved values (if any)
  const savedGridSize = localStorage.getItem('gridSize');
  const savedTimerDuration = localStorage.getItem('timerDuration');
  const savedWordCount = localStorage.getItem('wordCount');

  // If values exist, set them in the form
  if (savedGridSize) document.getElementById('grid-size').value = savedGridSize;
  if (savedTimerDuration) document.getElementById('timer-duration').value = savedTimerDuration;
  if (savedWordCount) document.getElementById('word-count').value = savedWordCount;

  // Save new values on submit
  document.getElementById('settings-info-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const gridSize = document.getElementById('grid-size').value;
    const timerDuration = document.getElementById('timer-duration').value;
    const wordCount = document.getElementById('word-count').value;

    // Save values in localStorage
    localStorage.setItem('gridSize', gridSize);
    localStorage.setItem('timerDuration', timerDuration);
    localStorage.setItem('wordCount', wordCount);

    // Show success message
    showSaveSuccessMessage();
  });
});

function showSaveSuccessMessage() {
  let messageEl = document.getElementById('save-success-message');

  // Create the element once, reuse it on subsequent saves
  if (!messageEl) {
    messageEl = document.createElement('div');
    messageEl.id = 'save-success-message';
    messageEl.textContent = 'Settings saved successfully!';
    messageEl.style.cssText = `
      margin-top: 10px;
      padding: 10px 15px;
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      font-size: 14px;
      transition: opacity 0.4s ease;
    `;
    document.getElementById('settings-info-form').insertAdjacentElement('afterend', messageEl);
  }

  // Reset visibility/opacity in case it's still fading from a previous save
  messageEl.style.display = 'block';
  messageEl.style.opacity = '1';

  // Clear any pending fade-out from a previous save
  if (messageEl._fadeTimeout) clearTimeout(messageEl._fadeTimeout);
  if (messageEl._hideTimeout) clearTimeout(messageEl._hideTimeout);

  // Fade out after 2.5s, then hide
  messageEl._fadeTimeout = setTimeout(() => {
    messageEl.style.opacity = '0';
    messageEl._hideTimeout = setTimeout(() => {
      messageEl.style.display = 'none';
    }, 400);
  }, 2500);
}