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
    if (lines.length < 3) {
      return null;
    }

    const numVariables = parseInt(lines[0], 10);
    const numConstraints = parseInt(lines[1], 10);
    if (!Number.isInteger(numVariables) || numVariables <= 0) {
      return null;
    }
    if (!Number.isInteger(numConstraints) || numConstraints < 0) {
      return null;
    }
    if (lines.length < 3 + numConstraints) {
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

    const objective = parseObjectiveLine(lines[2]);
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
      const parsed = parseConstraintLine(lines[3 + i], numVariables);
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

  return matrix;
}
