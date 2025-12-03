// ==================== TERMINAL INTEGRATION HELPER ====================
// Wires together the script parser, mini-games manager, save manager,
// and settings into the main application
//
// This module provides:
// - Integration facade for all modules
// - Unified API for the main application
// - Settings management integration
// - Event coordination

(function() {
'use strict';

/**
 * TerminalIntegration - Facade for integrating all modules
 */
class TerminalIntegration {
    constructor(options = {}) {
        // Module instances
        this.scriptExecutor = null;
        this.miniGamesManager = null;
        this.saveManager = null;
        
        // Settings
        this.settings = {
            snakeColor: '#4ecca3',
            snakeLightColor: '#a8e6cf',
            backgroundColor: '#0f3460',
            terminalBg: '#0a0a0a',
            executionDelay: 200,
            autoSave: true,
            soundEnabled: false
        };
        
        // References
        this.commands = options.commands || {};
        this.print = options.print || console.log;
        this.gameState = options.gameState || null;
        
        // Callbacks
        this.onSettingsChange = options.onSettingsChange || null;
        this.onCoinsEarned = options.onCoinsEarned || null;
        this.onXPEarned = options.onXPEarned || null;
    }

    /**
     * Initialize all modules
     */
    initialize() {
        // Initialize script parser/executor
        if (typeof window !== 'undefined' && window.ScriptParser) {
            this.scriptExecutor = window.ScriptParser.createExecutor(
                this.commands,
                this.print,
                { executionDelay: this.settings.executionDelay }
            );
        }
        
        // Initialize mini-games manager
        if (typeof window !== 'undefined' && window.createMiniGamesManager) {
            this.miniGamesManager = window.createMiniGamesManager({
                onCoinReward: (coins, info) => {
                    if (this.onCoinsEarned) {
                        this.onCoinsEarned(coins, info);
                    }
                },
                onXPReward: (xp, info) => {
                    if (this.onXPEarned) {
                        this.onXPEarned(xp, info);
                    }
                }
            });
            
            // Register built-in games
            this.registerDefaultGames();
        }
        
        // Initialize save manager
        if (typeof window !== 'undefined' && window.createSaveManager) {
            this.saveManager = window.createSaveManager({
                onSave: () => {
                    // Optional: Show save indicator
                },
                onLoad: () => {
                    // Optional: Show load indicator
                },
                onError: (op, error) => {
                    this.print(`❌ Save/Load error (${op}): ${error.message}`, 'error');
                }
            });
            
            // Load saved settings
            const savedSettings = this.saveManager.loadSettings();
            if (savedSettings) {
                this.applySettings(savedSettings);
            }
        }
        
        return this;
    }

    /**
     * Register default mini-games
     */
    registerDefaultGames() {
        if (!this.miniGamesManager) return;
        
        this.miniGamesManager.registerGame('maze', {
            name: 'Maze Navigator',
            description: 'Navigate through procedurally generated mazes',
            baseReward: 25,
            baseXP: 100,
            bonusMultiplier: 1.5,
            maxBonus: 50
        });
        
        // Future games can be registered here
        // this.miniGamesManager.registerGame('snake', { ... });
    }

    /**
     * Parse and execute a script
     * @param {string} source - Script source code
     * @returns {Promise} - Execution promise
     */
    async executeScript(source) {
        if (!window.ScriptParser) {
            throw new Error('ScriptParser not loaded');
        }
        
        // Re-create executor if needed (to pick up command changes)
        this.scriptExecutor = window.ScriptParser.createExecutor(
            this.commands,
            this.print,
            { executionDelay: this.settings.executionDelay }
        );
        
        const ast = window.ScriptParser.parseScript(source);
        await this.scriptExecutor.execute(ast);
    }

    /**
     * Check if source is a multi-line script
     * @param {string} source - Source code
     * @returns {boolean}
     */
    isMultiLineScript(source) {
        if (!window.ScriptParser) return false;
        return window.ScriptParser.isMultiLineScript(source);
    }

    /**
     * Start a mini-game
     * @param {string} gameId - Game identifier
     * @returns {boolean}
     */
    startGame(gameId) {
        if (!this.miniGamesManager) return false;
        return this.miniGamesManager.startGame(gameId);
    }

    /**
     * End a mini-game
     * @param {string} gameId - Game identifier
     * @param {object} result - Game result
     * @returns {object|null}
     */
    endGame(gameId, result) {
        if (!this.miniGamesManager) return null;
        return this.miniGamesManager.endGame(gameId, result);
    }

    /**
     * Record a move in active game
     * @param {string} gameId - Game identifier
     */
    recordMove(gameId) {
        if (this.miniGamesManager) {
            this.miniGamesManager.recordMove(gameId);
        }
    }

    /**
     * Save game state
     * @param {object} gameState - State to save
     * @param {object} stats - Optional stats
     * @returns {boolean}
     */
    save(gameState, stats) {
        if (!this.saveManager) return false;
        
        const combinedStats = {
            ...stats,
            miniGames: this.miniGamesManager ? this.miniGamesManager.getSaveableStats() : null
        };
        
        return this.saveManager.save(gameState, combinedStats);
    }

    /**
     * Load game state
     * @returns {object|null}
     */
    load() {
        if (!this.saveManager) return null;
        
        const data = this.saveManager.load();
        
        if (data && data.stats && data.stats.miniGames && this.miniGamesManager) {
            this.miniGamesManager.loadStats(data.stats.miniGames);
        }
        
        return data;
    }

    /**
     * Check if save exists
     * @returns {boolean}
     */
    hasSave() {
        return this.saveManager ? this.saveManager.hasSave() : false;
    }

    /**
     * Get save info
     * @returns {object|null}
     */
    getSaveInfo() {
        return this.saveManager ? this.saveManager.getSaveInfo() : null;
    }

    /**
     * Delete save
     * @param {boolean} includeSettings - Also delete settings
     * @returns {boolean}
     */
    deleteSave(includeSettings = false) {
        return this.saveManager ? this.saveManager.deleteSave(includeSettings) : false;
    }

    /**
     * Export save data
     * @returns {string|null}
     */
    exportSave() {
        return this.saveManager ? this.saveManager.exportSave() : null;
    }

    /**
     * Import save data
     * @param {string} jsonString - Data to import
     * @returns {boolean}
     */
    importSave(jsonString) {
        return this.saveManager ? this.saveManager.importSave(jsonString) : false;
    }

    /**
     * Start auto-save
     * @param {function} getStateCallback - Function returning current state
     */
    startAutoSave(getStateCallback) {
        if (this.saveManager && this.settings.autoSave) {
            this.saveManager.startAutoSave(getStateCallback);
        }
    }

    /**
     * Stop auto-save
     */
    stopAutoSave() {
        if (this.saveManager) {
            this.saveManager.stopAutoSave();
        }
    }

    /**
     * Get current settings
     * @returns {object}
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Update a single setting
     * @param {string} key - Setting key
     * @param {any} value - Setting value
     */
    setSetting(key, value) {
        if (key in this.settings) {
            this.settings[key] = value;
            
            if (this.saveManager) {
                this.saveManager.saveSettings(this.settings);
            }
            
            if (this.onSettingsChange) {
                this.onSettingsChange(key, value, this.settings);
            }
        }
    }

    /**
     * Apply multiple settings at once
     * @param {object} newSettings - Settings to apply
     */
    applySettings(newSettings) {
        const changed = [];
        
        for (const [key, value] of Object.entries(newSettings)) {
            if (key in this.settings && this.settings[key] !== value) {
                this.settings[key] = value;
                changed.push(key);
            }
        }
        
        if (changed.length > 0 && this.onSettingsChange) {
            for (const key of changed) {
                this.onSettingsChange(key, this.settings[key], this.settings);
            }
        }
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        this.settings = {
            snakeColor: '#4ecca3',
            snakeLightColor: '#a8e6cf',
            backgroundColor: '#0f3460',
            terminalBg: '#0a0a0a',
            executionDelay: 200,
            autoSave: true,
            soundEnabled: false
        };
        
        if (this.saveManager) {
            this.saveManager.saveSettings(this.settings);
        }
        
        if (this.onSettingsChange) {
            this.onSettingsChange('reset', null, this.settings);
        }
    }

    /**
     * Get mini-games statistics
     * @returns {object}
     */
    getGameStats() {
        return this.miniGamesManager ? this.miniGamesManager.getStats() : null;
    }

    /**
     * Get available mini-games
     * @returns {array}
     */
    getAvailableGames() {
        return this.miniGamesManager ? this.miniGamesManager.getAvailableGames() : [];
    }

    /**
     * Update commands reference
     * @param {object} commands - New commands object
     */
    updateCommands(commands) {
        this.commands = commands;
    }
}

/**
 * Create a new TerminalIntegration instance
 * @param {object} options - Integration options
 * @returns {TerminalIntegration}
 */
function createTerminalIntegration(options) {
    return new TerminalIntegration(options);
}

// Export for browser
if (typeof window !== 'undefined') {
    window.TerminalIntegration = TerminalIntegration;
    window.createTerminalIntegration = createTerminalIntegration;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TerminalIntegration,
        createTerminalIntegration
    };
}

})(); // End of IIFE
