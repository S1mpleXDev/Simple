// script.js

(function() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingText = document.querySelector('.loading-text');
    const dotsElement = document.querySelector('.dots');
    const progressBar = document.getElementById('progress-bar');
    const statusMessage = document.querySelector('.status-message');
    const mainContent = document.getElementById('main-content');
    const navbar = document.getElementById('navbar');
    let dotsInterval;
    let progressInterval;
    let progress = 0;
    let timeoutId;

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

    // Simulate progress bar
    function simulateProgress() {
        progressInterval = setInterval(() => {
            if (progress < 100) {
                progress += 2;
                progressBar.style.width = progress + '%';
            } else {
                clearInterval(progressInterval);
                // Show "System Ready" and fade out
                loadingText.style.display = 'none';
                statusMessage.style.display = 'block';
                setTimeout(completeLoading, 1000); // Delay for "System Ready" visibility
            }
        }, 50);
    }

    // Define blink animation
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

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

    // 5-second timeout
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
