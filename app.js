// PyPet - Learn Python with your 8-bit Snake!
// Main Application Logic

// ==================== TERMINAL INTEGRATION ====================
let terminalIntegration = null;

// ==================== GAME STATE ====================
const gameState = {
    pet: {
        name: "Snakey",
        hunger: 80,
        happiness: 70,
        energy: 90,
        level: 1,
        xp: 0,
        xpToNextLevel: 100
    },
    inventory: {
        "apple": 3,
        "mouse": 2,
        "toy": 1,
        "bed": 1
    },
    shop: {
        "apple": { price: 10, description: "A juicy apple for your snake" },
        "mouse": { price: 25, description: "A tasty treat!" },
        "toy": { price: 50, description: "A fun toy to play with" },
        "golden_apple": { price: 100, description: "Restores all hunger!" }
    },
    coins: 50,
    tutorialStep: 0,
    inTutorial: false,
    inMaze: false,
    maze: null,
    commandHistory: [],
    historyIndex: -1
};

// ==================== MAZE STATE ====================
const mazeState = {
    grid: [],
    playerX: 1,
    playerY: 1,
    playerDir: 'east',
    goalX: 0,
    goalY: 0,
    width: 10,
    height: 10
};

// ==================== 8-BIT SNAKE GRAPHICS ====================
const snakeSprites = {
    // 8-bit pixel art for snake (each row is 16 pixels wide)
    idle: [
        "................",
        "....▓▓▓▓▓▓......",
        "...▓░░░░░░▓.....",
        "..▓░██░░██░▓....",
        "..▓░░░░░░░░▓....",
        "..▓░░▓▓▓▓░░▓....",
        "...▓░░░░░░▓.....",
        "....▓▓▓▓▓▓......",
        ".....▓▓▓........",
        "......▓▓........",
        ".....▓▓▓........",
        "....▓▓▓▓........",
        "...▓▓▓▓▓........",
        "..▓▓▓▓▓▓........",
        ".▓▓▓▓▓▓.........",
        "▓▓▓▓▓▓.........."
    ],
    happy: [
        "................",
        "....▓▓▓▓▓▓......",
        "...▓░░░░░░▓.....",
        "..▓░▀▀░░▀▀░▓....",
        "..▓░░░░░░░░▓....",
        "..▓░░████░░▓....",
        "...▓░░░░░░▓.....",
        "....▓▓▓▓▓▓......",
        ".....▓▓▓........",
        "......▓▓........",
        ".....▓▓▓........",
        "....▓▓▓▓........",
        "...▓▓▓▓▓........",
        "..▓▓▓▓▓▓........",
        ".▓▓▓▓▓▓.........",
        "▓▓▓▓▓▓.........."
    ],
    sleeping: [
        "................",
        "....▓▓▓▓▓▓......",
        "...▓░░░░░░▓.....",
        "..▓░──░░──░▓..zZ",
        "..▓░░░░░░░░▓....",
        "..▓░░░░░░░░▓....",
        "...▓░░░░░░▓.....",
        "....▓▓▓▓▓▓......",
        ".....▓▓▓........",
        "......▓▓........",
        ".....▓▓▓........",
        "....▓▓▓▓........",
        "...▓▓▓▓▓........",
        "..▓▓▓▓▓▓........",
        ".▓▓▓▓▓▓.........",
        "▓▓▓▓▓▓.........."
    ],
    hungry: [
        "................",
        "....▓▓▓▓▓▓......",
        "...▓░░░░░░▓.....",
        "..▓░██░░██░▓....",
        "..▓░░░░░░░░▓....",
        "..▓░░▓▓▓▓░░▓....",
        "..▓░▓░░░░▓░▓....",
        "...▓▓░░░░▓▓.....",
        "....▓▓▓▓▓▓......",
        ".....▓▓▓........",
        "......▓▓........",
        ".....▓▓▓........",
        "....▓▓▓▓........",
        "...▓▓▓▓▓........",
        "..▓▓▓▓▓▓........",
        ".▓▓▓▓▓▓........."
    ]
};

// Color palette for 8-bit graphics (mutable for settings)
let colors = {
    '▓': '#4ecca3', // Snake body green
    '░': '#a8e6cf', // Snake lighter green
    '█': '#1a1a2e', // Eyes dark
    '▀': '#1a1a2e', // Happy eyes
    '─': '#1a1a2e', // Sleeping eyes
    '.': 'transparent',
    'z': '#ffd369',
    'Z': '#ffd369'
};

// Background color (mutable for settings)
let backgroundColor = '#0f3460';

// ==================== CANVAS RENDERING ====================
let petCanvas, petCtx, mazeCanvas, mazeCtx;
let animationFrame = 0;

function initCanvas() {
    petCanvas = document.getElementById('pet-canvas');
    petCtx = petCanvas.getContext('2d');
    mazeCanvas = document.getElementById('maze-canvas');
    mazeCtx = mazeCanvas.getContext('2d');
    
    // Set pixel-perfect rendering
    petCtx.imageSmoothingEnabled = false;
    mazeCtx.imageSmoothingEnabled = false;
}

function drawSnake(state = 'idle') {
    const sprite = snakeSprites[state] || snakeSprites.idle;
    const pixelSize = 12;
    const offsetX = 20;
    const offsetY = 10;
    
    // Clear canvas with customizable background color
    petCtx.fillStyle = backgroundColor;
    petCtx.fillRect(0, 0, petCanvas.width, petCanvas.height);
    
    // Add slight bounce animation
    const bounceOffset = state === 'happy' ? Math.sin(animationFrame * 0.2) * 5 : 0;
    
    // Draw each pixel
    sprite.forEach((row, y) => {
        [...row].forEach((pixel, x) => {
            if (pixel !== '.' && colors[pixel]) {
                petCtx.fillStyle = colors[pixel];
                petCtx.fillRect(
                    offsetX + x * pixelSize,
                    offsetY + y * pixelSize + bounceOffset,
                    pixelSize,
                    pixelSize
                );
            }
        });
    });
    
    // Draw pet name
    petCtx.fillStyle = '#ffd369';
    petCtx.font = '16px "Press Start 2P", monospace';
    petCtx.textAlign = 'center';
    petCtx.fillText(gameState.pet.name, petCanvas.width / 2, petCanvas.height - 10);
}

