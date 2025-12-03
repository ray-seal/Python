// ==================== SCRIPT PARSER MODULE ====================
// Supports multi-line scripts with indentation-based blocks for teaching
// sequencing, repetition, and control flow.

/**
 * Token types for the lexer
 */
const TokenType = {
    IDENTIFIER: 'IDENTIFIER',
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    COLON: 'COLON',
    COMMA: 'COMMA',
    NEWLINE: 'NEWLINE',
    INDENT: 'INDENT',
    DEDENT: 'DEDENT',
    EOF: 'EOF',
    // Keywords
    REPEAT: 'REPEAT',
    IF: 'IF'
};

/**
 * AST Node types
 */
const NodeType = {
    PROGRAM: 'Program',
    SEQUENCE: 'Sequence',
    CALL: 'Call',
    REPEAT: 'Repeat',
    IF: 'If',
    NUMBER: 'Number',
    STRING: 'String',
    IDENTIFIER: 'Identifier'
};

/**
 * Tokenizer/Lexer for the script language
 */
class Lexer {
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
        const startPos = this.pos;
        while (this.peek() === ' ' || this.peek() === '\t') {
            if (this.peek() === ' ') {
                indent++;
            } else {
                // Tabs count as 4 spaces
                indent += 4;
            }
            this.advance();
        }
        return indent;
    }

    tokenize() {
        while (this.pos < this.source.length) {
            if (this.atLineStart) {
                // Handle indentation at the start of a line
                const indent = this.measureIndent();
                
                // Skip blank lines and comments
                if (this.peek() === '\n' || this.peek() === '#') {
                    if (this.peek() === '#') {
                        // Skip comment
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
                // Skip comment
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
            
            if (ch === '"' || ch === "'") {
                this.tokens.push(this.readString(ch));
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

    readString(quote) {
        const startLine = this.line;
        const startCol = this.col;
        this.advance(); // Skip opening quote
        let value = '';
        
        while (this.peek() && this.peek() !== quote && this.peek() !== '\n') {
            if (this.peek() === '\\') {
                this.advance();
                const escaped = this.peek();
                if (escaped === 'n') value += '\n';
                else if (escaped === 't') value += '\t';
                else if (escaped === '\\') value += '\\';
                else if (escaped === quote) value += quote;
                else value += escaped;
                this.advance();
            } else {
                value += this.advance();
            }
        }
        
        if (this.peek() === quote) {
            this.advance(); // Skip closing quote
        }
        
        return { type: TokenType.STRING, value, line: startLine, col: startCol };
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
        
        if (this.peek() === '.' && this.isDigit(this.peek(1))) {
            value += this.advance(); // decimal point
            while (this.isDigit(this.peek())) {
                value += this.advance();
            }
        }
        
        return { type: TokenType.NUMBER, value: parseFloat(value), line: startLine, col: startCol };
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
            'repeat': TokenType.REPEAT,
            'if': TokenType.IF
        };
        
        const type = keywords[value.toLowerCase()] || TokenType.IDENTIFIER;
        return { type, value, line: startLine, col: startCol };
    }
}

/**
 * Parser that produces an AST from tokens
 */
class Parser {
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
        
        if (token.type === TokenType.REPEAT) {
            return this.parseRepeat();
        }
        
        if (token.type === TokenType.IF) {
            return this.parseIf();
        }
        
        if (token.type === TokenType.IDENTIFIER) {
            return this.parseCallOrSequence();
        }
        
        // Skip unknown tokens
        if (token.type !== TokenType.EOF && 
            token.type !== TokenType.NEWLINE &&
            token.type !== TokenType.DEDENT) {
            this.advance();
        }
        
        return null;
    }

    parseCallOrSequence() {
        const calls = [];
        calls.push(this.parseCall());
        
        // Handle comma-separated calls on the same line
        while (this.peek().type === TokenType.COMMA) {
            this.advance(); // skip comma
            this.skipNewlines();
            if (this.peek().type === TokenType.IDENTIFIER ||
                this.peek().type === TokenType.REPEAT ||
                this.peek().type === TokenType.IF) {
                calls.push(this.parseStatement());
            }
        }
        
        if (calls.length === 1) {
            return calls[0];
        }
        
        return {
            type: NodeType.SEQUENCE,
            statements: calls
        };
    }

    parseCall() {
        const nameToken = this.expect(TokenType.IDENTIFIER, 'Expected function name');
        const name = nameToken.value;
        
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
            line: nameToken.line
        };
    }

    parseArgument() {
        const token = this.peek();
        
        if (token.type === TokenType.NUMBER) {
            this.advance();
            return { type: NodeType.NUMBER, value: token.value };
        }
        
        if (token.type === TokenType.STRING) {
            this.advance();
            return { type: NodeType.STRING, value: token.value };
        }
        
        if (token.type === TokenType.IDENTIFIER) {
            this.advance();
            // Check if it's a function call
            if (this.peek().type === TokenType.LPAREN) {
                // Put the identifier back conceptually - parse as call
                this.pos--;
                return this.parseCall();
            }
            // Return as identifier (for conditions like True/False)
            return { type: NodeType.IDENTIFIER, name: token.value };
        }
        
        throw new SyntaxError(`Unexpected token ${token.type} at line ${token.line}`);
    }

    parseRepeat() {
        const repeatToken = this.advance(); // consume 'repeat'
        this.expect(TokenType.LPAREN, 'Expected "(" after repeat');
        
        const countToken = this.expect(TokenType.NUMBER, 'Expected number in repeat');
        const count = countToken.value;
        
        this.expect(TokenType.RPAREN, 'Expected ")"');
        this.expect(TokenType.COLON, 'Expected ":" after repeat(n)');
        
        // Skip newline and expect indent
        this.skipNewlines();
        
        if (this.peek().type !== TokenType.INDENT) {
            throw new SyntaxError(`Expected indented block after repeat at line ${repeatToken.line}`);
        }
        this.advance(); // consume INDENT
        
        const body = this.parseBlock();
        
        return {
            type: NodeType.REPEAT,
            count: Math.floor(count),
            body,
            line: repeatToken.line
        };
    }

    parseIf() {
        const ifToken = this.advance(); // consume 'if'
        
        // Parse condition - could be a function call or identifier
        const condition = this.parseCondition();
        
        this.expect(TokenType.COLON, 'Expected ":" after if condition');
        
        // Skip newline and expect indent
        this.skipNewlines();
        
        if (this.peek().type !== TokenType.INDENT) {
            throw new SyntaxError(`Expected indented block after if at line ${ifToken.line}`);
        }
        this.advance(); // consume INDENT
        
        const body = this.parseBlock();
        
        return {
            type: NodeType.IF,
            condition,
            body,
            line: ifToken.line
        };
    }

    parseCondition() {
        const token = this.peek();
        
        if (token.type === TokenType.IDENTIFIER) {
            this.advance();
            // Check if it's a function call
            if (this.peek().type === TokenType.LPAREN) {
                this.pos--; // put identifier back
                return this.parseCall();
            }
            // Boolean identifiers like True/False
            return { type: NodeType.IDENTIFIER, name: token.value };
        }
        
        throw new SyntaxError(`Expected condition at line ${token.line}`);
    }

    parseBlock() {
        const statements = [];
        this.skipNewlines();
        
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
 * AST Executor - executes the parsed AST
 */
class Executor {
    constructor(commandHandlers, printFn) {
        this.commands = commandHandlers;
        this.print = printFn || console.log;
        this.executionDelay = 200; // ms between commands for visual feedback
    }

    async execute(ast) {
        if (ast.type === NodeType.PROGRAM) {
            for (const stmt of ast.body) {
                await this.executeStatement(stmt);
            }
        }
    }

    async executeStatement(node) {
        switch (node.type) {
            case NodeType.CALL:
                return await this.executeCall(node);
            
            case NodeType.SEQUENCE:
                for (const stmt of node.statements) {
                    await this.executeStatement(stmt);
                    await this.delay(this.executionDelay);
                }
                break;
            
            case NodeType.REPEAT:
                return await this.executeRepeat(node);
            
            case NodeType.IF:
                return await this.executeIf(node);
            
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    }

    async executeCall(node) {
        const { name, arguments: args } = node;
        
        if (!this.commands[name]) {
            this.print(`❌ NameError: '${name}' is not defined`, 'error');
            this.print(`Type help() to see available commands`, 'system');
            return undefined;
        }
        
        // Evaluate arguments
        const evaluatedArgs = args.map(arg => this.evaluateArgument(arg));
        
        // Call the command
        try {
            const result = await this.commands[name](...evaluatedArgs);
            return result;
        } catch (e) {
            this.print(`❌ Error: ${e.message}`, 'error');
            return undefined;
        }
    }

    evaluateArgument(arg) {
        switch (arg.type) {
            case NodeType.NUMBER:
                return arg.value;
            case NodeType.STRING:
                return arg.value;
            case NodeType.IDENTIFIER:
                if (arg.name === 'True' || arg.name === 'true') return true;
                if (arg.name === 'False' || arg.name === 'false') return false;
                return arg.name;
            case NodeType.CALL:
                // Synchronously execute and return - for conditions
                return this.executeCallSync(arg);
            default:
                return undefined;
        }
    }

    executeCallSync(node) {
        const { name, arguments: args } = node;
        if (!this.commands[name]) {
            return undefined;
        }
        const evaluatedArgs = args.map(arg => this.evaluateArgument(arg));
        return this.commands[name](...evaluatedArgs);
    }

    async executeRepeat(node) {
        const { count, body } = node;
        
        this.print(`🔄 Repeating ${count} times...`, 'info');
        
        for (let i = 0; i < count; i++) {
            for (const stmt of body) {
                await this.executeStatement(stmt);
                await this.delay(this.executionDelay);
            }
        }
    }

    async executeIf(node) {
        const { condition, body } = node;
        
        // Evaluate condition
        let conditionResult;
        if (condition.type === NodeType.CALL) {
            conditionResult = this.executeCallSync(condition);
        } else if (condition.type === NodeType.IDENTIFIER) {
            conditionResult = this.evaluateArgument(condition);
        }
        
        if (conditionResult) {
            this.print(`✓ Condition is true, executing block`, 'info');
            for (const stmt of body) {
                await this.executeStatement(stmt);
                await this.delay(this.executionDelay);
            }
        } else {
            this.print(`✗ Condition is false, skipping block`, 'info');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Main parsing function - parses source code and returns an AST
 * @param {string} source - The source code to parse
 * @returns {object} - The AST representing the program
 */
function parseScript(source) {
    const lexer = new Lexer(source);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    return parser.parse();
}

/**
 * Checks if a script is multi-line or contains block statements
 * @param {string} source - The source code
 * @returns {boolean} - True if the script needs multi-line parsing
 */
function isMultiLineScript(source) {
    const trimmed = source.trim();
    // Check for newlines, repeat, or if statements
    return trimmed.includes('\n') || 
           /^repeat\s*\(/i.test(trimmed) ||
           /^if\s+/i.test(trimmed);
}

/**
 * Creates an executor for running parsed ASTs
 * @param {object} commands - Object mapping command names to functions
 * @param {function} printFn - Function to print output
 * @returns {Executor} - An executor instance
 */
function createExecutor(commands, printFn) {
    return new Executor(commands, printFn);
}

// Export for use in app.js
if (typeof window !== 'undefined') {
    window.ScriptParser = {
        parseScript,
        isMultiLineScript,
        createExecutor,
        TokenType,
        NodeType
    };
}

// Export for testing in Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseScript,
        isMultiLineScript,
        createExecutor,
        Lexer,
        Parser,
        Executor,
        TokenType,
        NodeType
    };
}
