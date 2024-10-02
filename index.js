/**
 * Se creara un Analizador Lexico que pueda reconocer los tokens del lenguaje de programacion Java, ademas se podra
 * ver que tokens puede identitifica, el analisis completo y descargar los resultados como un pdf
 **/

// 1. Se crea un array de objetos que almacenara el nombre de cada token y su expresion regular correspondiente a la gramatica del lenguaje
// la variable tokens -> contiene el nombre y la expresion regular
const tokens = [
  {
    type: "RESERVADAS",
    regex:
      /^(public|class|static|void|int|String|System.out.println|args|double|main|if|while|for|else|def|package|import|java)/,
  },
  { type: "CADENA", regex: /^('[^']*'|"[^"]*")/ },
  { type: "NUMERO", regex: /^\d+/ },
  { type: "PAQUETE", regex: /^[a-zA-Z]+(\.[a-zA-Z0-9_]+)+/ },
  { type: "IDENTIFICADOR", regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
  { type: "COMENTARIO", regex: /^\/\/[^\n]*/, ignore: true },
  { type: "OPERADOR", regex: /^[+\-*\/\=]/ },
  { type: "PARENTESIS", regex: /^[()]/ },
  { type: "LLAVES", regex: /^[{}]/ },
  { type: "PUNTOYCOMA", regex: /^;/ },
  { type: "CORCHETES", regex: /^[\[\]]/ },
  { type: "COMA", regex: /^,/ },
  { type: "ESPACIO", regex: /^[ \t]+/, ignore: true },
  { type: "SALTO", regex: /^\n/, ignore: true },
  { type: "COMPARACION", regex: /^==|^!=|^<=|^>=|^>|^</ },
];

// 2. Se crea una funcion que recibe un string que es el codigo fuente y retorna un array de tokens reconocidos y arroja un alert en caso haya un token que no se haya reconocido, todo mediante una funcion misma de javascript match que te permite buscar una expresion regular en un string y retorna un array con los resultados en este caso solo se busca el primer match y se almacena en un array de objetos con el tipo de token, el valor del token, la linea y el indice, en este caso se ignora los espacios y saltos de linea
const lex = (input) => {
  const tokensReconocidos = []; // array de tokens reconocidos que se van a retornar
  let numLineas = 1; // variable que almacena el numero de lineas en la que se encuentra cada token
  let positionRecorrido = 0; // variable que almacena la posicion en la que se encuentra el recorrido

  while (positionRecorrido < input.length) {
    let match = null; // variable que almacena el match de la expresion regular
    for (const token of tokens) {
      match = input.slice(positionRecorrido).match(token.regex);
      if (match) {
        if (match[0].includes("\n")) {
          numLineas += (match[0].match(/\n/g) || []).length;
        }
        if (!token.ignore) {
          tokensReconocidos.push({
            type: token.type,
            value: match[0],
            line: numLineas,
            indice: positionRecorrido,
          });
        }
        positionRecorrido += match[0].length;
        break;
      }
    }

    if (!match) {
      alert(
        `Caracter desconocido: ${input[positionRecorrido]} en la posicion ${positionRecorrido}`
      );
      return;
    }
  }
  localStorage.setItem("tokensReconocidos", JSON.stringify(tokensReconocidos));
  return tokensReconocidos;
};

// 3. Esta funcion es parte de la interfaz grafica, se encarga de obtener el valor del textarea y ejecutar la funcion lex, ademas de mostrar los resultados en una tabla en el html
const analizar = () => {
  const input = document.getElementById("input").value; // obtener el valor del textarea
  const tokensReconocidos = lex(input); // ejecutar la funcion lex
  const output = document.getElementById("output"); // obtener el elemento donde se mostraran los resultados
  output.innerHTML = "<tr>";
  tokensReconocidos.forEach((token) => {
    if (token.type === "SALTO") return;
    output.innerHTML += `<td>${token.type}</td><td>${token.value}</td>`;
  });
  output.innerHTML += "</tr>";
  verAnalisisDetallado(tokensReconocidos);
};

// 4. Funcion que se encarga de limpiar el textarea y la tabla de resultados
const reset = () => {
  document.getElementById("input").value = "";
  document.getElementById("output").innerHTML = "";
  document.getElementById("analisisDetallado").innerHTML = "";
};

// 5. Funcion que se encarga de descargar los resultados en un archivo pdf, se crea un string con el contenido que se desea que aparezca, se verifica si jsPDF esta disponible, se crea un documento pdf y se agrega el string al pdf, se obtienen los datos de la tabla y se agrega la tabla al pdf y se descarga con el boton asociado a esta funcion
const downloadFile = () => {
  // si no hay contenido no se descarga nada
  if (document.getElementById("output").innerText === "") {
    alert("No se pude descargar si no hay resultados");
    return;
  }

  const string = `Codigo:\n${
    document.getElementById("input").value
  }\n\nResultados Tokens y Lexema\n ${
    document.getElementById("output").innerText
  }`; // string que se va a agregar al pdf

  if (window.jspdf) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text(string, 10, 10);

    // Obtener los datos de la tabla
    const tableData = [];
    const rows = document.querySelectorAll("#output tr");

    for (const row of rows) {
      const rowData = [];
      for(const cell of row.querySelectorAll("td, th")) {
        rowData.push(cell.innerText);
      }
      tableData.push(rowData);
    }

    doc.autoTable({
      head: [tableData[0]], 
      body: tableData.slice(1),
      startY: 20, 
    });

    doc.save("codigoResultados.pdf");
  } else {
    console.error("jsPDF no está disponible");
  }
};


// 6. Funcion que se encarga de mostrar un analisis detallado de los tokens reconocidos en una tabla en el html, este incluye el tipo de token, el lexema, la fila y el indice
const verAnalisisDetallado = (tokensReconocidos) => {
  const analisisDetallado = document.getElementById("analisisDetallado"); // obtener el elemento donde se mostrara la tabla
  analisisDetallado.innerHTML =
    "<thead><tr><th>Token</th><th>Lexema</th><th>Fila</th><th>Indice</th></tr></thead><tr>";
  tokensReconocidos.forEach((token) => {
    if (token.type === "SALTO") return;
    analisisDetallado.innerHTML += `<td>${token.type}</td><td>${token.value}</td><td>${token.line}</td><td>${token.indice}</td>`;
  });
  analisisDetallado.innerHTML += "</tr>";
};

// 7. Funcion que se encarga de mostrar el diccionario de tokens en una tabla en el html
const verDiccionarioTokens = () => {
  const diccionario = document.getElementById("diccionario"); // obtener el elemento donde se mostrara la tabla
  diccionario.innerHTML = "<tr><th>Token</th><th>Expresion Regular</th></tr>";
  tokens.forEach((token) => {
    diccionario.innerHTML += `<tr><td>${token.type}</td><td class="text-break">${token.regex}</td></tr>`;
  });
};

// 8. Se llama a la funcion que muestra el diccionario de tokens
verDiccionarioTokens();

/**
 * El resultado del programa es un analizador lexico que puede reconocer los tokens del lenguaje de programacion Java segun las expresiones regulares indicadas, ademas que se crearon funciones para manipular la interfaz grafica y los formularios
 */