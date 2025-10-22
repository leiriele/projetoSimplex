// src/utils/fileParser.js

/**
 * Processa o conteúdo de texto de um arquivo CSV ou TXT.
 * Converte o texto em uma matriz de números.
 * @param {string} text - O conteúdo completo do arquivo.
 * @returns {number[][]} Uma matriz (array de arrays) de números, ou null em caso de erro.
 */
export function parseFileContent(text) {
  try {
    const matrix = text
      .trim() // Remove linhas/espaços em branco no início e fim
      .split('\n') // Quebra o texto em um array de linhas
      .map(line => 
        line
          .trim() // Remove espaços em branco de cada linha
          .split(/[\s,]+/) // Quebra a linha por vírgula, espaços ou tabs
          .map(value => parseFloat(value)) // Converte cada valor em número
          .filter(value => !isNaN(value)) // Remove valores que não são números (ex: texto)
      )
      .filter(row => row.length > 0); // Remove linhas que ficaram vazias

    return matrix;

  } catch (error) {
    console.error("Erro no parsing:", error);
    return null;
  }
}
