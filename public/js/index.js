document.addEventListener('DOMContentLoaded', function () {
    const videoElement = document.getElementById('video-player'); // Your video element
    const videoSource = document.getElementById('video-source'); // Video source element

    function updateVideoSource() {
        // Check the orientation of the device
        if (window.innerHeight > window.innerWidth) {
            // Portrait mode
            videoSource.src = '../public/videos/portrait.mp4'; // Load portrait video
        } else {
            // Landscape mode
            videoSource.src = '../public/videos/landscape.mp4'; // Load landscape video
        }
        // Reload the video to apply the new source
        videoElement.load();
    }

    // Initial video source update on page load
    updateVideoSource();

    // Update video source on orientation change or resize
    window.addEventListener('resize', updateVideoSource);

    // Optional: Add click event to redirect when the video is clicked
    if (videoElement) {
        videoElement.addEventListener('click', function () {
            window.location.href = 'info.html'; // Redirect to the main page
        });
    }
});
