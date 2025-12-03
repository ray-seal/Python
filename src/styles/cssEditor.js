// ==================== CSS EDITOR MODULE ====================
// Learn CSS by styling your snake pet!
// 
// This module provides:
// - Live CSS editor for learning CSS
// - Pre-built CSS examples (colors, animations, effects)
// - Real-time preview of CSS changes
// - CSS lessons and challenges

(function() {
'use strict';

/**
 * CSSEditor - Interactive CSS learning tool
 */
class CSSEditor {
    constructor(options = {}) {
        this.editorElement = null;
        this.previewElement = null;
        this.styleElement = null;
        this.currentCSS = '';
        
        // Callbacks
        this.onApply = options.onApply || null;
        this.onError = options.onError || null;
        
        // CSS examples for learning
        this.examples = this.getExamples();
        this.challenges = this.getChallenges();
    }

    /**
     * Initialize the CSS editor
     * @param {string} editorId - ID of the textarea element
     * @param {string} previewId - ID of the preview container
     */
    initialize(editorId, previewId) {
        this.editorElement = document.getElementById(editorId);
        this.previewElement = document.getElementById(previewId);
        
        // Create a style element for live CSS
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'user-css-styles';
        document.head.appendChild(this.styleElement);
        
        // Set default CSS
        this.setDefaultCSS();
        
        return this;
    }

    /**
     * Set default starter CSS
     */
    setDefaultCSS() {
        const defaultCSS = `/* 🎨 Style your snake! */
/* Try changing the colors below */

.snake-body {
    fill: #4ecca3;
}

.snake-light {
    fill: #a8e6cf;
}

.pet-background {
    background-color: #0f3460;
}

/* 🕺 Uncomment to make snake dance!
#pet-canvas {
    animation: dance 0.5s ease infinite;
}
*/`;
        
        if (this.editorElement) {
            this.editorElement.value = defaultCSS;
        }
        this.currentCSS = defaultCSS;
    }

    /**
     * Apply CSS from the editor
     */
    applyCSS() {
        if (!this.editorElement || !this.styleElement) return;
        
        const css = this.editorElement.value;
        
        try {
            // Validate CSS (basic check)
            this.validateCSS(css);
            
            // Apply the CSS
            this.styleElement.textContent = css;
            this.currentCSS = css;
            
            // Extract colors and apply to canvas
            this.extractAndApplyColors(css);
            
            if (this.onApply) {
                this.onApply(css);
            }
            
            return { success: true, message: '✅ CSS applied successfully!' };
        } catch (e) {
            if (this.onError) {
                this.onError(e);
            }
            return { success: false, message: `❌ CSS Error: ${e.message}` };
        }
    }

    /**
     * Basic CSS validation
     * @param {string} css - CSS to validate
     */
    validateCSS(css) {
        // Check for balanced braces
        const openBraces = (css.match(/{/g) || []).length;
        const closeBraces = (css.match(/}/g) || []).length;
        
        if (openBraces !== closeBraces) {
            throw new Error('Unbalanced curly braces { }');
        }
        
        // Check for common syntax errors
        if (css.includes(';;')) {
            throw new Error('Double semicolons detected');
        }
    }

    /**
     * Extract color values from CSS and apply to canvas colors
     * @param {string} css - CSS string
     */
    extractAndApplyColors(css) {
        // Extract snake-body color
        const bodyMatch = css.match(/\.snake-body\s*{\s*fill:\s*([^;]+)/);
        if (bodyMatch && window.updateSnakeColor) {
            window.updateSnakeColor('body', bodyMatch[1].trim());
        }
        
        // Extract snake-light color
        const lightMatch = css.match(/\.snake-light\s*{\s*fill:\s*([^;]+)/);
        if (lightMatch && window.updateSnakeColor) {
            window.updateSnakeColor('light', lightMatch[1].trim());
        }
        
        // Extract background color
        const bgMatch = css.match(/\.pet-background\s*{\s*background-color:\s*([^;]+)/);
        if (bgMatch && window.updateBackgroundColor) {
            window.updateBackgroundColor(bgMatch[1].trim());
        }
    }

    /**
     * Load an example into the editor
     * @param {string} exampleName - Name of the example
     */
    loadExample(exampleName) {
        const example = this.examples[exampleName];
        if (example && this.editorElement) {
            this.editorElement.value = example.css;
            return { success: true, message: example.description };
        }
        return { success: false, message: 'Example not found' };
    }

    /**
     * Get list of available examples
     * @returns {array} - Array of example names and descriptions
     */
    getExampleList() {
        return Object.entries(this.examples).map(([name, data]) => ({
            name,
            title: data.title,
            description: data.description
        }));
    }

    /**
     * Get CSS examples for learning
     */
    getExamples() {
        return {
            'rainbow': {
                title: '🌈 Rainbow Snake',
                description: 'Learn about color gradients!',
                css: `/* 🌈 Rainbow Snake */
/* CSS can use color names, hex codes, or rgb values */

.snake-body {
    fill: #ff6b6b;  /* Red-ish */
}

.snake-light {
    fill: #ffd93d;  /* Yellow */
}

.pet-background {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Make the canvas colorful! */
#pet-canvas {
    border: 4px solid #ff6b6b;
    border-radius: 16px;
}`
            },
            'ocean': {
                title: '🌊 Ocean Theme',
                description: 'Cool blue colors like the ocean!',
                css: `/* 🌊 Ocean Theme */
/* Using different shades of blue */

.snake-body {
    fill: #0077b6;  /* Deep ocean blue */
}

.snake-light {
    fill: #90e0ef;  /* Light sea foam */
}

.pet-background {
    background-color: #03045e;  /* Dark ocean */
}

/* Add a wave effect */
#pet-canvas {
    animation: wave 3s ease-in-out infinite;
}

@keyframes wave {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
}`
            },
            'sunset': {
                title: '🌅 Sunset Theme',
                description: 'Warm sunset colors!',
                css: `/* 🌅 Sunset Theme */
/* Warm oranges and purples */

.snake-body {
    fill: #ff7b00;  /* Orange */
}

.snake-light {
    fill: #ffaa00;  /* Golden */
}

.pet-background {
    background: linear-gradient(180deg, #240046 0%, #ff6d00 100%);
}

/* Gentle glow effect */
#pet-canvas {
    box-shadow: 0 0 20px rgba(255, 123, 0, 0.5);
}`
            },
            'neon': {
                title: '💜 Neon Glow',
                description: 'Bright neon colors with glow effects!',
                css: `/* 💜 Neon Glow */
/* Bright colors with glowing effects */

.snake-body {
    fill: #ff00ff;  /* Magenta */
}

.snake-light {
    fill: #00ffff;  /* Cyan */
}

.pet-background {
    background-color: #0a0a0a;  /* Dark */
}

/* Neon glow effect */
#pet-canvas {
    box-shadow: 
        0 0 10px #ff00ff,
        0 0 20px #ff00ff,
        0 0 30px #ff00ff;
    border: 2px solid #00ffff;
}`
            },
            'dance': {
                title: '🕺 Dancing Snake',
                description: 'Learn CSS animations!',
                css: `/* 🕺 Dancing Snake */
/* CSS animations make things move! */

.snake-body {
    fill: #4ecca3;
}

.snake-light {
    fill: #a8e6cf;
}

.pet-background {
    background-color: #1a1a2e;
}

/* The dance animation */
#pet-canvas {
    animation: dance 0.5s ease infinite;
}

/* @keyframes defines the animation steps */
@keyframes dance {
    0%, 100% { transform: rotate(-5deg) scale(1); }
    25% { transform: rotate(5deg) scale(1.05); }
    50% { transform: rotate(-5deg) scale(1); }
    75% { transform: rotate(5deg) scale(0.95); }
}`
            },
            'bounce': {
                title: '⬆️ Bouncing Snake',
                description: 'Make your snake bounce up and down!',
                css: `/* ⬆️ Bouncing Snake */
/* Learn about transform and animation-timing */

.snake-body {
    fill: #4ecca3;
}

.snake-light {
    fill: #a8e6cf;
}

.pet-background {
    background-color: #0f3460;
}

/* Bounce animation */
#pet-canvas {
    animation: bounce 1s ease infinite;
}

@keyframes bounce {
    0%, 100% { 
        transform: translateY(0); 
    }
    50% { 
        transform: translateY(-20px); 
    }
}`
            },
            'spin': {
                title: '🔄 Spinning Snake',
                description: 'Learn rotation transforms!',
                css: `/* 🔄 Spinning Snake */
/* Use transform: rotate() to spin things */

.snake-body {
    fill: #ff6b6b;
}

.snake-light {
    fill: #ffd93d;
}

.pet-background {
    background-color: #2d3436;
}

/* Spin animation */
#pet-canvas {
    animation: spin 3s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}`
            },
            'pulse': {
                title: '💗 Pulsing Snake',
                description: 'Create a heartbeat effect!',
                css: `/* 💗 Pulsing Snake */
/* Scale makes things bigger and smaller */

.snake-body {
    fill: #e84393;  /* Pink */
}

.snake-light {
    fill: #fd79a8;  /* Light pink */
}

.pet-background {
    background-color: #2d3436;
}

/* Pulse like a heartbeat */
#pet-canvas {
    animation: pulse 1.5s ease infinite;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}`
            },
            'shake': {
                title: '📳 Shaking Snake',
                description: 'Make your snake shake with excitement!',
                css: `/* 📳 Shaking Snake */
/* Quick back-and-forth movement */

.snake-body {
    fill: #fdcb6e;  /* Yellow */
}

.snake-light {
    fill: #ffeaa7;  /* Light yellow */
}

.pet-background {
    background-color: #2d3436;
}

/* Shake animation */
#pet-canvas {
    animation: shake 0.3s ease infinite;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}`
            },
            'glow': {
                title: '✨ Glowing Snake',
                description: 'Learn about box-shadow for glow effects!',
                css: `/* ✨ Glowing Snake */
/* box-shadow can create glow effects */

.snake-body {
    fill: #00ff88;  /* Bright green */
}

.snake-light {
    fill: #88ffcc;
}

.pet-background {
    background-color: #0a0a0a;  /* Very dark */
}

/* Pulsing glow effect */
#pet-canvas {
    animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
    0%, 100% {
        box-shadow: 0 0 10px #00ff88,
                    0 0 20px #00ff88;
    }
    50% {
        box-shadow: 0 0 20px #00ff88,
                    0 0 40px #00ff88,
                    0 0 60px #00ff88;
    }
}`
            }
        };
    }

    /**
     * Get CSS challenges for learning
     */
    getChallenges() {
        return [
            {
                id: 1,
                title: 'Change the Color',
                description: 'Change the snake body color to red (#ff0000)',
                hint: 'Look for .snake-body and change the fill color',
                check: (css) => css.includes('#ff0000') || css.includes('red')
            },
            {
                id: 2,
                title: 'Add a Border',
                description: 'Add a 4px solid border to #pet-canvas',
                hint: 'Use: border: 4px solid #color;',
                check: (css) => /border:\s*\d+px\s+solid/.test(css)
            },
            {
                id: 3,
                title: 'Create an Animation',
                description: 'Make the snake bounce using @keyframes',
                hint: 'Define @keyframes bounce { } and use animation: bounce',
                check: (css) => css.includes('@keyframes') && css.includes('animation')
            }
        ];
    }

    /**
     * Check if a challenge is completed
     * @param {number} challengeId - Challenge ID
     * @returns {boolean}
     */
    checkChallenge(challengeId) {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (!challenge || !this.editorElement) return false;
        
        return challenge.check(this.editorElement.value);
    }

    /**
     * Get current CSS
     * @returns {string}
     */
    getCurrentCSS() {
        return this.currentCSS;
    }

    /**
     * Reset to default CSS
     */
    reset() {
        this.setDefaultCSS();
        this.applyCSS();
    }

    /**
     * Remove all applied styles
     */
    clearStyles() {
        if (this.styleElement) {
            this.styleElement.textContent = '';
        }
    }
}

/**
 * Create a new CSSEditor instance
 * @param {object} options - Editor options
 * @returns {CSSEditor}
 */
function createCSSEditor(options) {
    return new CSSEditor(options);
}

// Export for browser
if (typeof window !== 'undefined') {
    window.CSSEditor = CSSEditor;
    window.createCSSEditor = createCSSEditor;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CSSEditor,
        createCSSEditor
    };
}

})(); // End of IIFE
