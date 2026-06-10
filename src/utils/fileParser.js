// src/utils/fileParser.js

export function parseFileContent(text) {
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (lines.length === 0) {
    return null;
  }

  const parseNumbers = (text) =>
    text
      .trim()
      .replace(/^['"]|['"]$/g, "")
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map((value) => parseFloat(value))
      .filter((value) => !Number.isNaN(value));

  const parseILP = () => {
    let startIndex = 0;
    if (lines[0].trim().toLowerCase() === "ilp") {
      startIndex = 1;
    }

    if (lines.length < startIndex + 3) {
      return null;
    }

    const numVariables = parseInt(lines[startIndex], 10);
    const numConstraints = parseInt(lines[startIndex + 1], 10);
    if (!Number.isInteger(numVariables) || numVariables <= 0) {
      return null;
    }
    if (!Number.isInteger(numConstraints) || numConstraints < 0) {
      return null;
    }
    if (lines.length < startIndex + 3 + numConstraints) {
      return null;
    }

    const parseObjectiveLine = (line) => {
      const normalized = line.trim().toLowerCase();
      let sense = "min";
      let body = line;

      if (normalized.startsWith("min:") || normalized.startsWith("min ")) {
        body = line.slice(line.indexOf(":") + 1).trim();
      } else if (normalized.startsWith("max:") || normalized.startsWith("max ")) {
        sense = "max";
        body = line.slice(line.indexOf(":") + 1).trim();
      }

      return {
        sense,
        coefficients: parseNumbers(body),
      };
    };

    const objective = parseObjectiveLine(lines[startIndex + 2]);
    if (objective.coefficients.length !== numVariables) {
      return null;
    }

    const parseConstraintLine = (line, expectedLength) => {
      const relationMatch = line.match(/(<=|>=|=)/);
      if (relationMatch) {
        const relation = relationMatch[1];
        const parts = line.split(relation);
        const left = parts[0].trim();
        const right = parts.slice(1).join(relation).trim();
        const coefficients = parseNumbers(left);
        const rhsValues = parseNumbers(right);
        if (coefficients.length !== expectedLength || rhsValues.length !== 1) {
          return null;
        }
        return {
          coefficients,
          sense: relation,
          rhs: rhsValues[0],
        };
      }

      const values = parseNumbers(line);
      if (values.length === expectedLength + 1) {
        return {
          coefficients: values.slice(0, expectedLength),
          sense: "<=",
          rhs: values[expectedLength],
        };
      }
      return null;
    };

    const constraints = [];
    for (let i = 0; i < numConstraints; i += 1) {
      const parsed = parseConstraintLine(lines[startIndex + 3 + i], numVariables);
      if (!parsed) {
        return null;
      }
      constraints.push(parsed);
    }

    return {
      type: "ilp",
      n: numVariables,
      m: numConstraints,
      objective: objective.coefficients,
      sense: objective.sense,
      constraints,
    };
  };

  const ilpResult = parseILP();
  if (ilpResult) {
    return ilpResult;
  }

  const matrix = lines
    .map((line) => parseNumbers(line))
    .filter((row) => row.length > 0);

  if (matrix.length === 0) {
    return null;
  }

  // Tenta converter matriz simples em um ILP de maximização
  if (matrix.length > 1) {
    // Verifica se é um problema de atribuição (matriz quadrada) ou LP com restrições
    let numVars = matrix[0].length;
    let objectiveCoeffs = matrix[0];
    let hasRHS = numVars > 0 && matrix.slice(1).every((row) => row.length === numVars + 1);

    if (!hasRHS && matrix[0].length > 1) {
      const numVarsWithObjectiveDummy = matrix[0].length - 1;
      const hasObjectiveDummy =
        matrix.slice(1).every((row) => row.length === numVarsWithObjectiveDummy + 1);

      if (hasObjectiveDummy) {
        numVars = numVarsWithObjectiveDummy;
        objectiveCoeffs = matrix[0].slice(0, numVars);
        hasRHS = true;
      }
    }

    if (hasRHS && matrix.length > 1) {
      // Formato: primeira linha = objetivo, demais = restrições com RHS
      const constraints = [];
      
      for (let i = 1; i < matrix.length; i++) {
        const row = matrix[i];
        constraints.push({
          coefficients: row.slice(0, numVars),
          sense: "<=",
          rhs: row[numVars],
        });
      }

      return {
        type: "ilp",
        n: numVars,
        m: constraints.length,
        objective: objectiveCoeffs,
        sense: "max", // Maximiza por padrão
        constraints,
      };
    }
  }

  return matrix;
}
