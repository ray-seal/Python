// ==================== MINI-GAME COMMANDS MODULE ====================
// Wrapper functions to expose mini-game commands to the terminal REPL
// 
// This module provides:
// - Simple start_* command wrappers that developers/players can call from terminal
// - Integration with existing game modules when available
// - Placeholder implementations for games not yet fully implemented

(function() {
'use strict';

/**
 * Helper function to create UI helpers for mini-games
 * Uses the global print function from app.js
 */
function createUIHelpers() {
    return {
        showPrompt: (text) => {
            if (typeof window.print === 'function') {
                window.print(text, 'info');
            }
        },
        getInput: async () => {
            if (typeof window.print === 'function') {
                window.print("\n✍️ Enter your input (use Shift+Enter for new lines, then Enter to submit):", 'system');
                window.print("Type 'cancel' to cancel.\n", 'system');
            }
            
            return new Promise((resolve) => {
                let scriptLines = [];
                let isMultiLine = false;
                const terminalInput = document.getElementById('terminal-input');
                
                window.customInputHandler = {
                    handler: function(e) {
                        if (e.key === 'Enter' && e.shiftKey) {
                            e.preventDefault();
                            scriptLines.push(terminalInput.value);
                            if (typeof window.print === 'function') {
                                window.print(`>>> ${terminalInput.value}`, 'input');
                            }
                            terminalInput.value = '';
                            isMultiLine = true;
                        } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const currentLine = terminalInput.value;
                            
                            if (currentLine.toLowerCase() === 'cancel') {
                                if (typeof window.print === 'function') {
                                    window.print(">>> cancel", 'input');
                                }
                                window.customInputHandler = null;
                                resolve('');
                                terminalInput.value = '';
                                return;
                            }
                            
                            if (isMultiLine) {
                                scriptLines.push(currentLine);
                                if (typeof window.print === 'function') {
                                    window.print(`>>> ${currentLine}`, 'input');
                                }
                            } else {
                                scriptLines = [currentLine];
                                if (typeof window.print === 'function') {
                                    window.print(`>>> ${currentLine}`, 'input');
                                }
                            }
                            
                            const fullScript = scriptLines.join('\n');
                            window.customInputHandler = null;
                            resolve(fullScript);
                            terminalInput.value = '';
                            scriptLines = [];
                            isMultiLine = false;
                        }
                    }
                };
            });
        },
        showResult: (result) => {
            if (!window.print) return;
            
            if (result.details && result.details.message) {
                window.print(`\n${result.details.message}`, result.success ? 'success' : 'error');
            }
            if (result.details && result.details.grid) {
                window.print(`\nFinal State:\n${result.details.grid}`, 'info');
            }
            if (result.success && result.reward > 0 && window.gameState) {
                window.gameState.coins += result.reward;
                if (typeof window.addXP === 'function') {
                    window.addXP(result.reward);
                }
                if (typeof window.updatePetDisplay === 'function') {
                    window.updatePetDisplay();
                }
            }
        }
    };
}

/**
 * start_typing() - Play typing mini-game
 * Wrapper for the typing challenge mini-game
 */
async function start_typing() {
    const print = window.print || console.log;
    
    // Check if the typing game module is available
    if (window.MiniGames && typeof window.MiniGames.typingChallenge === 'function') {
        try {
            print("\n⌨️ Starting Typing Challenge...\n", 'success');
            const uiHelpers = createUIHelpers();
            await window.MiniGames.typingChallenge(uiHelpers);
        } catch (error) {
            print(`❌ Error running typing challenge: ${error.message}`, 'error');
        }
    } else {
        print("❌ Typing mini-game not yet implemented!", 'error');
        print("💡 This game will be available in a future update.", 'info');
    }
}

/**
 * start_quick_math() - Play quick math mini-game
 * Wrapper for the quick math challenge mini-game
 */
async function start_quick_math() {
    const print = window.print || console.log;
    
    // Check if the quick math game module is available
    if (window.MiniGames && typeof window.MiniGames.quickMath === 'function') {
        try {
            print("\n🔢 Starting Quick Math Challenge...\n", 'success');
            const uiHelpers = createUIHelpers();
            await window.MiniGames.quickMath(uiHelpers);
        } catch (error) {
            print(`❌ Error running quick math challenge: ${error.message}`, 'error');
        }
    } else {
        print("❌ Quick math mini-game not yet implemented!", 'error');
        print("💡 This game will be available in a future update.", 'info');
    }
}

/**
 * start_loop() - Play loop mini-game (teaches for/while/if/elif/else)
 * Wrapper for the loop challenge mini-game
 */
async function start_loop() {
    const print = window.print || console.log;
    
    // Check if the loop game module is available
    if (window.LoopMiniGame && typeof window.LoopMiniGame.runLoopMiniGame === 'function') {
        try {
            print("\n🔁 Starting Loop Challenge...\n", 'success');
            const uiHelpers = createUIHelpers();
            
            // Start game in mini-games manager if available
            if (window.terminalIntegration && window.terminalIntegration.startGame) {
                window.terminalIntegration.startGame('loop_challenge');
            }
            
            // Run the mini-game
            const result = await window.LoopMiniGame.runLoopMiniGame(uiHelpers, { gridSize: 5 });
            
            // End game in mini-games manager
            if (window.terminalIntegration && window.terminalIntegration.endGame && result) {
                window.terminalIntegration.endGame('loop_challenge', { 
                    won: result.success, 
                    score: result.reward || 0 
                });
            }
            
            print("\n💡 Try again with start_loop() or try other mini-games!\n", 'system');
        } catch (error) {
            print(`❌ Error running loop challenge: ${error.message}`, 'error');
            if (window.terminalIntegration && window.terminalIntegration.endGame) {
                window.terminalIntegration.endGame('loop_challenge', { won: false, abandoned: true });
            }
        }
    } else {
        print("❌ Loop mini-game not yet loaded!", 'error');
        print("💡 Try using start_loop_challenge() instead.", 'info');
    }
}

/**
 * start_random_mini_game() - Play a random mini-game
 * Randomly selects and launches one of the available mini-games
 */
async function start_random_mini_game() {
    const print = window.print || console.log;
    
    // Check if the random game launcher is available
    if (window.MiniGames && typeof window.MiniGames.runRandomMiniGame === 'function') {
        try {
            print("\n🎲 Starting Random Mini-Game...\n", 'success');
            const uiHelpers = createUIHelpers();
            await window.MiniGames.runRandomMiniGame(uiHelpers);
        } catch (error) {
            print(`❌ Error running random mini-game: ${error.message}`, 'error');
        }
    } else {
        // Fallback: manually select a random game from available ones
        const availableGames = [];
        
        if (window.LoopMiniGame) availableGames.push('loop');
        if (window.commands && typeof window.commands.start_maze === 'function') availableGames.push('maze');
        
        if (availableGames.length === 0) {
            print("❌ No mini-games available at the moment!", 'error');
            print("💡 This feature will be available when more mini-games are implemented.", 'info');
            return;
        }
        
        const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
        print(`🎲 Randomly selected: ${randomGame} game!\n`, 'info');
        
        switch(randomGame) {
            case 'loop':
                await start_loop();
                break;
            case 'maze':
                if (window.commands && typeof window.commands.start_maze === 'function') {
                    window.commands.start_maze();
                }
                break;
            default:
                print("❌ Could not launch game", 'error');
        }
    }
}

// Export to window for global access
if (typeof window !== 'undefined') {
    window.MiniGameCommands = {
        start_typing,
        start_quick_math,
        start_loop,
        start_random_mini_game
    };
    
    // Also expose directly on window for easy REPL access
    window.start_typing = start_typing;
    window.start_quick_math = start_quick_math;
    window.start_loop = start_loop;
    window.start_random_mini_game = start_random_mini_game;
}

// Export for Node.js (if needed for testing)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        start_typing,
        start_quick_math,
        start_loop,
        start_random_mini_game
    };
}

})(); // End of IIFE
