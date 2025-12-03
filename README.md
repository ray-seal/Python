# 🐍 PyPet - Learn Python with Snake!

A fun Progressive Web App (PWA) game to teach Python programming through caring for a virtual 8-bit snake pet!

![PyPet Screenshot](https://img.shields.io/badge/PWA-Ready-brightgreen) ![Python Learning](https://img.shields.io/badge/Learn-Python-blue)

## 🎮 Features

### Virtual Pet Care
- Feed, play with, and care for your 8-bit snake pet
- Monitor hunger, happiness, and energy stats
- Level up your snake by performing actions
- Earn coins to buy items from the shop
- **Customize snake appearance and background colors** via Settings

### Python Learning
- Use Python-like syntax to interact: `feed()`, `play()`, `status()`
- Learn function calls with arguments: `use_item("apple")`, `move("north")`
- Progressive tutorial system for beginners
- Real-time feedback in a terminal interface
- **Multi-line scripts** with indentation-based blocks

### Mini Games
- **Maze Game**: Navigate your snake through procedurally generated mazes
- Learn conditional logic: `at_wall()`, `can_move("direction")`
- Practice loops and decision making
- **Earn coin rewards** for completing games

### Persistent Progress
- **Auto-save** functionality saves your progress automatically
- Manual save/load through the integrated save manager
- Settings are preserved between sessions

## 🚀 Quick Start

### Play Online
Deploy to Vercel and play in your browser!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ray-seal/Python)

### Run Locally
```bash
# Clone the repository
git clone https://github.com/ray-seal/Python.git
cd Python

# Serve with any static server
npx serve .
# or
python -m http.server 8000
```

Open `http://localhost:3000` (or `8000` for Python) in your browser.

## 📚 Available Commands

### Basic Care
```python
feed()          # Feed your snake
play()          # Play with your snake  
sleep()         # Let your snake rest
pet()           # Pet your snake
status()        # Check snake's stats
```

### Items & Shop
```python
inventory()         # View your items
use_item("apple")   # Use an item
shop()              # View available items
buy("mouse")        # Buy an item
```

### Maze Mini Game
```python
start_maze()        # Start maze game
move("north")       # Move in a direction (north/south/east/west)
move("east", 3)     # Move 3 steps east
at_wall()           # Check if wall ahead
can_move("east")    # Check if can move in direction
turn_left()         # Turn left
turn_right()        # Turn right
exit_maze()         # Leave maze game
```

### Multi-line Scripts (Press Shift+Enter for new lines)
```python
# Repeat a block of commands
repeat(3):
    move("east")

# Conditional execution
if can_move("south"):
    move("south")

# While loops
while can_move("east"):
    move("east")

# Fallback syntax (without parentheses)
move east 3
east
```

### Learning
```python
help()              # Show all commands
tutorial()          # Start the tutorial
hint()              # Get a helpful hint
clear()             # Clear the terminal
```

## ⚙️ Settings

Click the ⚙️ button to access settings:

- **Snake Appearance**: Customize body color and light color
- **Background**: Change pet area and terminal background colors
- **Gameplay**: Adjust script execution speed and auto-save settings

## 🎨 CSS Editor - Learn CSS!

Click the 🎨 button to open the CSS Style Editor and learn CSS by styling your snake!

### Features:
- **Live CSS editing** - Write CSS and see changes instantly
- **Pre-built examples** - 10+ themes including Rainbow, Neon, Ocean, Sunset
- **Animations** - Make your snake dance, bounce, spin, pulse, shake, or glow!
- **Real-time feedback** - See CSS errors and successes immediately

### Example CSS:
```css
/* Change snake colors */
.snake-body {
    fill: #ff6b6b;
}

.snake-light {
    fill: #ffd93d;
}

/* Add a glow effect */
#pet-canvas {
    box-shadow: 0 0 20px #ff6b6b;
}

/* Make the snake dance! */
#pet-canvas {
    animation: dance 0.5s ease infinite;
}
```

### Available Animations:
- `dance` - Snake does a little dance
- `bounce` - Snake bounces up and down
- `spin` - Snake spins around
- `pulse` - Snake pulses like a heartbeat
- `shake` - Snake shakes with excitement
- `glow` - Snake glows with a pulsing light
- `wave` - Gentle wave motion

