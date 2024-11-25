document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('index.html')) {
        const videoElement = document.getElementById('video-player');
        const videoSource = document.getElementById('video-source');

        function updateVideoSource() {
            if (window.innerHeight > window.innerWidth) {
                // Portrait mode
                videoSource.src = '../public/videos/portrait.mp4';
            } else {
                // Landscape mode
                videoSource.src = '../public/videos/landscape.mp4';
            }
            videoElement.load();
        }

        // Initial update
        updateVideoSource();

        // Listen to resize events
        window.addEventListener('resize', updateVideoSource);

        // Redirect on video click
        videoElement.addEventListener('click', () => {
            window.location.href = 'user.html';
        });
    }
});