function getSnakeState() {
    if (gameState.pet.energy < 20) return 'sleeping';
    if (gameState.pet.hunger < 30) return 'hungry';
    if (gameState.pet.happiness > 70) return 'happy';
    return 'idle';
}

function updatePetDisplay() {
    drawSnake(getSnakeState());
    
    // Update stat bars
    updateStatBar('hunger-bar', gameState.pet.hunger);
    updateStatBar('happiness-bar', gameState.pet.happiness);
    updateStatBar('energy-bar', gameState.pet.energy);
    updateStatBar('xp-bar', (gameState.pet.xp / gameState.pet.xpToNextLevel) * 100);
    
    document.getElementById('level-display').textContent = gameState.pet.level;
}

function updateStatBar(id, value) {
    const bar = document.getElementById(id);
    bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
    
    if (value < 30 && !id.includes('xp')) {
        bar.classList.add('low');
    } else {
        bar.classList.remove('low');
    }
}

// ==================== MAZE GAME ====================
function generateMaze() {
    const { width, height } = mazeState;
    // Initialize grid with walls
    mazeState.grid = Array(height).fill(null).map(() => Array(width).fill(1));
    
    // Simple maze generation using recursive backtracker
    function carve(x, y) {
        mazeState.grid[y][x] = 0;
        const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];
        shuffleArray(directions);
        
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && mazeState.grid[ny][nx] === 1) {
                mazeState.grid[y + dy/2][x + dx/2] = 0;
                carve(nx, ny);
            }
        }
    }
    
    carve(1, 1);
    
    // Set player start and goal
    mazeState.playerX = 1;
    mazeState.playerY = 1;
    mazeState.playerDir = 'east';
    
    // Find a goal position far from start
    mazeState.goalX = width - 2;
    mazeState.goalY = height - 2;
    mazeState.grid[mazeState.goalY][mazeState.goalX] = 0;
    
    // Ensure path to goal
    for (let i = mazeState.goalY; i > height - 4; i--) {
        mazeState.grid[i][mazeState.goalX] = 0;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function drawMaze() {
    const cellSize = 32;
    mazeCtx.fillStyle = '#1a1a2e';
    mazeCtx.fillRect(0, 0, mazeCanvas.width, mazeCanvas.height);
    
    // Draw maze cells
    for (let y = 0; y < mazeState.height; y++) {
        for (let x = 0; x < mazeState.width; x++) {
            if (mazeState.grid[y][x] === 1) {
                // Wall
                mazeCtx.fillStyle = '#0f3460';
                mazeCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                mazeCtx.strokeStyle = '#16213e';
                mazeCtx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            } else {
                // Path
                mazeCtx.fillStyle = '#0a0a0a';
                mazeCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
    
    // Draw goal
    mazeCtx.fillStyle = '#ffd369';
    mazeCtx.fillRect(
        mazeState.goalX * cellSize + 4,
        mazeState.goalY * cellSize + 4,
        cellSize - 8,
        cellSize - 8
    );
    mazeCtx.fillStyle = '#1a1a2e';
    mazeCtx.font = '16px "Press Start 2P"';
    mazeCtx.fillText('⭐', mazeState.goalX * cellSize + 6, mazeState.goalY * cellSize + 22);
    
    // Draw player (small snake head)
    drawMazeSnake(mazeState.playerX * cellSize, mazeState.playerY * cellSize, cellSize);
}

function drawMazeSnake(x, y, size) {
    // Snake head
    mazeCtx.fillStyle = '#4ecca3';
    mazeCtx.fillRect(x + 4, y + 4, size - 8, size - 8);
    
    // Eyes based on direction
    mazeCtx.fillStyle = '#1a1a2e';
    const eyeSize = 4;
    switch (mazeState.playerDir) {
        case 'north':
            mazeCtx.fillRect(x + 8, y + 8, eyeSize, eyeSize);
            mazeCtx.fillRect(x + size - 12, y + 8, eyeSize, eyeSize);
            break;
        case 'south':
            mazeCtx.fillRect(x + 8, y + size - 12, eyeSize, eyeSize);
            mazeCtx.fillRect(x + size - 12, y + size - 12, eyeSize, eyeSize);
            break;
        case 'east':
            mazeCtx.fillRect(x + size - 12, y + 8, eyeSize, eyeSize);
            mazeCtx.fillRect(x + size - 12, y + size - 12, eyeSize, eyeSize);
            break;
        case 'west':
            mazeCtx.fillRect(x + 8, y + 8, eyeSize, eyeSize);
            mazeCtx.fillRect(x + 8, y + size - 12, eyeSize, eyeSize);
            break;
    }
}

// ==================== TERMINAL INTERFACE ====================
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');

function print(message, className = '') {
    const line = document.createElement('pre');
    line.innerHTML = message;
    if (className) line.className = className;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function printWelcome() {
    print("🐍 Welcome to PyPet!", 'success');
    print("Learn Python by caring for your virtual snake!", 'info');
    print("Type `help()` to see available commands.", 'system');
    print("Type `tutorial()` to start the tutorial.", 'system');
    print("─".repeat(40), 'system');
}

// ==================== PYTHON-LIKE COMMANDS ====================
const commands = {
    // Basic Care Commands
    feed: function() {
        if (gameState.inventory.apple > 0 || gameState.inventory.mouse > 0) {
            const food = gameState.inventory.mouse > 0 ? 'mouse' : 'apple';
            gameState.inventory[food]--;
            gameState.pet.hunger = Math.min(100, gameState.pet.hunger + 30);
            gameState.pet.happiness = Math.min(100, gameState.pet.happiness + 10);
            addXP(15);
            print(`🍎 You fed ${gameState.pet.name} a ${food}!`, 'success');
            print(`Hunger: ${gameState.pet.hunger}/100`, 'info');
            updatePetDisplay();
        } else {
            print("❌ No food in inventory! Use shop() to buy some.", 'error');
        }
    },
    
    play: function() {
        if (gameState.pet.energy < 20) {
            print(`😴 ${gameState.pet.name} is too tired to play. Use sleep() first!`, 'error');
            return;
        }
        gameState.pet.happiness = Math.min(100, gameState.pet.happiness + 25);
        gameState.pet.energy = Math.max(0, gameState.pet.energy - 15);
        gameState.pet.hunger = Math.max(0, gameState.pet.hunger - 10);
        addXP(20);
        print(`🎮 You played with ${gameState.pet.name}!`, 'success');
        print(`Happiness: ${gameState.pet.happiness}/100`, 'info');
        updatePetDisplay();
    },
    
    sleep: function() {
        gameState.pet.energy = Math.min(100, gameState.pet.energy + 40);
        gameState.pet.hunger = Math.max(0, gameState.pet.hunger - 10);
        addXP(10);
        print(`😴 ${gameState.pet.name} took a nap!`, 'success');
        print(`Energy: ${gameState.pet.energy}/100`, 'info');
        updatePetDisplay();
    },
    
    pet: function() {
        gameState.pet.happiness = Math.min(100, gameState.pet.happiness + 15);
        addXP(5);
        print(`💚 You pet ${gameState.pet.name}! They look happy!`, 'success');
        updatePetDisplay();
    },
    
    status: function() {
        print(`\n📊 ${gameState.pet.name}'s Status:`, 'info');
        print(`   Level: ${gameState.pet.level} (${gameState.pet.xp}/${gameState.pet.xpToNextLevel} XP)`);
        print(`   Hunger: ${gameState.pet.hunger}/100 ${getStatusEmoji(gameState.pet.hunger)}`);
        print(`   Happiness: ${gameState.pet.happiness}/100 ${getStatusEmoji(gameState.pet.happiness)}`);
        print(`   Energy: ${gameState.pet.energy}/100 ${getStatusEmoji(gameState.pet.energy)}`);
        print(`   💰 Coins: ${gameState.coins}\n`);
    },
    
    // Inventory Commands
    inventory: function() {
        print("\n🎒 Inventory:", 'info');
        let hasItems = false;
        for (const [item, count] of Object.entries(gameState.inventory)) {
            if (count > 0) {
                print(`   ${item}: ${count}`);
                hasItems = true;
            }
        }
        if (!hasItems) print("   (empty)");
        print(`\n💰 Coins: ${gameState.coins}\n`);
    },
    
    use_item: function(itemName) {
        if (!itemName) {
            print('❌ Usage: use_item("item_name")', 'error');
            print('Example: use_item("apple")', 'system');
            return;
        }
        
        itemName = itemName.toLowerCase().replace(/['"]/g, '');
        
        if (!gameState.inventory[itemName] || gameState.inventory[itemName] <= 0) {
            print(`❌ You don't have any ${itemName}!`, 'error');
            return;
        }
        
        gameState.inventory[itemName]--;
        
        switch(itemName) {
            case 'apple':
                gameState.pet.hunger = Math.min(100, gameState.pet.hunger + 25);
                print(`🍎 ${gameState.pet.name} ate the apple! Yummy!`, 'success');
                break;
            case 'mouse':
                gameState.pet.hunger = Math.min(100, gameState.pet.hunger + 40);
                gameState.pet.happiness = Math.min(100, gameState.pet.happiness + 15);
                print(`🐭 ${gameState.pet.name} caught and ate the mouse!`, 'success');
                break;
            case 'toy':
                gameState.pet.happiness = Math.min(100, gameState.pet.happiness + 30);
                gameState.inventory.toy++; // Toy doesn't get consumed
                print(`🧸 ${gameState.pet.name} played with the toy!`, 'success');
                break;
            case 'bed':
                gameState.pet.energy = Math.min(100, gameState.pet.energy + 50);
                gameState.inventory.bed++; // Bed doesn't get consumed
                print(`🛏️ ${gameState.pet.name} rested in the cozy bed!`, 'success');
                break;
            case 'golden_apple':
                gameState.pet.hunger = 100;
                print(`✨ ${gameState.pet.name} ate the golden apple! Fully restored!`, 'success');
                break;
            default:
                print(`❌ Unknown item: ${itemName}`, 'error');
                gameState.inventory[itemName]++; // Refund
                return;
        }
        
        addXP(10);
        updatePetDisplay();
    },
    
    shop: function() {
        print("\n🏪 Shop:", 'info');
        for (const [item, data] of Object.entries(gameState.shop)) {
            print(`   ${item}: ${data.price} coins - ${data.description}`);
        }
        print(`\n💰 Your coins: ${gameState.coins}`);
        print('Use buy("item_name") to purchase\n', 'system');
    },
    
    buy: function(itemName) {
        if (!itemName) {
            print('❌ Usage: buy("item_name")', 'error');
            return;
        }
        
        itemName = itemName.toLowerCase().replace(/['"]/g, '');
        
        if (!gameState.shop[itemName]) {
            print(`❌ Item "${itemName}" not found in shop!`, 'error');
            return;
        }
        
        const item = gameState.shop[itemName];
        if (gameState.coins < item.price) {
            print(`❌ Not enough coins! Need ${item.price}, have ${gameState.coins}`, 'error');
            return;
        }
        
        gameState.coins -= item.price;
        gameState.inventory[itemName] = (gameState.inventory[itemName] || 0) + 1;
        print(`✅ Bought ${itemName}! Remaining coins: ${gameState.coins}`, 'success');
    },
    
    // Mini Games
    start_maze: function() {
        gameState.inMaze = true;
        generateMaze();
        document.getElementById('maze-area').classList.remove('hidden');
        drawMaze();
        
        // Start game through mini-games manager
        if (terminalIntegration) {
            terminalIntegration.startGame('maze');
        }
        
        print("\n🎮 Maze Game Started!", 'success');
        print("Navigate your snake to the ⭐ goal!", 'info');
        print("Commands: move('direction'), at_wall(), can_move('direction')", 'system');
        print("turn_left(), turn_right()", 'system');
        print("Directions: 'north', 'south', 'east', 'west'\n", 'system');
    },
    
    exit_maze: function() {
        if (!gameState.inMaze) {
            print("❌ You're not in a maze!", 'error');
            return;
        }
        
        // End game through mini-games manager (abandoned)
        if (terminalIntegration) {
            terminalIntegration.endGame('maze', { won: false, abandoned: true });
        }
        
        gameState.inMaze = false;
        document.getElementById('maze-area').classList.add('hidden');
        print("👋 Left the maze game.", 'info');
    },
    
    move: function(direction, count) {
        if (!gameState.inMaze) {
            print("❌ Start a maze first with start_maze()", 'error');
            return false;
        }
        
        if (!direction) {
            print('❌ Usage: move("direction") or move("direction", count)', 'error');
            print('Directions: "north", "south", "east", "west"', 'system');
            return false;
        }
        
        direction = String(direction).toLowerCase().replace(/['"]/g, '');
        const deltas = {
            'north': [0, -1],
            'south': [0, 1],
            'east': [1, 0],
            'west': [-1, 0]
        };
        
        if (!deltas[direction]) {
            print(`❌ Invalid direction: ${direction}`, 'error');
            return false;
        }
        
        // Handle count parameter for repeated moves
        const steps = (count && typeof count === 'number' && count > 0) ? Math.floor(count) : 1;
        
        for (let step = 0; step < steps; step++) {
            const [dx, dy] = deltas[direction];
            const newX = mazeState.playerX + dx;
            const newY = mazeState.playerY + dy;
            
            mazeState.playerDir = direction;
            
            if (newX < 0 || newX >= mazeState.width || newY < 0 || newY >= mazeState.height) {
                print("🚧 Hit the boundary!", 'error');
                drawMaze();
                return false;
            }
            
            if (mazeState.grid[newY][newX] === 1) {
                print("🧱 Hit a wall!", 'error');
                drawMaze();
                return false;
            }
            
            mazeState.playerX = newX;
            mazeState.playerY = newY;
            
            // Track moves through mini-games manager
            if (terminalIntegration) {
                terminalIntegration.recordMove('maze');
            }
            
            if (steps > 1) {
                print(`➡️ Moved ${direction} (${step + 1}/${steps})`, 'success');
            } else {
                print(`➡️ Moved ${direction}`, 'success');
            }
            drawMaze();
            
            // Check win condition
            if (mazeState.playerX === mazeState.goalX && mazeState.playerY === mazeState.goalY) {
                print("\n🎉 Congratulations! You reached the goal!", 'success');
                
                // End game through mini-games manager and get rewards
                if (terminalIntegration) {
                    const result = terminalIntegration.endGame('maze', { won: true, score: 100 });
                    if (result) {
                        print(`+${result.xp} XP, +${result.coins} coins!`, 'info');
                        if (result.isHighScore) {
                            print(`🏆 New high score!`, 'success');
                        }
                    }
                } else {
                    // Fallback if integration not available
                    addXP(100);
                    gameState.coins += 25;
                    print(`+100 XP, +25 coins!`, 'info');
                }
                
                print("Type start_maze() for a new maze!\n", 'system');
                gameState.inMaze = false;
                document.getElementById('maze-area').classList.add('hidden');
                updatePetDisplay();
                return true;
            }
        }
        return true;
    },
    
    at_wall: function() {
        if (!gameState.inMaze) {
            print("❌ Start a maze first with start_maze()", 'error');
            return false;
        }
        
        const deltas = {
            'north': [0, -1],
            'south': [0, 1],
            'east': [1, 0],
            'west': [-1, 0]
        };
        
        const [dx, dy] = deltas[mazeState.playerDir];
        const checkX = mazeState.playerX + dx;
        const checkY = mazeState.playerY + dy;
        
        const isWall = checkX < 0 || checkX >= mazeState.width || 
                       checkY < 0 || checkY >= mazeState.height ||
                       mazeState.grid[checkY][checkX] === 1;
        
        print(`🔍 at_wall() → ${isWall}`, isWall ? 'error' : 'success');
        return isWall;
    },
    
    can_move: function(direction) {
        if (!gameState.inMaze) {
            print("❌ Start a maze first with start_maze()", 'error');
            return false;
        }
        
        if (!direction) {
            print('❌ Usage: can_move("direction")', 'error');
            return false;
        }
        
        direction = direction.toLowerCase().replace(/['"]/g, '');
        const deltas = {
            'north': [0, -1],
            'south': [0, 1],
            'east': [1, 0],
            'west': [-1, 0]
        };
        
        if (!deltas[direction]) {
            print(`❌ Invalid direction: ${direction}`, 'error');
            return false;
        }
        
        const [dx, dy] = deltas[direction];
        const checkX = mazeState.playerX + dx;
        const checkY = mazeState.playerY + dy;
        
        const canMove = checkX >= 0 && checkX < mazeState.width && 
                        checkY >= 0 && checkY < mazeState.height &&
                        mazeState.grid[checkY][checkX] === 0;
        
        print(`🔍 can_move("${direction}") → ${canMove}`, canMove ? 'success' : 'error');
        return canMove;
    },
    
    turn_left: function() {
        if (!gameState.inMaze) {
            print("❌ Start a maze first with start_maze()", 'error');
            return;
        }
        
        const turns = { 'north': 'west', 'west': 'south', 'south': 'east', 'east': 'north' };
        mazeState.playerDir = turns[mazeState.playerDir];
        print(`↩️ Turned left, now facing ${mazeState.playerDir}`, 'success');
        drawMaze();
    },
    
    turn_right: function() {
        if (!gameState.inMaze) {
            print("❌ Start a maze first with start_maze()", 'error');
            return;
        }
        
        const turns = { 'north': 'east', 'east': 'south', 'south': 'west', 'west': 'north' };
        mazeState.playerDir = turns[mazeState.playerDir];
        print(`↪️ Turned right, now facing ${mazeState.playerDir}`, 'success');
        drawMaze();
    },
    
    // Loop Mini-Game
    start_loop_challenge: async function() {
        if (!window.LoopMiniGame) {
            print("❌ Loop mini-game not loaded!", 'error');
            return;
        }
        
        print("\n🎮 Starting Loop Challenge...\n", 'success');
        
        // Create UI helpers for the mini-game
        const uiHelpers = {
            showPrompt: (text) => {
                print(text, 'info');
            },
            getInput: async () => {
                print("\n✍️ Enter your script (use Shift+Enter for new lines, then Enter to submit):", 'system');
                print("Type 'cancel' to cancel the challenge.\n", 'system');
                
                // Return a promise that resolves when user enters script
                return new Promise((resolve) => {
                    const originalHandler = terminalInput.onkeydown;
                    let scriptLines = [];
                    let isMultiLine = false;
                    
                    terminalInput.onkeydown = function(e) {
                        if (e.key === 'Enter' && e.shiftKey) {
                            e.preventDefault();
                            scriptLines.push(terminalInput.value);
                            print(`>>> ${terminalInput.value}`, 'input');
                            terminalInput.value = '';
                            isMultiLine = true;
                        } else if (e.key === 'Enter') {
                            e.preventDefault();
                            const currentLine = terminalInput.value;
                            
                            if (currentLine.toLowerCase() === 'cancel') {
                                print(">>> cancel", 'input');
                                terminalInput.onkeydown = originalHandler;
                                resolve('');
                                terminalInput.value = '';
                                return;
                            }
                            
                            if (isMultiLine) {
                                scriptLines.push(currentLine);
                                print(`>>> ${currentLine}`, 'input');
                            } else {
                                scriptLines = [currentLine];
                                print(`>>> ${currentLine}`, 'input');
                            }
                            
                            const fullScript = scriptLines.join('\n');
                            terminalInput.onkeydown = originalHandler;
                            resolve(fullScript);
                            terminalInput.value = '';
                            scriptLines = [];
                            isMultiLine = false;
                        }
                    };
                });
            },
            showResult: (result) => {
                if (result.details && result.details.message) {
                    print(`\n${result.details.message}`, result.success ? 'success' : 'error');
                }
                if (result.details && result.details.grid) {
                    print(`\nFinal State:\n${result.details.grid}`, 'info');
                }
                if (result.success && result.reward > 0) {
                    gameState.coins += result.reward;
                    addXP(result.reward);
                    updatePetDisplay();
                }
            }
        };
        
        try {
            // Start game in mini-games manager
            if (terminalIntegration) {
                terminalIntegration.startGame('loop_challenge');
            }
            
            // Run the mini-game
            const result = await window.LoopMiniGame.runLoopMiniGame(uiHelpers, { gridSize: 5 });
            
            // End game in mini-games manager
            if (terminalIntegration && result) {
                terminalIntegration.endGame('loop_challenge', { 
                    won: result.success, 
                    score: result.reward || 0 
                });
            }
            
            print("\n💡 Try again with start_loop_challenge() or try start_maze()!\n", 'system');
        } catch (error) {
            print(`\n❌ Error running loop challenge: ${error.message}`, 'error');
            if (terminalIntegration) {
                terminalIntegration.endGame('loop_challenge', { won: false, abandoned: true });
            }
        }
    },
    
    // Help and Tutorial
    help: function() {
        print("\n📚 Available Commands:", 'info');
        print("\n🐍 Basic Care:");
        print("   feed()          - Feed your snake");
        print("   play()          - Play with your snake");
        print("   sleep()         - Let your snake rest");
        print("   pet()           - Pet your snake");
        print("   status()        - Check snake's stats");
        print("\n🎒 Items:");
        print("   inventory()     - View your items");
        print('   use_item("x")   - Use an item');
        print("   shop()          - View shop");
        print('   buy("x")        - Buy an item');
        print("\n🎮 Mini Games:");
        print("   start_maze()           - Start maze game");
        print("   start_loop_challenge() - Loop programming challenge");
        print("   exit_maze()            - Leave maze");
        print('   move("dir")            - Move in direction');
        print('   move("dir", n)         - Move n steps');
        print("   at_wall()              - Check if wall ahead");
        print('   can_move("dir")        - Check if can move');
        print("   turn_left()            - Turn left");
        print("   turn_right()           - Turn right");
        print("\n📜 Multi-line Scripts (press Shift+Enter for new line):");
        print('   repeat(n):      - Repeat block n times');
        print('   if <condition>: - Run block if true');
        print("   Example:");
        print('     repeat(3):');
        print('       move("east")');
        print("\n📖 Learning:");
        print("   tutorial()      - Start tutorial");
        print("   hint()          - Get a hint");
        print("   clear()         - Clear terminal\n");
    },
    
    tutorial: function() {
        gameState.inTutorial = true;
        gameState.tutorialStep = 0;
        print("\n📖 Welcome to the PyPet Tutorial!", 'success');
        print("Let's learn Python basics while caring for your snake!\n", 'info');
        nextTutorialStep();
    },
    
    hint: function() {
        const hints = [
            "Try feeding your snake with feed()",
            "Check your snake's status with status()",
            "You can buy items from the shop() and use_item()",
            "Play the maze game with start_maze()",
            "Try the loop challenge with start_loop_challenge()",
            "In the maze, use move('north') to move up",
            "Check for walls with at_wall() before moving",
            "Keep your snake happy by playing with them!"
        ];
        print(`💡 Hint: ${hints[Math.floor(Math.random() * hints.length)]}`, 'info');
    },
    
    clear: function() {
        terminalOutput.innerHTML = '';
        print("Terminal cleared.", 'system');
    },
    
    rename: function(newName) {
        if (!newName) {
            print('❌ Usage: rename("new_name")', 'error');
            return;
        }
        newName = newName.replace(/['"]/g, '');
        const oldName = gameState.pet.name;
        gameState.pet.name = newName;
        print(`✅ Renamed ${oldName} to ${newName}!`, 'success');
        updatePetDisplay();
    }
};

// Tutorial Steps
const tutorialSteps = [
    {
        message: "First, let's check on your snake's status.\nType: status()",
        check: (cmd) => cmd.includes('status')
    },
    {
        message: "Great! Now let's feed your snake.\nType: feed()",
        check: (cmd) => cmd.includes('feed')
    },
    {
        message: "Your snake looks happier! Let's play with them.\nType: play()",
        check: (cmd) => cmd.includes('play')
    },
    {
        message: "Now check your inventory of items.\nType: inventory()",
        check: (cmd) => cmd.includes('inventory')
    },
    {
        message: "You can use items from your inventory.\nType: use_item(\"apple\")",
        check: (cmd) => cmd.includes('use_item')
    },
    {
        message: "Excellent! Now let's try the maze game!\nType: start_maze()",
        check: (cmd) => cmd.includes('start_maze')
    },
    {
        message: "In the maze, move your snake toward the star.\nType: move(\"east\") or another direction",
        check: (cmd) => cmd.includes('move')
    },
    {
        message: "🎉 Tutorial complete! You've learned the basics!\nExplore more commands with help()",
        check: () => true
    }
];

function nextTutorialStep() {
    if (gameState.tutorialStep < tutorialSteps.length) {
        const step = tutorialSteps[gameState.tutorialStep];
        print(`\n📝 Step ${gameState.tutorialStep + 1}: ${step.message}`, 'info');
    } else {
        gameState.inTutorial = false;
        addXP(50);
        print("\n🎓 Tutorial Completed! +50 XP", 'success');
    }
}

// ==================== HELPER FUNCTIONS ====================
function getStatusEmoji(value) {
    if (value >= 70) return '😊';
    if (value >= 40) return '😐';
    return '😟';
}

function addXP(amount) {
    gameState.pet.xp += amount;
    while (gameState.pet.xp >= gameState.pet.xpToNextLevel) {
        gameState.pet.xp -= gameState.pet.xpToNextLevel;
        gameState.pet.level++;
        gameState.pet.xpToNextLevel = Math.floor(gameState.pet.xpToNextLevel * 1.5);
        gameState.coins += 20;
        print(`\n🎉 LEVEL UP! Now level ${gameState.pet.level}! +20 coins`, 'success');
    }
}

// ==================== COMMAND PARSER ====================
let scriptExecutor = null;
let isExecutingScript = false;

// Initialize the script executor when parser is loaded
function initScriptExecutor() {
    if (typeof window.ScriptParser !== 'undefined') {
        scriptExecutor = window.ScriptParser.createExecutor(commands, print);
    }
}

async function parseCommand(input) {
    const trimmed = input.trim();
    if (!trimmed) return;
    
    // Add to history
    gameState.commandHistory.unshift(trimmed);
    if (gameState.commandHistory.length > 50) gameState.commandHistory.pop();
    gameState.historyIndex = -1;
    
    // Echo command (show first line and indicate if multi-line)
    const lines = trimmed.split('\n');
    if (lines.length > 1) {
        print(`>>> ${lines[0]}`);
        for (let i = 1; i < lines.length; i++) {
            print(`... ${lines[i]}`);
        }
    } else {
        print(`>>> ${trimmed}`);
    }
    
    // Check if we should use the multi-line parser
    if (typeof window.ScriptParser !== 'undefined' && window.ScriptParser.isMultiLineScript(trimmed)) {
        // Use the advanced parser for multi-line scripts
        try {
            if (!scriptExecutor) {
                initScriptExecutor();
            }
            
            const ast = window.ScriptParser.parseScript(trimmed);
            isExecutingScript = true;
            await scriptExecutor.execute(ast);
            isExecutingScript = false;
            
            // Check tutorial progress
            if (gameState.inTutorial) {
                const step = tutorialSteps[gameState.tutorialStep];
                if (step && step.check(trimmed)) {
                    gameState.tutorialStep++;
                    setTimeout(nextTutorialStep, 500);
                }
            }
        } catch (e) {
            isExecutingScript = false;
            print(`❌ ${e.name || 'Error'}: ${e.message}`, 'error');
        }
        return;
    }
    
    // Simple single-line function call parser (backward compatible)
    const match = trimmed.match(/^(\w+)\s*\(\s*([^)]*)\s*\)$/);
    
    if (!match) {
        // Check for simple variable access or expressions
        if (trimmed === 'True' || trimmed === 'False') {
            print(trimmed, 'success');
            return;
        }
        print(`❌ SyntaxError: Invalid syntax`, 'error');
        print(`Tip: Use function syntax like feed() or move("east", 3)`, 'system');
        return;
    }
    
    const [, funcName, args] = match;
    
    if (!commands[funcName]) {
        print(`❌ NameError: '${funcName}' is not defined`, 'error');
        print(`Type help() to see available commands`, 'system');
        return;
    }
    
    // Parse arguments (supports multiple arguments separated by comma)
    const parsedArgs = [];
    if (args.trim()) {
        // Split by comma, but respect quoted strings
        const argMatches = args.match(/(?:[^,'"]+|'[^']*'|"[^"]*")+/g) || [];
        for (const arg of argMatches) {
            const trimmedArg = arg.trim();
            // Check if it's a number
            if (/^-?\d+(\.\d+)?$/.test(trimmedArg)) {
                parsedArgs.push(parseFloat(trimmedArg));
            } else {
                // String - remove quotes
                parsedArgs.push(trimmedArg.replace(/^["']|["']$/g, ''));
            }
        }
    }
    
    // Execute command
    try {
        commands[funcName](...parsedArgs);
        
        // Check tutorial progress
        if (gameState.inTutorial) {
            const step = tutorialSteps[gameState.tutorialStep];
            if (step && step.check(trimmed)) {
                gameState.tutorialStep++;
                setTimeout(nextTutorialStep, 500);
            }
        }
    } catch (e) {
        print(`❌ Error: ${e.message}`, 'error');
    }
}

// ==================== GAME LOOP ====================
function gameLoop() {
    animationFrame++;
    updatePetDisplay();
    
    // Gradual stat decrease
    if (animationFrame % 300 === 0) { // Every ~5 seconds at 60fps
        gameState.pet.hunger = Math.max(0, gameState.pet.hunger - 1);
        gameState.pet.happiness = Math.max(0, gameState.pet.happiness - 0.5);
        gameState.pet.energy = Math.max(0, gameState.pet.energy - 0.5);
    }
    
    requestAnimationFrame(gameLoop);
}

// ==================== EVENT HANDLERS ====================
let multiLineMode = false;
let multiLineBuffer = '';

function setupEventHandlers() {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            // Shift+Enter: Add newline for multi-line input
            e.preventDefault();
            if (!multiLineMode) {
                multiLineMode = true;
                multiLineBuffer = terminalInput.value + '\n';
                terminalInput.value = '';
                terminalInput.placeholder = '... continue typing (Enter to run, Shift+Enter for more lines)';
                print(`>>> ${multiLineBuffer.split('\n')[0]}`, 'system');
            } else {
                const line = terminalInput.value;
                print(`... ${line}`, 'system');
                multiLineBuffer += line + '\n';
                terminalInput.value = '';
            }
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (multiLineMode) {
                // Execute multi-line script
                multiLineBuffer += terminalInput.value;
                const script = multiLineBuffer;
                multiLineMode = false;
                multiLineBuffer = '';
                terminalInput.value = '';
                terminalInput.placeholder = 'Type Python commands here...';
                // Execute the complete multi-line script
                parseCommand(script);
            } else {
                parseCommand(terminalInput.value);
                terminalInput.value = '';
            }
        } else if (e.key === 'Escape' && multiLineMode) {
            // Cancel multi-line mode
            e.preventDefault();
            multiLineMode = false;
            multiLineBuffer = '';
            terminalInput.value = '';
            terminalInput.placeholder = 'Type Python commands here...';
            print('Multi-line input cancelled.', 'system');
        } else if (e.key === 'ArrowUp' && !multiLineMode) {
            e.preventDefault();
            if (gameState.historyIndex < gameState.commandHistory.length - 1) {
                gameState.historyIndex++;
                terminalInput.value = gameState.commandHistory[gameState.historyIndex];
            }
        } else if (e.key === 'ArrowDown' && !multiLineMode) {
            e.preventDefault();
            if (gameState.historyIndex > 0) {
                gameState.historyIndex--;
                terminalInput.value = gameState.commandHistory[gameState.historyIndex];
            } else {
                gameState.historyIndex = -1;
                terminalInput.value = '';
            }
        }
    });
    
    // Focus terminal on click
    document.getElementById('terminal').addEventListener('click', () => {
        terminalInput.focus();
    });
}

// ==================== PWA INSTALLATION ====================
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-btn').classList.remove('hidden');
});

document.getElementById('install-btn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            print('🎉 App installed!', 'success');
        }
        deferredPrompt = null;
    }
});

// ==================== SERVICE WORKER REGISTRATION ====================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    setupEventHandlers();
    initScriptExecutor();
    initTerminalIntegration();
    initSettingsUI();
    initCSSEditor();
    printWelcome();
    updatePetDisplay();
    gameLoop();
    
    // Auto-focus terminal
    terminalInput.focus();
});

// ==================== TERMINAL INTEGRATION INIT ====================
function initTerminalIntegration() {
    if (typeof window.createTerminalIntegration === 'function') {
        terminalIntegration = window.createTerminalIntegration({
            commands: commands,
            print: print,
            gameState: gameState,
            onSettingsChange: handleSettingsChange,
            onCoinsEarned: (coins, info) => {
                gameState.coins += coins;
                print(`+${coins} coins earned!`, 'success');
                updatePetDisplay();
            },
            onXPEarned: (xp, info) => {
                addXP(xp);
            }
        });
        
        terminalIntegration.initialize();
        
        // Load saved data through integration
        const savedData = terminalIntegration.load();
        if (savedData && savedData.state) {
            Object.assign(gameState, savedData.state);
            gameState.inMaze = false; // Reset maze state on reload
        }
        
        // Start auto-save
        terminalIntegration.startAutoSave(() => ({
            gameState: gameState,
            gameStats: terminalIntegration.getGameStats()
        }));
    }
}

// ==================== SETTINGS UI ====================
function initSettingsUI() {
    const settingsToggle = document.getElementById('settings-toggle-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const cssEditorPanel = document.getElementById('css-editor-panel');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');
    
    // Settings inputs
    const snakeColorInput = document.getElementById('snake-color');
    const snakeLightColorInput = document.getElementById('snake-light-color');
    const bgColorInput = document.getElementById('bg-color');
    const terminalBgInput = document.getElementById('terminal-bg-color');
    const execDelaySelect = document.getElementById('exec-delay');
    const autoSaveCheckbox = document.getElementById('auto-save');
    
    // Toggle settings panel
    if (settingsToggle) {
        settingsToggle.addEventListener('click', () => {
            settingsPanel.classList.toggle('hidden');
            // Hide CSS editor when opening settings
            if (!settingsPanel.classList.contains('hidden') && cssEditorPanel) {
                cssEditorPanel.classList.add('hidden');
            }
        });
    }
    
    // Close settings
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            settingsPanel.classList.add('hidden');
        });
    }
    
    // Reset settings
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            if (terminalIntegration) {
                terminalIntegration.resetSettings();
            }
            // Reset inputs to defaults
            if (snakeColorInput) snakeColorInput.value = '#4ecca3';
            if (snakeLightColorInput) snakeLightColorInput.value = '#a8e6cf';
            if (bgColorInput) bgColorInput.value = '#0f3460';
            if (terminalBgInput) terminalBgInput.value = '#0a0a0a';
            if (execDelaySelect) execDelaySelect.value = '200';
            if (autoSaveCheckbox) autoSaveCheckbox.checked = true;
            
            print('Settings reset to defaults.', 'system');
        });
    }
    
    // Load current settings into inputs
    if (terminalIntegration) {
        const settings = terminalIntegration.getSettings();
        if (snakeColorInput) snakeColorInput.value = settings.snakeColor;
        if (snakeLightColorInput) snakeLightColorInput.value = settings.snakeLightColor;
        if (bgColorInput) bgColorInput.value = settings.backgroundColor;
        if (terminalBgInput) terminalBgInput.value = settings.terminalBg;
        if (execDelaySelect) execDelaySelect.value = String(settings.executionDelay);
        if (autoSaveCheckbox) autoSaveCheckbox.checked = settings.autoSave;
    }
    
    // Event listeners for settings changes
    if (snakeColorInput) {
        snakeColorInput.addEventListener('change', (e) => {
            if (terminalIntegration) {
                terminalIntegration.setSetting('snakeColor', e.target.value);
            }
        });
    }
    
    if (snakeLightColorInput) {
        snakeLightColorInput.addEventListener('change', (e) => {
            if (terminalIntegration) {
                terminalIntegration.setSetting('snakeLightColor', e.target.value);
            }
        });
    }
    
    if (bgColorInput) {
        bgColorInput.addEventListener('change', (e) => {
            if (terminalIntegration) {
                terminalIntegration.setSetting('backgroundColor', e.target.value);
            }
        });
    }
    
    if (terminalBgInput) {
        terminalBgInput.addEventListener('change', (e) => {
            if (terminalIntegration) {
                terminalIntegration.setSetting('terminalBg', e.target.value);
            }
        });
    }
    
    if (execDelaySelect) {
        execDelaySelect.addEventListener('change', (e) => {
            if (terminalIntegration) {
                terminalIntegration.setSetting('executionDelay', parseInt(e.target.value, 10));
            }
        });
    }
    
    if (autoSaveCheckbox) {
        autoSaveCheckbox.addEventListener('change', (e) => {
            if (terminalIntegration) {
                terminalIntegration.setSetting('autoSave', e.target.checked);
                if (e.target.checked) {
                    terminalIntegration.startAutoSave(() => ({
                        gameState: gameState,
                        gameStats: terminalIntegration.getGameStats()
                    }));
                } else {
                    terminalIntegration.stopAutoSave();
                }
            }
        });
    }
}

// Handle settings changes
function handleSettingsChange(key, value, settings) {
    switch (key) {
        case 'snakeColor':
            colors['▓'] = value;
            updatePetDisplay();
            break;
        case 'snakeLightColor':
            colors['░'] = value;
            updatePetDisplay();
            break;
        case 'backgroundColor':
            backgroundColor = value;
            updatePetDisplay();
            break;
        case 'terminalBg':
            const terminalOutput = document.getElementById('terminal-output');
            const terminal = document.getElementById('terminal');
            if (terminalOutput) terminalOutput.style.backgroundColor = value;
            if (terminal) terminal.style.backgroundColor = value;
            break;
        case 'reset':
            // Reset all visual settings
            colors['▓'] = '#4ecca3';
            colors['░'] = '#a8e6cf';
            backgroundColor = '#0f3460';
            const termOut = document.getElementById('terminal-output');
            const term = document.getElementById('terminal');
            if (termOut) termOut.style.backgroundColor = '#0a0a0a';
            if (term) term.style.backgroundColor = '#0a0a0a';
            updatePetDisplay();
            break;
    }
}

// ==================== CSS EDITOR INTEGRATION ====================
let cssEditor = null;

// Global functions for CSS editor to update colors
window.updateSnakeColor = function(type, color) {
    if (type === 'body') {
        colors['▓'] = color;
    } else if (type === 'light') {
        colors['░'] = color;
    }
    updatePetDisplay();
};

window.updateBackgroundColor = function(color) {
    backgroundColor = color;
    updatePetDisplay();
};

function initCSSEditor() {
    if (typeof window.createCSSEditor !== 'function') return;
    
    cssEditor = window.createCSSEditor({
        onApply: (css) => {
            print('🎨 CSS styles applied!', 'success');
        },
        onError: (error) => {
            print(`❌ CSS Error: ${error.message}`, 'error');
        }
    });
    
    cssEditor.initialize('css-editor', 'pet-canvas');
    
    // CSS Editor toggle button
    const cssToggleBtn = document.getElementById('css-toggle-btn');
    const cssEditorPanel = document.getElementById('css-editor-panel');
    const settingsPanel = document.getElementById('settings-panel');
    
    if (cssToggleBtn) {
        cssToggleBtn.addEventListener('click', () => {
            cssEditorPanel.classList.toggle('hidden');
            // Hide settings when opening CSS editor
            if (!cssEditorPanel.classList.contains('hidden')) {
                settingsPanel.classList.add('hidden');
            }
        });
    }
    
    // Apply CSS button
    const applyCSSBtn = document.getElementById('apply-css-btn');
    const cssOutput = document.getElementById('css-output');
    
    if (applyCSSBtn) {
        applyCSSBtn.addEventListener('click', () => {
            const result = cssEditor.applyCSS();
            if (cssOutput) {
                cssOutput.textContent = result.message;
                cssOutput.className = 'css-output ' + (result.success ? 'success' : 'error');
            }
        });
    }
    
    // Reset CSS button
    const resetCSSBtn = document.getElementById('reset-css-btn');
    if (resetCSSBtn) {
        resetCSSBtn.addEventListener('click', () => {
            cssEditor.reset();
            if (cssOutput) {
                cssOutput.textContent = '✅ CSS reset to default';
                cssOutput.className = 'css-output success';
            }
        });
    }
    
    // Close CSS button
    const closeCSSBtn = document.getElementById('close-css-btn');
    if (closeCSSBtn) {
        closeCSSBtn.addEventListener('click', () => {
            cssEditorPanel.classList.add('hidden');
        });
    }
    
    // Example selector
    const exampleSelect = document.getElementById('css-example-select');
    if (exampleSelect) {
        exampleSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                const result = cssEditor.loadExample(e.target.value);
                if (cssOutput) {
                    cssOutput.textContent = result.success ? `✅ Loaded: ${result.message}` : result.message;
                    cssOutput.className = 'css-output ' + (result.success ? 'success' : 'error');
                }
                // Auto-apply when loading an example
                if (result.success) {
                    setTimeout(() => cssEditor.applyCSS(), 100);
                }
                e.target.value = ''; // Reset selector
            }
        });
    }
}

// Save game state to localStorage (through integration or fallback)
window.addEventListener('beforeunload', () => {
    if (terminalIntegration) {
        terminalIntegration.save(gameState, terminalIntegration.getGameStats());
    } else {
        localStorage.setItem('pypet_save', JSON.stringify(gameState));
    }
});

// Load saved game (fallback if integration not available)
if (!terminalIntegration) {
    const savedGame = localStorage.getItem('pypet_save');
    if (savedGame) {
        try {
            const saved = JSON.parse(savedGame);
            Object.assign(gameState, saved);
            gameState.inMaze = false; // Reset maze state on reload
        } catch (e) {
            console.log('Could not load save');
        }
    }
}
