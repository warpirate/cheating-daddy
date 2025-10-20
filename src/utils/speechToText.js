/**
 * Speech-to-Text Module using Web Speech API
 * Fast, accurate, and built into Chromium (no external dependencies)
 */

class SpeechToTextEngine {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.callbacks = {
            onResult: null,
            onError: null,
            onStart: null,
            onEnd: null,
        };
        this.interimResults = '';
        this.finalResults = '';
        this.silenceTimer = null;
        this.silenceThreshold = 1500; // 1.5 seconds of silence triggers send
    }

    /**
     * Initialize the speech recognition engine
     * @param {Object} options - Configuration options
     * @returns {boolean} Success status
     */
    initialize(options = {}) {
        try {
            // Check if Web Speech API is available
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                console.error('Web Speech API not supported in this browser');
                return false;
            }

            this.recognition = new SpeechRecognition();
            
            // Configure recognition
            this.recognition.continuous = options.continuous !== undefined ? options.continuous : true;
            this.recognition.interimResults = options.interimResults !== undefined ? options.interimResults : true;
            this.recognition.lang = options.language || 'en-US';
            this.recognition.maxAlternatives = 1;

            // Set up event handlers
            this.recognition.onstart = () => {
                this.isListening = true;
                console.log('Speech recognition started');
                if (this.callbacks.onStart) {
                    this.callbacks.onStart();
                }
            };

            this.recognition.onresult = (event) => {
                this.handleResult(event);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (this.callbacks.onError) {
                    this.callbacks.onError(event.error);
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                console.log('Speech recognition ended');
                if (this.callbacks.onEnd) {
                    this.callbacks.onEnd();
                }
                
                // Auto-restart if continuous mode
                if (this.recognition && this.recognition.continuous) {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        // Ignore if already started
                    }
                }
            };

            console.log('Speech recognition initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize speech recognition:', error);
            return false;
        }
    }

    /**
     * Handle speech recognition results
     * @param {SpeechRecognitionEvent} event - Recognition event
     */
    handleResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        // Update interim results
        if (interimTranscript) {
            this.interimResults = interimTranscript;
        }

        // Handle final results
        if (finalTranscript) {
            this.finalResults += finalTranscript;
            
            // Reset silence timer
            if (this.silenceTimer) {
                clearTimeout(this.silenceTimer);
            }

            // Start silence detection timer
            this.silenceTimer = setTimeout(() => {
                this.sendFinalResults();
            }, this.silenceThreshold);

            // Callback with interim results
            if (this.callbacks.onResult) {
                this.callbacks.onResult({
                    transcript: this.finalResults + this.interimResults,
                    isFinal: false,
                    interim: this.interimResults,
                    final: this.finalResults,
                });
            }
        }
    }

    /**
     * Send final results and reset
     */
    sendFinalResults() {
        if (this.finalResults.trim()) {
            if (this.callbacks.onResult) {
                this.callbacks.onResult({
                    transcript: this.finalResults.trim(),
                    isFinal: true,
                    interim: '',
                    final: this.finalResults.trim(),
                });
            }
            
            // Reset for next utterance
            this.finalResults = '';
            this.interimResults = '';
        }
    }

    /**
     * Start listening for speech
     * @returns {boolean} Success status
     */
    start() {
        if (!this.recognition) {
            console.error('Speech recognition not initialized');
            return false;
        }

        if (this.isListening) {
            console.warn('Speech recognition already running');
            return true;
        }

        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            return false;
        }
    }

    /**
     * Stop listening for speech
     * @returns {boolean} Success status
     */
    stop() {
        if (!this.recognition) {
            return false;
        }

        try {
            // Send any pending results
            if (this.silenceTimer) {
                clearTimeout(this.silenceTimer);
            }
            this.sendFinalResults();

            this.recognition.stop();
            this.isListening = false;
            return true;
        } catch (error) {
            console.error('Failed to stop speech recognition:', error);
            return false;
        }
    }

    /**
     * Set callback functions
     * @param {Object} callbacks - Callback functions
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Set silence threshold (ms before sending results)
     * @param {number} threshold - Threshold in milliseconds
     */
    setSilenceThreshold(threshold) {
        this.silenceThreshold = threshold;
    }

    /**
     * Change recognition language
     * @param {string} language - Language code (e.g., 'en-US', 'es-ES')
     */
    setLanguage(language) {
        if (this.recognition) {
            const wasListening = this.isListening;
            
            if (wasListening) {
                this.stop();
            }
            
            this.recognition.lang = language;
            
            if (wasListening) {
                this.start();
            }
        }
    }

    /**
     * Check if currently listening
     * @returns {boolean} Listening status
     */
    isActive() {
        return this.isListening;
    }

    /**
     * Destroy the speech recognition instance
     */
    destroy() {
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
        }
        
        if (this.recognition) {
            this.stop();
            this.recognition = null;
        }
    }
}

// Export singleton instance
let speechEngine = null;

function getSpeechEngine() {
    if (!speechEngine) {
        speechEngine = new SpeechToTextEngine();
    }
    return speechEngine;
}

module.exports = {
    SpeechToTextEngine,
    getSpeechEngine,
};

