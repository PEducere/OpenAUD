// Create AudioContext
let audioContext;
let oscillator;
let gainNode;

const AudiometrySimulator = {
    data: {
        frequencies: [125, 250, 500, 1000, 2000, 4000, 8000],
        intensities: Array.from({ length: 121 }, (_, i) => -10 + i),
        currentFreq: 1000,
        currentDB: 40,
        currentEar: 'right',
        thresholds: {
            right: {},
            left: {}
        },
        patientSimulation: {
            right: {},
            left: {}
        },
        responseDelay: {
            min: 100,
            max: 500
        },
        isPlaying: false
    },

    // Initialize audio context on first user interaction
    initAudio: function() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            
            // Create stereo panner for ear selection
            this.stereoPanner = audioContext.createStereoPanner();
            gainNode.connect(this.stereoPanner);
            this.stereoPanner.connect(audioContext.destination);
        }
    },

    // Play pure tone with proper calibration
    playTone: function() {
        if (this.data.isPlaying) return;
        this.data.isPlaying = true;
        this.initAudio();
        
        if (oscillator) {
            oscillator.stop();
        }

        oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(this.data.currentFreq, audioContext.currentTime);
        
        const frequencyCalibration = {
            125: 0.8,
            250: 0.85,
            500: 0.9,
            1000: 1.0,
            2000: 1.1,
            4000: 1.15,
            8000: 1.2
        };

        const calibrationFactor = frequencyCalibration[this.data.currentFreq] || 1;
        const gainValue = Math.pow(10, (this.data.currentDB - 100) / 20) * calibrationFactor;
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(gainValue, audioContext.currentTime + 0.02);

        this.stereoPanner.pan.setValueAtTime(this.data.currentEar === 'right' ? 1 : -1, audioContext.currentTime);

        oscillator.connect(gainNode);
        oscillator.start();

        const responseDelay = Math.random() * 
            (this.data.responseDelay.max - this.data.responseDelay.min) + 
            this.data.responseDelay.min;

        setTimeout(() => {
            this.checkResponse();
        }, responseDelay);

        setTimeout(() => {
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.02);
            setTimeout(() => {
                oscillator.stop();
                this.data.isPlaying = false;
            }, 20);
        }, 1000);
    },

    // Generate random patient thresholds with realistic patterns
    generatePatient: function() {
        const patterns = [
            {
                name: 'normal',
                baseThreshold: 10,
                slope: 0,
                variation: 5
            },
            {
                name: 'mild-high-frequency',
                baseThreshold: 25,
                slope: 5,
                variation: 10
            },
            {
                name: 'moderate-flat',
                baseThreshold: 45,
                slope: 0,
                variation: 10
            },
            {
                name: 'severe-sloping',
                baseThreshold: 60,
                slope: 10,
                variation: 15
            },
            {
                name: 'cookie-bite',
                baseThreshold: 30,
                midFreqAdd: 20,
                variation: 10
            },
            {
                name: 'noise-notch',
                baseThreshold: 20,
                notchFreq: 4000,
                notchDepth: 30,
                variation: 10
            }
        ];

        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
        console.log(`Generated patient with ${selectedPattern.name} pattern`);

        this.data.frequencies.forEach((freq, index) => {
            let threshold;
            const freqIndex = this.data.frequencies.indexOf(freq);
            const normalizedIndex = freqIndex / (this.data.frequencies.length - 1);

            switch (selectedPattern.name) {
                case 'normal':
                    threshold = selectedPattern.baseThreshold + 
                              (Math.random() * 2 - 1) * selectedPattern.variation;
                    break;
                case 'mild-high-frequency':
                case 'severe-sloping':
                    threshold = selectedPattern.baseThreshold + 
                              (normalizedIndex * selectedPattern.slope * 10) +
                              (Math.random() * 2 - 1) * selectedPattern.variation;
                    break;
                case 'moderate-flat':
                    threshold = selectedPattern.baseThreshold +
                              (Math.random() * 2 - 1) * selectedPattern.variation;
                    break;
                case 'cookie-bite':
                    const midPoint = this.data.frequencies.length / 2;
                    const distanceFromMid = Math.abs(freqIndex - midPoint) / midPoint;
                    threshold = selectedPattern.baseThreshold +
                              selectedPattern.midFreqAdd * (1 - distanceFromMid) +
                              (Math.random() * 2 - 1) * selectedPattern.variation;
                    break;
                case 'noise-notch':
                    const notchEffect = freq === selectedPattern.notchFreq ? 
                        selectedPattern.notchDepth : 
                        selectedPattern.notchDepth / (1 + Math.abs(Math.log2(freq/selectedPattern.notchFreq)));
                    threshold = selectedPattern.baseThreshold +
                              notchEffect +
                              (Math.random() * 2 - 1) * selectedPattern.variation;
                    break;
            }

            threshold = Math.min(120, Math.max(-10, threshold));
            this.data.patientSimulation.right[freq] = Math.round(threshold);
            this.data.patientSimulation.left[freq] = Math.round(threshold + (Math.random() * 10 - 5));
        });

        this.data.thresholds.right = {};
        this.data.thresholds.left = {};
        this.updateAudiogram();
    },

    checkResponse: function() {
        const patientThreshold = this.data.patientSimulation[this.data.currentEar][this.data.currentFreq];
        const intensityDifference = this.data.currentDB - patientThreshold;
        
        let responseChance;
        if (intensityDifference > 5) {
            responseChance = 0.98;
        } else if (intensityDifference > 0) {
            responseChance = 0.8;
        } else if (intensityDifference > -5) {
            responseChance = 0.3;
        } else {
            responseChance = 0.05;
        }
    
        if (Math.random() < 0.02) {
            responseChance = 0;
        }
        if (Math.random() < 0.01) {
            responseChance = 1;
        }
    
        const didRespond = Math.random() < responseChance;
    
        const responseBar = document.querySelector('.response-indicator');
        const responseText = document.querySelector('.response-text');
        
        responseBar.style.width = didRespond ? '100%' : '0%';
        responseBar.style.backgroundColor = didRespond ? '#22c55e' : '#ef4444';
        responseText.textContent = didRespond ? 'Heard' : 'Not Heard';
    
        setTimeout(() => {
            responseBar.style.width = '0%';
            responseText.textContent = 'Not Heard';
        }, 1000);
    },

    saveThreshold: function() {
        this.data.thresholds[this.data.currentEar][this.data.currentFreq] = this.data.currentDB;
        this.updateAudiogram();
    },

    updateAudiogram: function() {
        const canvas = document.getElementById('audiogramCanvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawAudiogramGrid(ctx);
        this.plotThresholds(ctx);
    },

    drawAudiogramGrid: function(ctx) {
        const width = ctx.canvas.width / window.devicePixelRatio;
        const height = ctx.canvas.height / window.devicePixelRatio;
        const padding = 40;
        
        ctx.font = '12px Arial';
        
        // Draw frequency lines and labels
        this.data.frequencies.forEach((freq, index) => {
            const x = padding + (index * (width - 2 * padding) / (this.data.frequencies.length - 1));
            
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.strokeStyle = '#eee';
            ctx.stroke();
            
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.fillText(freq.toString(), x, height - padding + 20);
        });
        
        // Draw intensity lines and labels
        for(let db = -10; db <= 120; db += 10) {
            const y = padding + ((db + 10) * (height - 2 * padding) / 130);
            
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.strokeStyle = '#eee';
            ctx.stroke();
            
            ctx.fillStyle = '#000';
            ctx.textAlign = 'right';
            ctx.fillText(db.toString(), padding - 5, y + 4);
        }
    },

    plotThresholds: function(ctx) {
        const width = ctx.canvas.width / window.devicePixelRatio;
        const height = ctx.canvas.height / window.devicePixelRatio;
        const padding = 40;
        
        // Plot right ear (red circles)
        Object.entries(this.data.thresholds.right).forEach(([freq, db]) => {
            const x = padding + (this.data.frequencies.indexOf(parseInt(freq)) * 
                               (width - 2 * padding) / (this.data.frequencies.length - 1));
            const y = padding + ((db + 10) * (height - 2 * padding) / 130);
            
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.strokeStyle = 'red';
            ctx.stroke();
        });
        
        // Plot left ear (blue X's)
        Object.entries(this.data.thresholds.left).forEach(([freq, db]) => {
            const x = padding + (this.data.frequencies.indexOf(parseInt(freq)) * 
                               (width - 2 * padding) / (this.data.frequencies.length - 1));
            const y = padding + ((db + 10) * (height - 2 * padding) / 130);
            
            ctx.strokeStyle = 'blue';
            ctx.beginPath();
            ctx.moveTo(x - 5, y - 5);
            ctx.lineTo(x + 5, y + 5);
            ctx.moveTo(x + 5, y - 5);
            ctx.lineTo(x - 5, y + 5);
            ctx.stroke();
        });
    },

    updateFrequency: function(direction) {
        const currentIndex = this.data.frequencies.indexOf(this.data.currentFreq);
        const newIndex = direction === 'up' ? 
            Math.min(currentIndex + 1, this.data.frequencies.length - 1) :
            Math.max(currentIndex - 1, 0);
        
        this.data.currentFreq = this.data.frequencies[newIndex];
        document.getElementById('freq-display').textContent = `${this.data.currentFreq} Hz`;
    },

    updateIntensity: function(direction) {
        const step = 5;
        this.data.currentDB = direction === 'up' ?
            Math.min(this.data.currentDB + step, 120) :
            Math.max(this.data.currentDB - step, -10);
        
        document.getElementById('db-display').textContent = `${this.data.currentDB} dB`;
    },

    initialize: function() {
        document.getElementById('playTone').addEventListener('click', () => this.playTone());
        document.getElementById('saveThreshold').addEventListener('click', () => this.saveThreshold());
        document.getElementById('newPatient').addEventListener('click', () => this.generatePatient());
        
        document.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                if (action === 'freq-up' || action === 'freq-down') {
                    this.updateFrequency(action.split('-')[1]);
                } else if (action === 'db-up' || action === 'db-down') {
                    this.updateIntensity(action.split('-')[1]);
                }
            });
        });
        
        document.querySelectorAll('.ear-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.ear-button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                this.data.currentEar = button.dataset.ear;
            });
        });
        
        this.generatePatient();
        this.updateAudiogram();
        
        window.addEventListener('resize', () => this.updateAudiogram());
    }
};

document.addEventListener('DOMContentLoaded', function() {
    AudiometrySimulator.initialize();
});
