/**
 * Se creara un Analizador Lexico que pueda reconocer los tokens del
 * lenguaje de programacion Java
 **/
// 1. Se crea un array de objetos que almacenara el nombre de cada token y su expresion regular correspondiente a la gramatica del lenguaje
const tokens = [
  {
    type: "RESERVADAS",
    regex:
      /^(public|class|static|void|int|String|System.out.println|args|double|main|if|while|for|else|def)/,
  },
  { type: "CADENA", regex: /^('[^']*'|"[^"]*")/ },
  { type: "NUMERO", regex: /^\d+/ },
  { type: "IDENTIFICADOR", regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
  { type: "OPERADOR", regex: /^[+\-*\/=]/ },
  { type: "PARENTESIS", regex: /^[()]/ },
  { type: "LLAVES", regex: /^[{}]/ },
  { type: "PUNTOYCOMA", regex: /^;/ },
  { type: "CORCHETES", regex: /^[\[\]]/ },
  { type: "COMA", regex: /^,/ },
  { type: "ESPACIO", regex: /^\s/, ignore: true },
  { type: "COMENTARIO", regex: /^\/\// },
  { type: "COMPARACION", regex: /^==|^!=|^<=|^>=|^>|^</ },
];

// 2. Se crea una funcion que recibe un string que es el codigo fuente y retorna un array de tokens reconocidos y datos adicionales como si hay tokens no reconocidos
const lex = (input) => {
  let tokensReconocidos = [];
  let numLineas = 1;
  let positionRecorrido = 0;

  while (positionRecorrido < input.length) {
    let match = null; // match sera nulo hasta que almacene una coincidencia
    // recorrer los tokens
    for (let token of tokens) {
      // verificar si desde la posicion actual del recorrido del input hay una coincidencia con la expresion regular del token
      // match te arroja la primera coindicencia que encuentre
      match = input.slice(positionRecorrido).match(token.regex);
      if (match) {
        // si el token no es un espacio
        if (!token.ignore) {
          // si hay coincidencia se agrega al array de tokens reconocidos
          tokensReconocidos.push({
            type: token.type,
            value: match[0],
            line: numLineas,
          });

          if (match[0].includes("\n")) {
            numLineas++;
          }
        }
        console.log(match[0]);
        // se actualiza la posicion de recorrido para posicionarse luego de la coincidencia
        positionRecorrido += match[0].length;
        // si se encontro no es necesario seguir recorriendo los tokens
        break;
      }
    }
    // si no hay coincidencia se agrega un mensaje de error vivisble en la consola
    if (!match) {
      throw new Error(`Caracter desconocido: ${input[positionRecorrido]} en la posicion ${positionRecorrido}`);
    
    }
  }
  return tokensReconocidos;
};

// no pueden haber 2 identificadores juntos sin una coma

const analizar = () => {
  const input = document.getElementById("input").value;
  const tokensReconocidos = lex(input);
  const output = document.getElementById("output");
  output.innerHTML = "<tr>";
  tokensReconocidos.forEach((token) => {
    output.innerHTML += `<td>${token.type}</td><td>${token.value}</td>`;
  });
  output.innerHTML += "</tr>";
}

const reset = () => {
  document.getElementById("input").value = "";
  document.getElementById("output").innerHTML = "";
}

const downloadFile = () => {
  const blob = new Blob([document.getElementById("input").value], { type: "text/plain" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = "codigoResultados.txt";
  link.href = url;
  link.click();
}