// Interactive elements initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize interactive elements based on current page
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('test-battery.html')) {
        initializeTestBatteryInteractives();
    } else if (currentPage.includes('test-results.html')) {
        initializeTestResultsInteractives();
    }
});

function initializeTestBatteryInteractives() {
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
}

function createOtoscopySimulation(container) {
    container.innerHTML = `
        <div class="simulation-container">
            <h4>Interactive Otoscopy Viewer</h4>
            <div class="simulation-controls">
                <button onclick="rotateOtoscope('left')">Rotate Left</button>
                <button onclick="rotateOtoscope('right')">Rotate Right</button>
            </div>
            <div class="simulation-display">
                <p>Otoscope view simulation will be displayed here</p>
            </div>
        </div>
    `;
}

function createTympanogramSimulation(container) {
    container.innerHTML = `
        <div class="simulation-container">
            <h4>Tympanogram Simulator</h4>
            <div class="simulation-controls">
                <button onclick="changePressure('decrease')">Decrease Pressure</button>
                <button onclick="changePressure('increase')">Increase Pressure</button>
            </div>
            <div class="simulation-display">
                <p>Tympanogram curve will be displayed here</p>
            </div>
        </div>
    `;
}

function createAudiogramSimulation(container) {
    container.innerHTML = `
        <div class="simulation-container">
            <h4>Audiogram Simulator</h4>
            <div class="simulation-controls">
                <select id="frequency-selector">
                    <option value="250">250 Hz</option>
                    <option value="500">500 Hz</option>
                    <option value="1000">1000 Hz</option>
                    <option value="2000">2000 Hz</option>
                    <option value="4000">4000 Hz</option>
                    <option value="8000">8000 Hz</option>
                </select>
                <input type="range" min="0" max="120" value="20" id="threshold-slider">
            </div>
            <div class="simulation-display">
                <p>Audiogram will be displayed here</p>
            </div>
        </div>
    `;
}

function createSpeechAudiometrySimulation(container) {
    container.innerHTML = `
        <div class="simulation-container">
            <h4>Speech Audiometry Simulator</h4>
            <div class="simulation-controls">
                <button onclick="playSampleWord()">Play Sample Word</button>
                <input type="range" min="0" max="100" value="50" id="intensity-slider">
            </div>
            <div class="simulation-display">
                <p>Speech audiometry simulation will be displayed here</p>
            </div>
        </div>
    `;
}

// Placeholder functions for interactive controls
function rotateOtoscope(direction) {
    console.log('Rotating otoscope:', direction);
}

function changePressure(direction) {
    console.log('Changing pressure:', direction);
}

function playSampleWord() {
    console.log('Playing sample word');
}

// Initialize test results page if needed
function initializeTestResultsInteractives() {
    console.log('Initializing test results page interactives');
}