document.addEventListener('DOMContentLoaded', function () {
    if (window.location.pathname.endsWith('index.html')) {
        const videoElement = document.getElementById('video-player');
        const videoSource = document.getElementById('video-source');
        const fallbackBg = document.getElementById('fallback-bg');

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

        // Initial video source update
        updateVideoSource();

        // Update video on resize
        window.addEventListener('resize', updateVideoSource);

        // Redirect when clicking video or fallback
        const redirectToUser = () => {
            window.location.href = 'user.html';
        };

        videoElement.addEventListener('click', redirectToUser);
        fallbackBg.addEventListener('click', redirectToUser);

        // Handle video load errors (hide video to reveal fallback)
        videoElement.addEventListener('error', () => {
            console.warn('Video failed to load — showing fallback image.');
            videoElement.classList.add('hidden');
        });

        videoSource.addEventListener('error', () => {
            console.warn('Video source not found — showing fallback image.');
            videoElement.classList.add('hidden');
        });
    }
});
