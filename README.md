# 🐍 PyPet - Learn Python with Snake!

A fun Progressive Web App (PWA) game to teach Python programming through caring for a virtual 8-bit snake pet!

![PyPet Screenshot](https://img.shields.io/badge/PWA-Ready-brightgreen) ![Python Learning](https://img.shields.io/badge/Learn-Python-blue)

## 🎮 Features

### Virtual Pet Care
- Feed, play with, and care for your 8-bit snake pet
- Monitor hunger, happiness, and energy stats
- Level up your snake by performing actions
- Earn coins to buy items from the shop

### Python Learning
- Use Python-like syntax to interact: `feed()`, `play()`, `status()`
- Learn function calls with arguments: `use_item("apple")`, `move("north")`
- Progressive tutorial system for beginners
- Real-time feedback in a terminal interface

### Mini Games
- **Maze Game**: Navigate your snake through procedurally generated mazes
- Learn conditional logic: `at_wall()`, `can_move("direction")`
- Practice loops and decision making

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
at_wall()           # Check if wall ahead
can_move("east")    # Check if can move in direction
turn_left()         # Turn left
turn_right()        # Turn right
exit_maze()         # Leave maze game
```

### Learning
```python
help()              # Show all commands
tutorial()          # Start the tutorial
hint()              # Get a helpful hint
clear()             # Clear the terminal
```

## 🛠️ PWA Features

- **Offline Support**: Play without internet connection
- **Installable**: Add to home screen on mobile devices
- **Responsive**: Works on desktop and mobile
- **Auto-save**: Progress saved to localStorage

## 📁 Project Structure

```
Python/
├── index.html      # Main HTML file
├── styles.css      # 8-bit retro styling
├── app.js          # Game logic and commands
├── manifest.json   # PWA manifest
├── sw.js           # Service worker for offline
├── vercel.json     # Vercel deployment config
├── icons/          # PWA icons (72-512px)
└── README.md       # Documentation
```

## 🎨 Design

- **8-bit Pixel Art**: Retro-style snake graphics
- **Terminal Interface**: Authentic Python REPL experience
- **Dark Theme**: Easy on the eyes for extended play
- **Press Start 2P Font**: Classic gaming typography

## 📖 Learning Path

1. **Basics**: Start with `tutorial()` to learn basic commands
2. **Functions**: Master function calls like `feed()` and `status()`
3. **Arguments**: Learn to pass arguments: `use_item("apple")`
4. **Conditionals**: Use `at_wall()` and `can_move()` in the maze
5. **Logic**: Solve mazes using programming concepts

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