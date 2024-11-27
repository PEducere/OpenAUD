// Create a namespace for the simulator
const TympanometrySimulator = {
    data: {
        types: {
            typeA: {
                name: 'Type A (Normal)',
                description: 'Normal middle ear function with normal compliance and pressure. This indicates healthy middle ear function with normal tympanic membrane mobility.',
                peakPressure: 0,
                peakCompliance: 0.8
            },
            typeAs: {
                name: 'Type As (Shallow)',
                description: 'Suggests reduced mobility of the tympanic membrane, possibly due to otosclerosis or early stages of middle ear effusion. The reduced compliance peak indicates stiffening of the middle ear system.',
                peakPressure: 0,
                peakCompliance: 0.3
            },
            typeAd: {
                name: 'Type Ad (Deep)',
                description: 'Indicates hypermobile tympanic membrane, possibly due to ossicular discontinuity or scarring. The increased compliance peak suggests reduced resistance to movement in the middle ear system.',
                peakPressure: 0,
                peakCompliance: 1.8
            },
            typeB: {
                name: 'Type B (Flat)',
                description: 'Suggests fluid in the middle ear or tympanic membrane perforation. The flat response indicates either the presence of middle ear effusion or a non-intact tympanic membrane.',
                peakPressure: null,
                peakCompliance: 0.2
            },
            typeC: {
                name: 'Type C (Negative Peak)',
                description: 'Indicates negative middle ear pressure, possibly due to Eustachian tube dysfunction. The shifted peak suggests poor ventilation of the middle ear space.',
                peakPressure: -200,
                peakCompliance: 0.8
            }
        },
        currentType: 'typeA',
        isPracticeMode: false,
        currentPracticeType: null,
        practiceStats: {
            correct: 0,
            total: 0
        }
    },

    // Generate curve data
    generateCurveData: function(type) {
        const typeInfo = this.data.types[type];
        const data = [];
        
        for(let pressure = -400; pressure <= 400; pressure += 5) {
            let compliance;
            if (type === 'typeB') {
                compliance = 0.2;
            } else {
                const peak = typeInfo.peakPressure || 0;
                const width = type === 'typeAs' ? 50 : type === 'typeAd' ? 100 : 75;
                compliance = typeInfo.peakCompliance * 
                    Math.exp(-Math.pow(pressure - peak, 2) / (2 * Math.pow(width, 2)));
            }
            data.push({ pressure, compliance });
        }
        return data;
    },

    // Generate random tympanogram type
    getRandomType: function() {
        const types = Object.keys(this.data.types);
        return types[Math.floor(Math.random() * types.length)];
    },

    // Start practice mode
    startPracticeMode: function() {
        this.data.isPracticeMode = true;
        this.data.practiceStats = { correct: 0, total: 0 };
        this.generateNewPracticeQuestion();
        this.updateControls();
    },

    // End practice mode
    endPracticeMode: function() {
        this.data.isPracticeMode = false;
        this.data.currentType = 'typeA';
        this.updateControls();
        this.updateInfo();
        this.drawGraph();
    },

    // Generate new practice question
    generateNewPracticeQuestion: function() {
        this.data.currentPracticeType = this.getRandomType();
        this.data.currentType = this.data.currentPracticeType;
        this.updateInfo(true); // Hide type info
        this.drawGraph();
    },

    // Check practice answer
    checkAnswer: function(selectedType) {
        const isCorrect = selectedType === this.data.currentPracticeType;
        this.data.practiceStats.total++;
        if (isCorrect) this.data.practiceStats.correct++;
        
        // Show result
        const resultMessage = isCorrect ? 
            '<div class="correct">✓ Correct!</div>' : 
            `<div class="incorrect">✗ Incorrect. This was a ${this.data.types[this.data.currentPracticeType].name}</div>`;
        
        const infoCard = document.getElementById('infoCard');
        if (infoCard) {
            infoCard.innerHTML = `
                ${resultMessage}
                <div class="stats">
                    Score: ${this.data.practiceStats.correct}/${this.data.practiceStats.total} 
                    (${Math.round(this.data.practiceStats.correct/this.data.practiceStats.total * 100)}%)
                </div>
                <button onclick="TympanometrySimulator.generateNewPracticeQuestion()" class="next-button">Next Tympanogram</button>
            `;
        }
    },

    // Draw the graph
    drawGraph: function() {
        const canvas = document.getElementById('tympCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = 50;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        for(let x = -400; x <= 400; x += 100) {
            const xPos = padding + (x + 400) * (width - 2 * padding) / 800;
            ctx.beginPath();
            ctx.moveTo(xPos, padding);
            ctx.lineTo(xPos, height - padding);
            ctx.stroke();
        }
        for(let y = 0; y <= 2; y += 0.5) {
            const yPos = height - padding - y * (height - 2 * padding) / 2;
            ctx.beginPath();
            ctx.moveTo(padding, yPos);
            ctx.lineTo(width - padding, yPos);
            ctx.stroke();
        }

        // Draw axes
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Add labels
        ctx.font = '12px Arial';
        ctx.fillStyle = '#000';
        
        [-400, -200, 0, 200, 400].forEach(value => {
            const x = padding + (value + 400) * (width - 2 * padding) / 800;
            ctx.fillText(value.toString(), x, height - padding + 20);
        });
        ctx.fillText('Pressure (daPa)', width / 2, height - 10);

        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Compliance (ml)', 0, 0);
        ctx.restore();

        [0, 0.5, 1.0, 1.5, 2.0].forEach(value => {
            const y = height - padding - value * (height - 2 * padding) / 2;
            ctx.fillText(value.toString(), padding - 20, y);
        });

        // Draw curve
        const data = this.generateCurveData(this.data.currentType);
        ctx.beginPath();
        data.forEach((point, i) => {
            const x = padding + (point.pressure + 400) * (width - 2 * padding) / 800;
            const y = height - padding - point.compliance * (height - 2 * padding) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.stroke();
    },

    // Update info display
    updateInfo: function(hidePracticeInfo = false) {
        const infoCard = document.getElementById('infoCard');
        if (!infoCard) return;

        const typeInfo = this.data.types[this.data.currentType];
        if (this.data.isPracticeMode && hidePracticeInfo) {
            infoCard.innerHTML = `
                <h3>Identify this Tympanogram</h3>
                <p>Analyze the curve and select the correct tympanogram type:</p>
                <div class="practice-controls">
                    ${Object.entries(this.data.types).map(([key, type]) => `
                        <button onclick="TympanometrySimulator.checkAnswer('${key}')" class="practice-button">
                            ${type.name}
                        </button>
                    `).join('')}
                </div>
                <div class="stats">
                    Score: ${this.data.practiceStats.correct}/${this.data.practiceStats.total}
                </div>
            `;
        } else {
            infoCard.innerHTML = `
                <h3>${typeInfo.name}</h3>
                <p>${typeInfo.description}</p>
                <div class="measurements">
                    <p><strong>Peak Pressure:</strong> ${typeInfo.peakPressure !== null ? 
                        `${typeInfo.peakPressure} daPa` : 'N/A'}</p>
                    <p><strong>Peak Compliance:</strong> ${typeInfo.peakCompliance.toFixed(1)} ml</p>
                </div>
            `;
        }
    },

    // Update controls based on mode
    updateControls: function() {
        const controlsDiv = document.getElementById('simulator-controls');
        if (!controlsDiv) return;

        if (this.data.isPracticeMode) {
            controlsDiv.innerHTML = `
                <button onclick="TympanometrySimulator.endPracticeMode()" class="mode-button">
                    Exit Practice Mode
                </button>
            `;
        } else {
            controlsDiv.innerHTML = `
                <div class="mode-selection">
                    <label for="tympType">Select Tympanogram Type:</label>
                    <select id="tympType" class="tymp-selector">
                        ${Object.entries(this.data.types).map(([key, type]) => `
                            <option value="${key}">${type.name}</option>
                        `).join('')}
                    </select>
                    <button onclick="TympanometrySimulator.startPracticeMode()" class="mode-button">
                        Start Practice Mode
                    </button>
                </div>
            `;

            // Reattach event listener
            const selector = document.getElementById('tympType');
            if (selector) {
                selector.addEventListener('change', (e) => {
                    this.data.currentType = e.target.value;
                    this.updateInfo();
                    this.drawGraph();
                });
            }
        }
    },

    // Initialize the simulator
    initialize: function() {
        this.updateControls();
        this.updateInfo();
        this.drawGraph();
    }
};

// Initialize when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    TympanometrySimulator.initialize();
});