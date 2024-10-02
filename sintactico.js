function obtenerTokens() {
	const tokens = localStorage.getItem("tokensReconocidos");
	return tokens;
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
* sentencia = 'while' '(' expresion ')' '{' (sentencia)* '}'
* sentencia = 'for' '(' (declaracion|expresion) ';' expresion ';' expresion ')' '{' (sentencia)* '}'
* sentencia = tipo identificador (camelCase) '=' expresion ';'
* sentencia = identificador (camelCase) '=' expresion ';'
* declaracion = tipo identificador (camelCase)
* tipo = 'int' | 'double' | 'String'
* expresion = numero | identificador (camelCase) | expresion operador_aritmetico expresion
* operador_aritmetico = '+' | '-' | '*' | '/' | '==' | '!=' | '<=' | '>=' | '<' | '>'
 * 
 */

const parse = (tokens) => {
  

}