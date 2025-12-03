// ==================== SAVE MANAGER ====================
// Persistent local save/load for player progress
// 
// This module provides:
// - Auto-save functionality
// - Manual save/load
// - Data versioning and migration
// - Export/import capabilities

(function() {
'use strict';

/**
 * SaveManager - Handles persistent storage for game progress
 */
class SaveManager {
    constructor(options = {}) {
        this.storageKey = options.storageKey || 'pypet_save';
        this.settingsKey = options.settingsKey || 'pypet_settings';
        this.version = options.version || 1;
        this.autoSaveInterval = options.autoSaveInterval || 30000; // 30 seconds
        this.autoSaveTimer = null;
        
        // Callbacks
        this.onSave = options.onSave || null;
        this.onLoad = options.onLoad || null;
        this.onError = options.onError || null;
    }

    /**
     * Save game state to localStorage
     * @param {object} gameState - The game state to save
     * @param {object} gameStats - Optional game statistics
     * @returns {boolean} - True if save was successful
     */
    save(gameState, gameStats = null) {
        try {
            const saveData = {
                version: this.version,
                timestamp: Date.now(),
                state: this.sanitizeState(gameState),
                stats: gameStats
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(saveData));
            
            if (this.onSave) {
                this.onSave(saveData);
            }
            
            return true;
        } catch (e) {
            if (this.onError) {
                this.onError('save', e);
            }
            console.error('Save failed:', e);
            return false;
        }
    }

    /**
     * Load game state from localStorage
     * @returns {object|null} - Loaded state or null if no save exists
     */
    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) {
                return null;
            }
            
            const saveData = JSON.parse(saved);
            
            // Handle version migration if needed
            const migratedData = this.migrateData(saveData);
            
            if (this.onLoad) {
                this.onLoad(migratedData);
            }
            
            return migratedData;
        } catch (e) {
            if (this.onError) {
                this.onError('load', e);
            }
            console.error('Load failed:', e);
            return null;
        }
    }

    /**
     * Save settings to localStorage
     * @param {object} settings - Settings to save
     * @returns {boolean} - True if save was successful
     */
    saveSettings(settings) {
        try {
            const settingsData = {
                version: this.version,
                timestamp: Date.now(),
                settings: settings
            };
            
            localStorage.setItem(this.settingsKey, JSON.stringify(settingsData));
            return true;
        } catch (e) {
            if (this.onError) {
                this.onError('saveSettings', e);
            }
            console.error('Settings save failed:', e);
            return false;
        }
    }

    /**
     * Load settings from localStorage
     * @returns {object|null} - Loaded settings or null
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.settingsKey);
            if (!saved) {
                return null;
            }
            
            const settingsData = JSON.parse(saved);
            return settingsData.settings || null;
        } catch (e) {
            if (this.onError) {
                this.onError('loadSettings', e);
            }
            console.error('Settings load failed:', e);
            return null;
        }
    }

    /**
     * Delete saved data
     * @param {boolean} includeSettings - Also delete settings
     * @returns {boolean} - True if deletion was successful
     */
    deleteSave(includeSettings = false) {
        try {
            localStorage.removeItem(this.storageKey);
            if (includeSettings) {
                localStorage.removeItem(this.settingsKey);
            }
            return true;
        } catch (e) {
            if (this.onError) {
                this.onError('delete', e);
            }
            return false;
        }
    }

    /**
     * Check if a save exists
     * @returns {boolean}
     */
    hasSave() {
        return localStorage.getItem(this.storageKey) !== null;
    }

    /**
     * Get save metadata without loading full state
     * @returns {object|null} - Save metadata or null
     */
    getSaveInfo() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) {
                return null;
            }
            
            const saveData = JSON.parse(saved);
            return {
                version: saveData.version,
                timestamp: saveData.timestamp,
                date: new Date(saveData.timestamp).toLocaleString(),
                petName: saveData.state?.pet?.name || 'Unknown',
                level: saveData.state?.pet?.level || 1,
                coins: saveData.state?.coins || 0
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * Export save data as JSON string (for backup)
     * @returns {string|null} - JSON string or null
     */
    exportSave() {
        try {
            const gameData = localStorage.getItem(this.storageKey);
            const settingsData = localStorage.getItem(this.settingsKey);
            
            return JSON.stringify({
                game: gameData ? JSON.parse(gameData) : null,
                settings: settingsData ? JSON.parse(settingsData) : null,
                exportDate: Date.now()
            }, null, 2);
        } catch (e) {
            if (this.onError) {
                this.onError('export', e);
            }
            return null;
        }
    }

    /**
     * Import save data from JSON string
     * @param {string} jsonString - JSON string to import
     * @returns {boolean} - True if import was successful
     */
    importSave(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (data.game) {
                localStorage.setItem(this.storageKey, JSON.stringify(data.game));
            }
            
            if (data.settings) {
                localStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
            }
            
            return true;
        } catch (e) {
            if (this.onError) {
                this.onError('import', e);
            }
            return false;
        }
    }

    /**
     * Start auto-save timer
     * @param {function} getStateCallback - Function that returns current game state
     */
    startAutoSave(getStateCallback) {
        this.stopAutoSave();
        
        this.autoSaveTimer = setInterval(() => {
            const state = getStateCallback();
            if (state) {
                this.save(state.gameState, state.gameStats);
            }
        }, this.autoSaveInterval);
    }

    /**
     * Stop auto-save timer
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }

    /**
     * Sanitize state before saving (remove non-serializable data)
     * @param {object} state - State to sanitize
     * @returns {object} - Sanitized state
     */
    sanitizeState(state) {
        const sanitized = { ...state };
        
        // Remove runtime-only properties
        delete sanitized.inMaze;
        delete sanitized.maze;
        
        return sanitized;
    }

    /**
     * Migrate data from older versions
     * @param {object} saveData - Loaded save data
     * @returns {object} - Migrated save data
     */
    migrateData(saveData) {
        let data = { ...saveData };
        
        // Version 0 -> 1: Add stats if missing
        if (!data.version || data.version < 1) {
            if (!data.stats) {
                data.stats = {
                    gamesPlayed: 0,
                    gamesWon: 0,
                    totalCoinsEarned: 0,
                    highScores: {}
                };
            }
            data.version = 1;
        }
        
        // Add future migrations here
        // if (data.version < 2) { ... }
        
        return data;
    }
}

/**
 * Create a new SaveManager instance
 * @param {object} options - Manager options
 * @returns {SaveManager}
 */
function createSaveManager(options) {
    return new SaveManager(options);
}

// Export for browser
if (typeof window !== 'undefined') {
    window.SaveManager = SaveManager;
    window.createSaveManager = createSaveManager;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SaveManager,
        createSaveManager
    };
}

})(); // End of IIFE
