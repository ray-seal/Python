// ==================== MINI-GAMES MANAGER ====================
// Manages mini-games and rewards players with coins
// 
// This module provides:
// - Game registration and management
// - Coin rewards system
// - Game state tracking
// - Leaderboard/statistics

(function() {
'use strict';

/**
 * MiniGamesManager - Central manager for all mini-games
 */
class MiniGamesManager {
    constructor(options = {}) {
        this.games = {};
        this.activeGame = null;
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            totalCoinsEarned: 0,
            highScores: {}
        };
        
        // Callbacks
        this.onCoinReward = options.onCoinReward || null;
        this.onXPReward = options.onXPReward || null;
        this.onGameStart = options.onGameStart || null;
        this.onGameEnd = options.onGameEnd || null;
        this.onStatsUpdate = options.onStatsUpdate || null;
    }

    /**
     * Register a new mini-game
     * @param {string} id - Unique game identifier
     * @param {object} gameConfig - Game configuration
     */
    registerGame(id, gameConfig) {
        this.games[id] = {
            id,
            name: gameConfig.name || id,
            description: gameConfig.description || '',
            baseReward: gameConfig.baseReward || 10,
            baseXP: gameConfig.baseXP || 25,
            bonusMultiplier: gameConfig.bonusMultiplier || 1.5,
            maxBonus: gameConfig.maxBonus || 50,
            active: false,
            state: null,
            ...gameConfig
        };
        
        // Initialize high score
        if (!this.stats.highScores[id]) {
            this.stats.highScores[id] = 0;
        }
    }

    /**
     * Start a mini-game
     * @param {string} gameId - Game identifier
     * @returns {boolean} - True if game started successfully
     */
    startGame(gameId) {
        if (!this.games[gameId]) {
            return false;
        }
        
        if (this.activeGame) {
            this.endGame(this.activeGame, { abandoned: true });
        }
        
        this.activeGame = gameId;
        this.games[gameId].active = true;
        this.games[gameId].startTime = Date.now();
        this.games[gameId].state = {
            started: true,
            moves: 0,
            score: 0
        };
        
        this.stats.gamesPlayed++;
        
        if (this.onGameStart) {
            this.onGameStart(gameId, this.games[gameId]);
        }
        
        return true;
    }

    /**
     * End a mini-game and calculate rewards
     * @param {string} gameId - Game identifier
     * @param {object} result - Game result { won, score, bonusConditions }
     * @returns {object} - Reward information
     */
    endGame(gameId, result = {}) {
        const game = this.games[gameId];
        if (!game || !game.active) {
            return null;
        }
        
        const duration = Date.now() - game.startTime;
        const won = result.won || false;
        const abandoned = result.abandoned || false;
        
        let coins = 0;
        let xp = 0;
        
        if (won && !abandoned) {
            this.stats.gamesWon++;
            
            // Base rewards
            coins = game.baseReward;
            xp = game.baseXP;
            
            // Time bonus (faster = more bonus, up to 50% extra)
            const timeBonus = Math.max(0, 1 - (duration / 60000)); // 1 minute baseline
            coins += Math.floor(coins * timeBonus * 0.5);
            
            // Score bonus
            if (result.score) {
                const scoreBonus = Math.min(result.score * 0.1, game.maxBonus);
                coins += Math.floor(scoreBonus);
            }
            
            // Update high score
            if (result.score && result.score > (this.stats.highScores[gameId] || 0)) {
                this.stats.highScores[gameId] = result.score;
                coins = Math.floor(coins * game.bonusMultiplier); // Bonus for high score
            }
        }
        
        this.stats.totalCoinsEarned += coins;
        
        game.active = false;
        game.state = null;
        
        if (this.activeGame === gameId) {
            this.activeGame = null;
        }
        
        const rewardInfo = {
            gameId,
            won,
            abandoned,
            coins,
            xp,
            duration,
            score: result.score || 0,
            isHighScore: result.score > (this.stats.highScores[gameId] || 0)
        };
        
        // Trigger callbacks
        if (coins > 0 && this.onCoinReward) {
            this.onCoinReward(coins, rewardInfo);
        }
        
        if (xp > 0 && this.onXPReward) {
            this.onXPReward(xp, rewardInfo);
        }
        
        if (this.onGameEnd) {
            this.onGameEnd(gameId, rewardInfo);
        }
        
        if (this.onStatsUpdate) {
            this.onStatsUpdate(this.stats);
        }
        
        return rewardInfo;
    }

    /**
     * Record a move in the active game
     */
    recordMove(gameId) {
        const game = this.games[gameId];
        if (game && game.state) {
            game.state.moves++;
        }
    }

    /**
     * Update score for active game
     * @param {string} gameId - Game identifier
     * @param {number} points - Points to add
     */
    addScore(gameId, points) {
        const game = this.games[gameId];
        if (game && game.state) {
            game.state.score += points;
        }
    }

    /**
     * Get game state
     * @param {string} gameId - Game identifier
     * @returns {object|null} - Game state or null
     */
    getGameState(gameId) {
        const game = this.games[gameId];
        return game ? game.state : null;
    }

    /**
     * Check if a game is active
     * @param {string} gameId - Game identifier
     * @returns {boolean}
     */
    isGameActive(gameId) {
        const game = this.games[gameId];
        return game ? game.active : false;
    }

    /**
     * Get statistics
     * @returns {object} - Statistics object
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * Get available games list
     * @returns {array} - Array of game info objects
     */
    getAvailableGames() {
        return Object.values(this.games).map(game => ({
            id: game.id,
            name: game.name,
            description: game.description,
            baseReward: game.baseReward,
            active: game.active
        }));
    }

    /**
     * Load stats from saved data
     * @param {object} savedStats - Previously saved stats
     */
    loadStats(savedStats) {
        if (savedStats) {
            this.stats = {
                ...this.stats,
                ...savedStats,
                highScores: { ...this.stats.highScores, ...savedStats.highScores }
            };
        }
    }

    /**
     * Get saveable stats
     * @returns {object} - Stats object ready for saving
     */
    getSaveableStats() {
        return { ...this.stats };
    }
}

/**
 * Create a new MiniGamesManager instance
 * @param {object} options - Manager options
 * @returns {MiniGamesManager}
 */
function createMiniGamesManager(options) {
    return new MiniGamesManager(options);
}

// Export for browser
if (typeof window !== 'undefined') {
    window.MiniGamesManager = MiniGamesManager;
    window.createMiniGamesManager = createMiniGamesManager;
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MiniGamesManager,
        createMiniGamesManager
    };
}

})(); // End of IIFE
