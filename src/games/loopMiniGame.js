// ==================== LOOP MINI-GAME MODULE ====================
// Snake-themed puzzle teaching loops and conditionals
// 
// This module provides:
// - Snake movement puzzle on a 5x5 grid
// - Indentation-aware mini-language parser
// - Support for for/while/if/elif/else constructs
// - Integration with mini-games manager

(function() {
'use strict';

/**
 * Token types for the mini-language lexer
 */
const TokenType = {
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    COLON: 'COLON',
    COMMA: 'COMMA',
    NEWLINE: 'NEWLINE',
    INDENT: 'INDENT',
    DEDENT: 'DEDENT',
    EOF: 'EOF',
    // Keywords
    FOR: 'FOR',
    IN: 'IN',
    RANGE: 'RANGE',
    WHILE: 'WHILE',
    IF: 'IF',
    ELIF: 'ELIF',
    ELSE: 'ELSE'
};

/**
 * AST Node types
 */
const NodeType = {
    PROGRAM: 'Program',
    FOR_LOOP: 'ForLoop',
    WHILE_LOOP: 'WhileLoop',
    IF_STATEMENT: 'IfStatement',
    CALL: 'Call',
    NUMBER: 'Number',
    IDENTIFIER: 'Identifier'
};

/**
 * Simple lexer for the mini-language
 */
class MiniLexer {
    constructor(source) {
        this.source = source;
        this.pos = 0;
        this.line = 1;
        this.col = 1;
        this.indentStack = [0];
        this.tokens = [];
        this.atLineStart = true;
    }

    peek(offset = 0) {
        return this.source[this.pos + offset] || '';
    }

    advance() {
        const ch = this.source[this.pos++];
        if (ch === '\n') {
            this.line++;
            this.col = 1;
        } else {
            this.col++;
        }
        return ch;
    }

    skipWhitespaceOnLine() {
        while (this.peek() === ' ' || this.peek() === '\t') {
            this.advance();
        }
    }

    measureIndent() {
        let indent = 0;
        while (this.peek() === ' ' || this.peek() === '\t') {
            indent += (this.peek() === ' ') ? 1 : 4;
            this.advance();
        }
        return indent;
    }

    tokenize() {
        while (this.pos < this.source.length) {
            if (this.atLineStart) {
                const indent = this.measureIndent();
                
                // Skip blank lines and comments
                if (this.peek() === '\n' || this.peek() === '#') {
                    if (this.peek() === '#') {
                        while (this.peek() && this.peek() !== '\n') {
                            this.advance();
                        }
                    }
                    if (this.peek() === '\n') {
                        this.advance();
                    }
                    continue;
                }
                
                if (this.peek() === '' || this.pos >= this.source.length) {
                    break;
                }
                
                const currentIndent = this.indentStack[this.indentStack.length - 1];
                
                if (indent > currentIndent) {
                    this.indentStack.push(indent);
                    this.tokens.push({ type: TokenType.INDENT, line: this.line, col: 1 });
                } else if (indent < currentIndent) {
                    while (this.indentStack.length > 1 && 
                           this.indentStack[this.indentStack.length - 1] > indent) {
                        this.indentStack.pop();
                        this.tokens.push({ type: TokenType.DEDENT, line: this.line, col: 1 });
                    }
                    // Check if we landed on a valid indentation level
                    if (this.indentStack[this.indentStack.length - 1] !== indent && this.indentStack.length > 0) {
                        throw new SyntaxError(`Indentation error at line ${this.line}: inconsistent indentation`);
                    }
                }
                
                this.atLineStart = false;
            }
            
            const ch = this.peek();
            
            if (ch === ' ' || ch === '\t') {
                this.skipWhitespaceOnLine();
                continue;
            }
            
            if (ch === '\n') {
                this.tokens.push({ type: TokenType.NEWLINE, line: this.line, col: this.col });
                this.advance();
                this.atLineStart = true;
                continue;
            }
            
            if (ch === '#') {
                while (this.peek() && this.peek() !== '\n') {
                    this.advance();
                }
                continue;
            }
            
            if (ch === '(') {
                this.tokens.push({ type: TokenType.LPAREN, line: this.line, col: this.col });
                this.advance();
                continue;
            }
            
            if (ch === ')') {
                this.tokens.push({ type: TokenType.RPAREN, line: this.line, col: this.col });
                this.advance();
                continue;
            }
            
            if (ch === ':') {
                this.tokens.push({ type: TokenType.COLON, line: this.line, col: this.col });
                this.advance();
                continue;
            }
            
            if (ch === ',') {
                this.tokens.push({ type: TokenType.COMMA, line: this.line, col: this.col });
                this.advance();
                continue;
            }
            
            if (this.isDigit(ch) || (ch === '-' && this.isDigit(this.peek(1)))) {
                this.tokens.push(this.readNumber());
                continue;
            }
            
            if (this.isAlpha(ch) || ch === '_') {
                this.tokens.push(this.readIdentifier());
                continue;
            }
            
            // Unknown character - skip it
            this.advance();
        }
        
        // Emit remaining DEDENTs
        while (this.indentStack.length > 1) {
            this.indentStack.pop();
            this.tokens.push({ type: TokenType.DEDENT, line: this.line, col: this.col });
        }
        
        this.tokens.push({ type: TokenType.EOF, line: this.line, col: this.col });
        return this.tokens;
    }

    isDigit(ch) {
        return ch >= '0' && ch <= '9';
    }

    isAlpha(ch) {
        return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');
    }

    isAlphaNumeric(ch) {
        return this.isAlpha(ch) || this.isDigit(ch) || ch === '_';
    }

    readNumber() {
        const startLine = this.line;
        const startCol = this.col;
        let value = '';
        
        if (this.peek() === '-') {
            value += this.advance();
        }
        
        while (this.isDigit(this.peek())) {
            value += this.advance();
        }
        
        return { type: TokenType.NUMBER, value: parseInt(value, 10), line: startLine, col: startCol };
    }

    readIdentifier() {
        const startLine = this.line;
        const startCol = this.col;
        let value = '';
        
        while (this.isAlphaNumeric(this.peek())) {
            value += this.advance();
        }
        
        // Check for keywords
        const keywords = {
            'for': TokenType.FOR,
            'in': TokenType.IN,
            'range': TokenType.RANGE,
            'while': TokenType.WHILE,
            'if': TokenType.IF,
            'elif': TokenType.ELIF,
            'else': TokenType.ELSE
        };
        
        const type = keywords[value.toLowerCase()] || TokenType.IDENTIFIER;
        return { type, value, line: startLine, col: startCol };
    }
}

/**
 * Parser for the mini-language
 */
class MiniParser {
    constructor(tokens) {
        this.tokens = tokens;
        this.pos = 0;
    }

    peek(offset = 0) {
        return this.tokens[this.pos + offset] || { type: TokenType.EOF };
    }

    advance() {
        return this.tokens[this.pos++];
    }

    expect(type, errorMsg) {
        const token = this.peek();
        if (token.type !== type) {
            throw new SyntaxError(`${errorMsg} at line ${token.line}, col ${token.col}. Got ${token.type}`);
        }
        return this.advance();
    }

    skipNewlines() {
        while (this.peek().type === TokenType.NEWLINE) {
            this.advance();
        }
    }

    parse() {
        const statements = [];
        this.skipNewlines();
        
        while (this.peek().type !== TokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            }
            this.skipNewlines();
        }
        
        return {
            type: NodeType.PROGRAM,
            body: statements
        };
    }

    parseStatement() {
        const token = this.peek();
        
        if (token.type === TokenType.FOR) {
            return this.parseForLoop();
        }
        
        if (token.type === TokenType.WHILE) {
            return this.parseWhileLoop();
        }
        
        if (token.type === TokenType.IF) {
            return this.parseIfStatement();
        }
        
        if (token.type === TokenType.IDENTIFIER) {
            return this.parseCall();
        }
        
        // Skip unknown tokens
        if (token.type !== TokenType.EOF && 
            token.type !== TokenType.NEWLINE &&
            token.type !== TokenType.DEDENT) {
            this.advance();
        }
        
        return null;
    }

    parseForLoop() {
        const forToken = this.advance(); // consume 'for'
        
        const varToken = this.expect(TokenType.IDENTIFIER, 'Expected variable name after "for"');
        const varName = varToken.value;
        
        this.expect(TokenType.IN, 'Expected "in" after loop variable');
        this.expect(TokenType.RANGE, 'Expected "range" after "in"');
        this.expect(TokenType.LPAREN, 'Expected "(" after "range"');
        
        const countToken = this.expect(TokenType.NUMBER, 'Expected number in range()');
        const count = countToken.value;
        
        this.expect(TokenType.RPAREN, 'Expected ")" after range argument');
        this.expect(TokenType.COLON, 'Expected ":" after for statement');
        
        this.skipNewlines();
        
        if (this.peek().type !== TokenType.INDENT) {
            throw new SyntaxError(`Expected indented block after for loop at line ${forToken.line}`);
        }
        this.advance(); // consume INDENT
        
        const body = this.parseBlock();
        
        return {
            type: NodeType.FOR_LOOP,
            variable: varName,
            count: count,
            body,
            line: forToken.line
        };
    }

    parseWhileLoop() {
        const whileToken = this.advance(); // consume 'while'
        
        const condition = this.parseCondition();
        
        this.expect(TokenType.COLON, 'Expected ":" after while condition');
        
        this.skipNewlines();
        
        if (this.peek().type !== TokenType.INDENT) {
            throw new SyntaxError(`Expected indented block after while loop at line ${whileToken.line}`);
        }
        this.advance(); // consume INDENT
        
        const body = this.parseBlock();
        
        return {
            type: NodeType.WHILE_LOOP,
            condition,
            body,
            line: whileToken.line
        };
    }

    parseIfStatement() {
        const ifToken = this.advance(); // consume 'if'
        
        const condition = this.parseCondition();
        
        this.expect(TokenType.COLON, 'Expected ":" after if condition');
        
        this.skipNewlines();
        
        if (this.peek().type !== TokenType.INDENT) {
            throw new SyntaxError(`Expected indented block after if at line ${ifToken.line}`);
        }
        this.advance(); // consume INDENT
        
        const body = this.parseBlock();
        
        // Check for elif/else clauses
        const elifClauses = [];
        let elseBody = null;
        
        this.skipNewlines();
        
        while (this.peek().type === TokenType.ELIF) {
            this.advance(); // consume 'elif'
            const elifCondition = this.parseCondition();
            this.expect(TokenType.COLON, 'Expected ":" after elif condition');
            this.skipNewlines();
            
            if (this.peek().type !== TokenType.INDENT) {
                throw new SyntaxError(`Expected indented block after elif at line ${this.peek().line}`);
            }
            this.advance(); // consume INDENT
            
            const elifBody = this.parseBlock();
            elifClauses.push({ condition: elifCondition, body: elifBody });
            
            this.skipNewlines();
        }
        
        if (this.peek().type === TokenType.ELSE) {
            this.advance(); // consume 'else'
            this.expect(TokenType.COLON, 'Expected ":" after else');
            this.skipNewlines();
            
            if (this.peek().type !== TokenType.INDENT) {
                throw new SyntaxError(`Expected indented block after else at line ${this.peek().line}`);
            }
            this.advance(); // consume INDENT
            
            elseBody = this.parseBlock();
        }
        
        return {
            type: NodeType.IF_STATEMENT,
            condition,
            body,
            elifClauses,
            elseBody,
            line: ifToken.line
        };
    }

    parseCondition() {
        const token = this.peek();
        
        if (token.type === TokenType.IDENTIFIER) {
            this.advance();
            // Check if it's a function call
            if (this.peek().type === TokenType.LPAREN) {
                return this.parseCallWithParens(token.value, token.line);
            }
            return { type: NodeType.IDENTIFIER, name: token.value };
        }
        
        throw new SyntaxError(`Expected condition at line ${token.line}`);
    }

    parseCall() {
        const nameToken = this.advance();
        const name = nameToken.value;
        
        if (this.peek().type === TokenType.LPAREN) {
            return this.parseCallWithParens(name, nameToken.line);
        }
        
        // Simple call without arguments
        return {
            type: NodeType.CALL,
            name,
            arguments: [],
            line: nameToken.line
        };
    }

    parseCallWithParens(name, line) {
        this.expect(TokenType.LPAREN, 'Expected "(" after function name');
        
        const args = [];
        
        if (this.peek().type !== TokenType.RPAREN) {
            args.push(this.parseArgument());
            
            while (this.peek().type === TokenType.COMMA) {
                this.advance(); // skip comma
                args.push(this.parseArgument());
            }
        }
        
        this.expect(TokenType.RPAREN, 'Expected ")"');
        
        return {
            type: NodeType.CALL,
            name,
            arguments: args,
            line
        };
    }

    parseArgument() {
        const token = this.peek();
        
        if (token.type === TokenType.NUMBER) {
            this.advance();
            return { type: NodeType.NUMBER, value: token.value };
        }
        
        if (token.type === TokenType.IDENTIFIER) {
            this.advance();
            return { type: NodeType.IDENTIFIER, name: token.value };
        }
        
        throw new SyntaxError(`Unexpected token ${token.type} at line ${token.line}`);
    }

    parseBlock() {
        const statements = [];
        
        while (this.peek().type !== TokenType.DEDENT && 
               this.peek().type !== TokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt) {
                statements.push(stmt);
            }
            this.skipNewlines();
        }
        
        if (this.peek().type === TokenType.DEDENT) {
            this.advance(); // consume DEDENT
        }
        
        return statements;
    }
}