## 🛠️ PWA Features

- **Offline Support**: Play without internet connection
- **Installable**: Add to home screen on mobile devices
- **Responsive**: Works on desktop and mobile
- **Auto-save**: Progress saved to localStorage

## 📁 Project Structure

```
Python/
├── index.html              # Main HTML file
├── styles.css              # 8-bit retro styling
├── app.js                  # Game logic and commands
├── parser.js               # Original script parser (backward compatible)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline
├── vercel.json             # Vercel deployment config
├── icons/                  # PWA icons (72-512px)
├── src/
│   ├── terminal/
│   │   ├── scriptParser.js       # Multi-line script parser with AST
│   │   └── terminalIntegration.js # Integration helper
│   ├── games/
│   │   └── miniGamesManager.js   # Mini-games and rewards manager
│   ├── storage/
│   │   └── saveManager.js        # Persistent save/load manager
│   └── styles/
│       └── cssEditor.js          # CSS editor for learning CSS
└── README.md               # Documentation
```

## 🔧 Integration Guide

### Using the Script Parser

The script parser (`src/terminal/scriptParser.js`) provides:

- **Indentation-aware parsing** producing an AST
- **Function calls**: `move("south", 3)` and `move('east', 3)`
- **Fallback tokens**: `move east 3` and single-token directions like `east`
- **Sequences**: separated by commas or newlines
- **Multi-line blocks**: `repeat(N):` and `if condition:`

```javascript
// Parse a script
const ast = window.ScriptParser.parseScript(`
repeat(3):
    move("east")
if can_move("south"):
    move("south")
`);

// Create an executor
const executor = window.ScriptParser.createExecutor(commands, printFn, {
    executionDelay: 200,
    maxIterations: 1000
});

// Execute the AST
await executor.execute(ast);
```

### Using the Mini-Games Manager

```javascript
// Create manager with callbacks
const manager = window.createMiniGamesManager({
    onCoinReward: (coins, info) => { /* handle coins */ },
    onXPReward: (xp, info) => { /* handle XP */ }
});

// Register a game
manager.registerGame('maze', {
    name: 'Maze Navigator',
    baseReward: 25,
    baseXP: 100
});

// Start game
manager.startGame('maze');

// Record moves
manager.recordMove('maze');

// End game and get rewards
const result = manager.endGame('maze', { won: true, score: 100 });
```

### Using the Save Manager

```javascript
// Create save manager
const saveManager = window.createSaveManager({
    storageKey: 'pypet_save',
    autoSaveInterval: 30000
});

// Save game state
saveManager.save(gameState, stats);

// Load game state
const data = saveManager.load();

// Start auto-save
saveManager.startAutoSave(() => ({ gameState, gameStats }));
```

### Using the Terminal Integration

The `TerminalIntegration` class wires all modules together:

```javascript
const integration = window.createTerminalIntegration({
    commands: commands,
    print: printFn,
    onSettingsChange: handleSettingsChange,
    onCoinsEarned: handleCoins,
    onXPEarned: handleXP
});

integration.initialize();

// Execute multi-line scripts
await integration.executeScript(source);

// Manage settings
integration.setSetting('snakeColor', '#ff0000');
const settings = integration.getSettings();

// Save/load
integration.save(gameState, stats);
const data = integration.load();
```

## 🎨 Design

- **8-bit Pixel Art**: Retro-style snake graphics
- **Terminal Interface**: Authentic Python REPL experience
- **Dark Theme**: Easy on the eyes for extended play
- **Press Start 2P Font**: Classic gaming typography
- **Customizable Colors**: Change snake and background colors

## 📖 Learning Path

1. **Basics**: Start with `tutorial()` to learn basic commands
2. **Functions**: Master function calls like `feed()` and `status()`
3. **Arguments**: Learn to pass arguments: `use_item("apple")`
4. **Conditionals**: Use `at_wall()` and `can_move()` in the maze
5. **Loops**: Use `repeat(n):` to repeat commands
6. **Logic**: Solve mazes using programming concepts

## 🤝 Contributing

Contributions welcome! Feel free to:
- Add new commands
- Create new mini games
- Improve the 8-bit graphics
- Add more tutorial steps

## 📄 License

MIT License - feel free to use for educational purposes!

---

Made with 💚 to teach Python programming