// index.js

(function() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.querySelector('.loading-text');
    const dotsElement = document.querySelector('.dots');
    const progressBar = document.getElementById('progress-bar');
    const statusMessage = document.querySelector('.status-message');
    const slowMessage = document.getElementById('slow-message');
    const mainContent = document.getElementById('main-content');
    const navbar = document.getElementById('navbar');
    let dotsInterval;
    let progressInterval;
    let progress = 0;
    let timeoutId;
    let lastProgress = 0;
    let slowCheckInterval;
    let isSlowDetected = false;

    // Function to check connection (simulate server check)
    async function checkConnection() {
        try {
            const startTime = Date.now();
            await fetch('https://www.w3.org/TR/SVG/', { method: 'HEAD', mode: 'no-cors' }); // Use a reliable URL for connection test
            const endTime = Date.now();
            if (endTime - startTime > 2000) { // If response >2s, consider slow
                return { isSlow: true, latency: endTime - startTime };
            }
            return { isSlow: false };
        } catch (error) {
            return { isSlow: true };
        }
    }

    // Animated dots: Cycle through . .. ... with blink on last two
    function animateDots() {
        let dots = '';
        dotsInterval = setInterval(() => {
            if (dots === '...') {
                dots = '';
            } else {
                dots += '.';
            }
            dotsElement.textContent = dots;
            if (dots.length >= 2) {
                dotsElement.style.animation = 'blink 0.5s ease-in-out';
            } else {
                dotsElement.style.animation = 'none';
            }
        }, 500);
    }

    // Simulate progress bar, but make it accurate based on connection
    async function simulateProgress() {
        // Initial quick progress for local assets
        let localProgress = 0;
        const localInterval = setInterval(() => {
            if (localProgress < 30) { // 30% for local
                localProgress += 3;
                progress = localProgress;
                progressBar.style.width = progress + '%';
                lastProgress = progress;
            } else {
                clearInterval(localInterval);
                // Check connection and adjust
                checkConnection().then(({ isSlow }) => {
                    if (isSlow) {
                        isSlowDetected = true;
                        slowMessage.style.display = 'block';
                        // Slower increment for slow connection
                        progressInterval = setInterval(() => {
                            if (progress < 100) {
                                progress += 0.5; // Very slow
                                progressBar.style.width = progress + '%';
                                lastProgress = progress;
                            } else {
                                finishProgress();
                            }
                        }, 200);
                        // Additional 5s check if no progress
                        slowCheckInterval = setInterval(() => {
                            if (progress === lastProgress && !isSlowDetected) {
                                slowMessage.style.display = 'block';
                                isSlowDetected = true;
                            }
                        }, 5000);
                    } else {
                        // Normal progress
                        progressInterval = setInterval(() => {
                            if (progress < 100) {
                                progress += 2;
                                progressBar.style.width = progress + '%';
                                lastProgress = progress;
                            } else {
                                finishProgress();
                            }
                        }, 50);
                    }
                });
            }
        }, 100);
    }

    function finishProgress() {
        clearInterval(progressInterval);
        clearInterval(slowCheckInterval);
        // Show "System Ready" and fade out
        loadingText.style.display = 'none';
        statusMessage.style.display = 'block';
        setTimeout(completeLoading, 1000); // Delay for "System Ready" visibility
    }

    // Hide loading screen and show main content/navbar
    function completeLoading() {
        clearTimeout(timeoutId);
        clearInterval(dotsInterval);
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainContent.classList.add('loaded');
            navbar.classList.add('loaded');
            document.body.style.overflow = 'auto'; // Enable scroll if needed
        }, 1000); // Match fade transition
    }

    // Show error on timeout (but still load after)
    function showError() {
        clearInterval(dotsInterval);
        clearInterval(progressInterval);
        loadingText.textContent = 'Connection Timeout';
        progressBar.style.backgroundColor = 'red';
        setTimeout(completeLoading, 2000);
    }

    // Start animations
    animateDots();
    simulateProgress();

    // 5-second overall timeout
    timeoutId = setTimeout(showError, 5000);

    // Wait for DOM and Chatway script
    if (document.readyState === 'complete') {
        handleScriptLoad();
    } else {
        window.addEventListener('load', handleScriptLoad);
    }

    function handleScriptLoad() {
        const script = document.getElementById('chatway');
        if (script.complete || script.readyState === 'complete') {
            // Progress already handles completion
        } else {
            script.onload = () => {};
            script.onerror = showError;
        }
    }
})();
