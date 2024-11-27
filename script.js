// Interactive elements initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize interactive elements based on current page
    const currentPage = window.location.pathname;
    
    try {
        if (currentPage.includes('test-battery.html')) {
            initializeTestBatteryInteractives();
        } else if (currentPage.includes('test-results.html')) {
            initializeTestResultsInteractives();
        }
    } catch (error) {
        console.log('Page initialization error:', error);
    }
});

function initializeTestBatteryInteractives() {
    try {
        // Otoscopy Interactive
        const otoscopyElement = document.getElementById('otoscopy-interactive');
        if (otoscopyElement) {
            createOtoscopySimulation(otoscopyElement);
        }

        // Tympanometry Interactive
        const tympanometryElement = document.getElementById('tympanometry-interactive');
        if (tympanometryElement) {
            createTympanogramSimulation(tympanometryElement);
        }

        // Pure Tone Audiometry Interactive
        const ptaElement = document.getElementById('pta-interactive');
        if (ptaElement) {
            createAudiogramSimulation(ptaElement);
        }

        // Speech Audiometry Interactive
        const speechElement = document.getElementById('speech-interactive');
        if (speechElement) {
            createSpeechAudiometrySimulation(speechElement);
        }
    } catch (error) {
        console.log('Test battery initialization error:', error);
    }
}

// Rest of your functions remain the same...