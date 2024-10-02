function obtenerTokens() {
  const tokensString = localStorage.getItem("tokensReconocidos");
  return JSON.parse(tokensString); // Parse the JSON string into an array of objects
}

/**
 * Establece la gramatica del lenguaje
 *
 * modificador = 'public' | 'private' | 'protected'
 * program = modificador class identificador (PascalCase) '{' (sentencia* | funcion)*| funcionMain '}'
 * funcionMain = 'public static void main(String[] args)' '{' (sentencia)* '}'
 * funcion = modificador tipo | 'void' identificador (camelCase) '(' parametro* ')' '{' (sentencia)* '}'
 * parametro = tipo identificador (camelCase)
 * sentencia = 'System.out.println' '(' cadena ')' ';' 
 * sentencia = 'System.out.println' '(' expresion ')' ';'
 * sentencia = 'if' '(' expresion ')' '{' (sentencia)* '}'
 * sentencia = 'if' '(' expresion ')' '{' (sentencia)* '}' 'else' '{' (sentencia)* '}'
 * sentencia = tipo identificador (camelCase) '=' expresion ';'
 * sentencia = identificador (camelCase) '=' expresion ';'
 * declaracion = tipo identificador (camelCase)
 * tipo = 'int' | 'double' | 'String'
 * expresion = numero | identificador (camelCase) | expresion operador_aritmetico expresion
 * operador_aritmetico = '+' | '-' | '*' | '/' | '==' | '!=' | '<=' | '>=' | '<' | '>'
 *
 */

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.currentToken = 0;
  }

  parse() {
    return this.program();
  }

  program() {
    const node = { type: 'Program'};
    node.modificador = this.modificador();
    if (this.match('RESERVADAS', 'class')) {
      node.class = this.consumeToken('IDENTIFICADOR');
      node.body = [];
      if (this.match('LLAVES', '{')) {
        while (this.peek().value !== '}') {
          if (this.peek().value === 'public' && this.peek(1).value === 'static' && this.peek(2).value === 'void' && this.peek(3).value === 'main') {
            node.body.push(this.funcionMain());
          } else {
            node.body.push(this.funcion());
          }
        }
        this.match('LLAVES', '}');
        return node;
      }
    }
    throw new Error('Invalid program structure');
  }

  funcionMain() {
    const node = { type: 'FuncionMain', body: [] };
    this.consumeToken('RESERVADAS', "public"); // public
    this.consumeToken('RESERVADAS', "static"); // static
    this.consumeToken('RESERVADAS', "void"); // void
    this.consumeToken('RESERVADAS', "main"); // main
    this.consumeToken('PARENTESIS', '(');
    this.consumeToken('RESERVADAS', "String"); // String[]
    this.consumeToken('CORCHETES', "["); // String[]
    this.consumeToken('CORCHETES', "]"); // String[]
    this.consumeToken('RESERVADAS'); // args
    this.consumeToken('PARENTESIS', ')');
    this.consumeToken('LLAVES', '{');
    while (this.peek().value !== '}') {
      node.body.push(this.sentencia());
    }
    this.consumeToken('LLAVES', '}');
    return node;
  }

  funcion() {
    const node = { type: 'Funcion' };
    node.modificador = this.modificador();
    node.returnType = this.tipo() || this.consumeToken('RESERVADAS', 'void');
    node.name = this.consumeToken('IDENTIFICADOR');
    node.params = [];
    this.consumeToken('PARENTESIS', '(');
    while (this.peek().value !== ')') {
      node.params.push(this.parametro());
      if (this.peek().value !== ')') {
        this.consumeToken('COMA');
      }
    }
    this.consumeToken('PARENTESIS', ')');
    node.body = [];
    this.consumeToken('LLAVES', '{');
    while (this.peek().value !== '}') {
      node.body.push(this.sentencia());
    }
    this.consumeToken('LLAVES', '}');
    return node;
  }

  parametro() {
    return {
      type: 'Parametro',
      dataType: this.tipo(),
      name: this.consumeToken('IDENTIFICADOR')
    };
  }

  sentencia() {
    if (this.match('RESERVADAS', 'System.out.println')) {
      const node = { type: 'PrintStatement' };
      this.consumeToken('PARENTESIS', '(');
      if (this.peek().type === 'CADENA') {
        node.value = this.consumeToken('CADENA');
      } else {
        node.value = this.expresion();
      }
      this.consumeToken('PARENTESIS', ')');
      this.consumeToken('PUNTOYCOMA');
      return node;
    } else if (this.match('RESERVADAS', 'if')) {
      const node = { type: 'IfStatement' };
      this.consumeToken('PARENTESIS', '(');
      node.condition = this.expresion();
      this.consumeToken('PARENTESIS', ')');
      node.consequent = [];
      this.consumeToken('LLAVES', '{');
      while (this.peek().value !== '}') {
        node.consequent.push(this.sentencia());
      }
      this.consumeToken('LLAVES', '}');
      if (this.match('RESERVADAS', 'else')) {
        node.alternate = [];
        this.consumeToken('LLAVES', '{');
        while (this.peek().value !== '}') {
          node.alternate.push(this.sentencia());
        }
        this.consumeToken('LLAVES', '}');
      }
      return node;
    } else {
      const node = { type: 'AssignmentStatement' };
      if (this.peek().type === 'RESERVADAS' && ['int', 'double', 'String'].includes(this.peek().value)) {
        node.dataType = this.tipo();
      }
      node.left = this.consumeToken('IDENTIFICADOR');
      this.consumeToken('OPERADOR', '=');
      node.right = this.expresion();
      this.consumeToken('PUNTOYCOMA');
      return node;
    }
  }

  expresion() {
    let left = this.termino();
    while (this.peek().type === 'OPERADOR' || this.peek().type === 'COMPARACION') {
      const operator = this.consumeToken(this.peek().type);
      const right = this.termino();
      left = {
        type: 'BinaryExpression',
        operator: operator.value,
        left,
        right
      };
    }
    return left;
  }

  termino() {
    if (this.peek().type === 'NUMERO') {
      return { type: 'NumericLiteral', value: this.consumeToken('NUMERO').value };
    } else if (this.peek().type === 'IDENTIFICADOR') {
      return { type: 'Identifier', name: this.consumeToken('IDENTIFICADOR').value };
    } else {
      throw new Error('Unexpected token in expression');
    }
  }

  modificador() {
    if (['public', 'private', 'protected'].includes(this.peek().value)) {
      return this.consumeToken('RESERVADAS').value;
    }
    return null;
  }

  tipo() {
    if (['int', 'double', 'String'].includes(this.peek().value)) {
      return this.consumeToken('RESERVADAS').value;
    }
    return null;
  }

  match(type, value) {
    if (this.peek().type === type && (!value || this.peek().value === value)) {
      this.currentToken++;
      return true;
    }
    return false;
  }

  peek(offset = 0) {
    if (this.currentToken + offset < this.tokens.length) {
      return this.tokens[this.currentToken + offset];
    }
    return null;
  }
  
  consumeToken(type, value) {
    if (this.peek().type !== type || (value && this.peek().value !== value)) {
      throw new Error(`Expected token of type ${type}${value ? ` with value ${value}` : ''}, but got ${JSON.stringify(this.peek())}`);
    }
    return this.tokens[this.currentToken++];
  }
}

function obtenerAST() {
  const tokens = obtenerTokens();
  if (!Array.isArray(tokens)) {
    console.error("Invalid tokens format. Expected an array.");
    return;
  }
  
  const parser = new Parser(tokens);
  try {
    const ast = parser.parse();
    console.log("Parsing successful!");
    console.log(JSON.stringify(ast, null, 2));
    return ast;
  } catch (error) {
    console.error("Parsing error:", error.message);
    return null;
  }
}