/**
 * Executor for the mini-language
 */
class MiniExecutor {
    constructor(commands, maxIterations = 100) {
        this.commands = commands;
        this.maxIterations = maxIterations;
        this.stopped = false;
    }

    reset() {
        this.stopped = false;
    }

    stop() {
        this.stopped = true;
    }

    async execute(ast) {
        this.reset();
        if (ast.type === NodeType.PROGRAM) {
            for (const stmt of ast.body) {
                if (this.stopped) break;
                await this.executeStatement(stmt);
            }
        }
    }

    async executeStatement(node) {
        if (this.stopped) return;
        
        switch (node.type) {
            case NodeType.CALL:
                return await this.executeCall(node);
            
            case NodeType.FOR_LOOP:
                return await this.executeForLoop(node);
            
            case NodeType.WHILE_LOOP:
                return await this.executeWhileLoop(node);
            
            case NodeType.IF_STATEMENT:
                return await this.executeIfStatement(node);
            
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    async executeCall(node) {
        const { name, arguments: args } = node;
        
        if (!this.commands[name]) {
            throw new Error(`Unknown command: ${name}`);
        }
        
        // Evaluate arguments
        const evaluatedArgs = args.map(arg => this.evaluateArgument(arg));
        
        // Call the command
        const result = await this.commands[name](...evaluatedArgs);
        return result;
    }

    evaluateArgument(arg) {
        switch (arg.type) {
            case NodeType.NUMBER:
                return arg.value;
            case NodeType.IDENTIFIER:
                if (arg.name === 'True' || arg.name === 'true') return true;
                if (arg.name === 'False' || arg.name === 'false') return false;
                return arg.name;
            case NodeType.CALL:
                return this.executeCallSync(arg);
            default:
                return undefined;
        }
    }

    executeCallSync(node) {
        const { name, arguments: args } = node;
        if (!this.commands[name]) {
            throw new Error(`Unknown command: ${name}`);
        }
        const evaluatedArgs = args.map(arg => this.evaluateArgument(arg));
        return this.commands[name](...evaluatedArgs);
    }

    async executeForLoop(node) {
        const { count, body } = node;
        
        for (let i = 0; i < count; i++) {
            if (this.stopped) break;
            for (const stmt of body) {
                if (this.stopped) break;
                await this.executeStatement(stmt);
            }
        }
    }

    async executeWhileLoop(node) {
        const { condition, body } = node;
        let iterations = 0;
        
        while (this.evaluateCondition(condition) && iterations < this.maxIterations) {
            if (this.stopped) break;
            iterations++;
            
            for (const stmt of body) {
                if (this.stopped) break;
                await this.executeStatement(stmt);
            }
        }
        
        if (iterations >= this.maxIterations) {
            throw new Error(`Loop exceeded maximum iterations (${this.maxIterations})`);
        }
    }

    async executeIfStatement(node) {
        const { condition, body, elifClauses, elseBody } = node;
        
        // Evaluate main if condition
        if (this.evaluateCondition(condition)) {
            for (const stmt of body) {
                if (this.stopped) break;
                await this.executeStatement(stmt);
            }
            return;
        }
        
        // Check elif clauses
        for (const elifClause of elifClauses) {
            if (this.evaluateCondition(elifClause.condition)) {
                for (const stmt of elifClause.body) {
                    if (this.stopped) break;
                    await this.executeStatement(stmt);
                }
                return;
            }
        }
        
        // Execute else block if present
        if (elseBody) {
            for (const stmt of elseBody) {
                if (this.stopped) break;
                await this.executeStatement(stmt);
            }
        }
    }

    evaluateCondition(condition) {
        if (condition.type === NodeType.CALL) {
            return this.executeCallSync(condition);
        } else if (condition.type === NodeType.IDENTIFIER) {
            return this.evaluateArgument(condition);
        }
        return false;
    }
}

/**
 * Grid-based snake puzzle state
 */
class SnakePuzzle {
    constructor(gridSize = 5) {
        this.gridSize = gridSize;
        this.snakeX = 0;
        this.snakeY = 0;
        this.goalX = gridSize - 1;
        this.goalY = gridSize - 1;
        this.moves = 0;
        this.maxMoves = 50;
    }

    reset() {
        this.snakeX = 0;
        this.snakeY = 0;
        this.moves = 0;
    }

    isAtGoal() {
        return this.snakeX === this.goalX && this.snakeY === this.goalY;
    }

    canMoveUp() {
        return this.snakeY > 0;
    }

    canMoveDown() {
        return this.snakeY < this.gridSize - 1;
    }

    canMoveLeft() {
        return this.snakeX > 0;
    }

    canMoveRight() {
        return this.snakeX < this.gridSize - 1;
    }

    moveUp() {
        if (this.canMoveUp()) {
            this.snakeY--;
            this.moves++;
            return true;
        }
        throw new Error('Cannot move up: already at the top edge!');
    }

    moveDown() {
        if (this.canMoveDown()) {
            this.snakeY++;
            this.moves++;
            return true;
        }
        throw new Error('Cannot move down: already at the bottom edge!');
    }

    moveLeft() {
        if (this.canMoveLeft()) {
            this.snakeX--;
            this.moves++;
            return true;
        }
        throw new Error('Cannot move left: already at the left edge!');
    }

    moveRight() {
        if (this.canMoveRight()) {
            this.snakeX++;
            this.moves++;
            return true;
        }
        throw new Error('Cannot move right: already at the right edge!');
    }

    getState() {
        return {
            snakeX: this.snakeX,
            snakeY: this.snakeY,
            goalX: this.goalX,
            goalY: this.goalY,
            moves: this.moves,
            atGoal: this.isAtGoal()
        };
    }

    renderGrid() {
        const lines = [];
        for (let y = 0; y < this.gridSize; y++) {
            let line = '';
            for (let x = 0; x < this.gridSize; x++) {
                if (x === this.snakeX && y === this.snakeY) {
                    line += '🐍 ';
                } else if (x === this.goalX && y === this.goalY) {
                    line += '🍎 ';
                } else {
                    line += '⬜ ';
                }
            }
            lines.push(line);
        }
        return lines.join('\n');
    }
}

/**
 * Main function to run the loop mini-game
 * @param {object} uiHelpers - UI helper functions { showPrompt, getInput, showResult }
 * @param {object} options - Game options
 * @returns {Promise<object>} - Game result { success, reward, details }
 */
async function runLoopMiniGame(uiHelpers, options = {}) {
    const { showPrompt, getInput, showResult } = uiHelpers;
    
    if (!showPrompt || !getInput || !showResult) {
        throw new Error('uiHelpers must implement: showPrompt(text), getInput() -> Promise, showResult(obj)');
    }
    
    const gridSize = options.gridSize || 5;
    const puzzle = new SnakePuzzle(gridSize);
    
    // Show initial state
    showPrompt(`
🐍 Snake Loop Challenge! 🐍

Guide the snake from the top-left to the apple 🍎 in the bottom-right!

${puzzle.renderGrid()}

Write a script using:
  - for i in range(N): ... (for loops)
  - while condition: ... (while loops)
  - if condition: ... elif condition: ... else: ... (conditionals)

Available commands:
  - move_up(), move_down(), move_left(), move_right()
  - at_goal() - returns True if snake reached the apple
  - can_move_up(), can_move_down(), can_move_left(), can_move_right()

Example solution (use Shift+Enter for new lines):
  for i in range(${gridSize - 1}):
      move_right()
  for i in range(${gridSize - 1}):
      move_down()
    `);
    
    // Get user script
    const userScript = await getInput();
    
    if (!userScript || userScript.trim() === '') {
        showResult({
            success: false,
            reward: 0,
            details: { message: 'No script provided', moves: 0 }
        });
        return { success: false, reward: 0, details: { message: 'No script provided', moves: 0 } };
    }
    
    // Create commands for the puzzle
    const commands = {
        move_up: () => {
            const result = puzzle.moveUp();
            if (!result) throw new Error('Cannot move up!');
            return result;
        },
        move_down: () => {
            const result = puzzle.moveDown();
            if (!result) throw new Error('Cannot move down!');
            return result;
        },
        move_left: () => {
            const result = puzzle.moveLeft();
            if (!result) throw new Error('Cannot move left!');
            return result;
        },
        move_right: () => {
            const result = puzzle.moveRight();
            if (!result) throw new Error('Cannot move right!');
            return result;
        },
        at_goal: () => puzzle.isAtGoal(),
        can_move_up: () => puzzle.canMoveUp(),
        can_move_down: () => puzzle.canMoveDown(),
        can_move_left: () => puzzle.canMoveLeft(),
        can_move_right: () => puzzle.canMoveRight()
    };
    
    // Parse and execute the script
    try {
        const lexer = new MiniLexer(userScript);
        const tokens = lexer.tokenize();
        const parser = new MiniParser(tokens);
        const ast = parser.parse();
        
        const executor = new MiniExecutor(commands, 100);
        await executor.execute(ast);
        
        // Check if snake reached the goal
        const success = puzzle.isAtGoal();
        
        // Calculate reward - use a score that the mini-games manager can apply its bonus system to
        let reward = 0;
        let score = 0;
        if (success) {
            const optimalMoves = (gridSize - 1) * 2; // Simple optimal path
            const efficiency = Math.max(0, 1 - (puzzle.moves - optimalMoves) / optimalMoves);
            score = Math.floor(efficiency * 100); // Score 0-100 based on efficiency
            // Base reward will be applied by mini-games manager
            reward = 20; // Base reward, manager will add bonuses
        }
        
        const result = {
            success,
            reward,
            score,
            details: {
                message: success ? 
                    `✅ Snake reached the apple in ${puzzle.moves} moves! Score: ${score}/100` :
                    `❌ Snake didn't reach the apple. Try again!`,
                moves: puzzle.moves,
                finalPosition: { x: puzzle.snakeX, y: puzzle.snakeY },
                grid: puzzle.renderGrid()
            }
        };
        
        showResult(result);
        return result;
        
    } catch (error) {
        const result = {
            success: false,
            reward: 0,
            details: {
                message: `❌ Error: ${error.message}`,
                error: error.message,
                moves: puzzle.moves
            }
        };
        
        showResult(result);
        return result;
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.LoopMiniGame = {
        runLoopMiniGame
    };
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runLoopMiniGame
    };
}

})(); // End of IIFE
