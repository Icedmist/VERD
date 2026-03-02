// ═══════════════════════════════════════════
//  Voice Scanner — Web Speech API Integration
// ═══════════════════════════════════════════
//  Provides voice feedback during crop scanning
//  using the browser's built-in Speech Synthesis API.
//  Works offline once voices are loaded.
// ═══════════════════════════════════════════

window.VoiceScanner = {
    _enabled: localStorage.getItem('verd_voice') !== 'off',
    _synth: window.speechSynthesis || null,
    _voice: null,
    _speaking: false,

    /** Toggle voice on/off */
    toggle() {
        this._enabled = !this._enabled;
        localStorage.setItem('verd_voice', this._enabled ? 'on' : 'off');
        if (this._enabled) {
            this.speak('Voice guidance enabled');
        } else {
            this.stop();
        }
        return this._enabled;
    },

    isEnabled() { return this._enabled; },

    /** Initialize — pick a clear English voice */
    init() {
        if (!this._synth) return;
        const loadVoices = () => {
            const voices = this._synth.getVoices();
            // Prefer: Google UK Female > Microsoft Zira > any English voice
            this._voice = voices.find(v => v.name.includes('Google UK English Female'))
                || voices.find(v => v.name.includes('Zira'))
                || voices.find(v => v.name.includes('Samantha'))
                || voices.find(v => v.lang.startsWith('en'))
                || voices[0];
        };
        loadVoices();
        this._synth.onvoiceschanged = loadVoices;
    },

    /** Speak a message */
    speak(text, priority = false) {
        if (!this._enabled || !this._synth) return;
        if (this._speaking && !priority) return; // Don't interrupt

        this._synth.cancel(); // Stop any current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this._voice;
        utterance.rate = 1.05;   // Slightly faster
        utterance.pitch = 1.0;
        utterance.volume = 0.85;
        utterance.onstart = () => { this._speaking = true; };
        utterance.onend = () => { this._speaking = false; };
        utterance.onerror = () => { this._speaking = false; };
        this._synth.speak(utterance);
    },

    /** Stop speaking */
    stop() {
        if (this._synth) {
            this._synth.cancel();
            this._speaking = false;
        }
    },

    // ── Scan-specific voice cues ──────────────────

    /** Called when scan starts */
    onScanStart() {
        this.speak('Analyzing crop image. Please hold steady.', true);
    },

    /** Called during scan progress */
    onScanProgress(stage, pct) {
        if (pct === 25) this.speak('Loading machine learning model.');
        else if (pct === 65) this.speak('Running neural network inference.');
        else if (pct === 85) this.speak('Analyzing classification results.');
    },

    /** Called when scan completes */
    onScanComplete(result) {
        if (!result) return;
        const severity = result.severity === 'none' ? 'healthy' :
            result.severity === 'high' ? 'critical' : 'moderate';

        let msg = `Scan complete. `;
        msg += `Detected: ${result.condition}. `;
        msg += `Confidence: ${result.confidence} percent. `;
        msg += `Severity: ${severity}. `;

        if (result.recommendations && result.recommendations.length > 0) {
            msg += `Top recommendation: ${result.recommendations[0]}`;
        }

        this.speak(msg, true);
    },

    /** Called on scan error */
    onScanError() {
        this.speak('Scan failed. Please try again with a clearer image.', true);
    }
};

// Init on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => VoiceScanner.init());
} else {
    VoiceScanner.init();
}
