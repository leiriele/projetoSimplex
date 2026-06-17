// src/app/page.tsx

"use client";

import { useState, ChangeEvent } from "react";
import GeneticAlgorithm from "@/components/GeneticAlgorithm";
import { parseFileContent } from "@/utils/fileParser";
import type { ConstraintSense, ILPProblem } from "@/components/geneticAssignment";

type ObjectiveSense = "max" | "min";

function createStringRow(size: number) {
  return Array.from({ length: size }, () => "");
}

function parseRequiredNumber(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function Home() {
  const [variables, setVariables] = useState("");
  const [constraints, setConstraints] = useState("");
  const [objectiveSense, setObjectiveSense] = useState<ObjectiveSense>("max");
  const [objectiveCoefficients, setObjectiveCoefficients] = useState<string[]>([]);
  const [constraintCoefficients, setConstraintCoefficients] = useState<string[][]>([]);
  const [constraintSenses, setConstraintSenses] = useState<ConstraintSense[]>([]);
  const [constraintRhs, setConstraintRhs] = useState<string[]>([]);
  const [manualFormGenerated, setManualFormGenerated] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<number[][] | null>(null);
  const [parsedProblem, setParsedProblem] = useState<ILPProblem | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function resetLoadedProblem() {
    setSubmitted(false);
    setParsedData(null);
    setParsedProblem(null);
  }

  function handleSubmit() {
    resetLoadedProblem();
    setManualError(null);

    if (!file) {
      setManualError("Selecione um arquivo ou monte um problema manualmente.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target && typeof e.target.result === "string") {
        const text = e.target.result;
        const data = parseFileContent(text);

        if (data && Array.isArray(data) && data.length > 0) {
          const numVariables = data[0].length;
          const numConstraints = data.length;
          if (numVariables > 0 && numConstraints > 0) {
            setVariables(String(numVariables));
            setConstraints(String(numConstraints));
            setParsedData(data);
            setParsedProblem(null);
            setSubmitted(true);
          } else {
            setManualError("O arquivo não parece ter um formato válido.");
          }
        } else if (data && typeof data === "object" && data.type === "ilp") {
          setVariables(String(data.n));
          setConstraints(String(data.m));
          setParsedData(null);
          setParsedProblem(data);
          setSubmitted(true);
        } else {
          setManualError("Não foi possível processar o arquivo. Verifique o formato.");
        }
      } else {
        setManualError("Erro ao ler o arquivo como texto.");
      }
    };

    reader.onerror = () => {
      setManualError("Erro ao ler o arquivo.");
    };

    reader.readAsText(file);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setManualError(null);
      return;
    }

    setFile(null);
  }

  function handleGenerateManualForm() {
    resetLoadedProblem();
    setManualError(null);

    const variableCount = Number(variables);
    const constraintCount = Number(constraints);

    if (!Number.isInteger(variableCount) || variableCount <= 0) {
      setManualError("Informe uma quantidade de variáveis maior que zero.");
      return;
    }

    if (!Number.isInteger(constraintCount) || constraintCount <= 0) {
      setManualError("Informe uma quantidade de restrições maior que zero.");
      return;
    }

    setObjectiveCoefficients(createStringRow(variableCount));
    setConstraintCoefficients(Array.from({ length: constraintCount }, () => createStringRow(variableCount)));
    setConstraintSenses(Array.from({ length: constraintCount }, () => "<="));
    setConstraintRhs(createStringRow(constraintCount));
    setManualFormGenerated(true);
  }

  function updateObjectiveCoefficient(index: number, value: string) {
    setObjectiveCoefficients((current) => current.map((item, i) => (i === index ? value : item)));
  }

  function updateConstraintCoefficient(row: number, column: number, value: string) {
    setConstraintCoefficients((current) =>
      current.map((coefficients, rowIndex) =>
        rowIndex === row
          ? coefficients.map((item, columnIndex) => (columnIndex === column ? value : item))
          : coefficients
      )
    );
  }

  function updateConstraintSense(index: number, value: ConstraintSense) {
    setConstraintSenses((current) => current.map((item, i) => (i === index ? value : item)));
  }

  function updateConstraintRhs(index: number, value: string) {
    setConstraintRhs((current) => current.map((item, i) => (i === index ? value : item)));
  }

  function handleBuildManualProblem() {
    resetLoadedProblem();
    setManualError(null);

    const variableCount = Number(variables);
    const constraintCount = Number(constraints);

    if (!Number.isInteger(variableCount) || variableCount <= 0) {
      setManualError("Informe uma quantidade de variáveis maior que zero.");
      return;
    }

    if (!Number.isInteger(constraintCount) || constraintCount <= 0) {
      setManualError("Informe uma quantidade de restrições maior que zero.");
      return;
    }

    const objective = objectiveCoefficients.map(parseRequiredNumber);
    if (objective.some((value) => value === null)) {
      setManualError("Preencha todos os coeficientes da função objetivo com números válidos.");
      return;
    }

    const parsedConstraints = constraintCoefficients.map((row) => row.map(parseRequiredNumber));
    if (parsedConstraints.some((row) => row.some((value) => value === null))) {
      setManualError("Preencha todos os coeficientes das restrições com números válidos.");
      return;
    }

    const rhsValues = constraintRhs.map(parseRequiredNumber);
    if (rhsValues.some((value) => value === null)) {
      setManualError("Preencha o termo independente b de todas as restrições.");
      return;
    }

    const manualProblem: ILPProblem = {
      type: "ilp",
      n: variableCount,
      m: constraintCount,
      objective: objective as number[],
      sense: objectiveSense,
      constraints: parsedConstraints.map((coefficients, index) => ({
        coefficients: coefficients as number[],
        sense: constraintSenses[index],
        rhs: rhsValues[index] as number,
      })),
    };

    setParsedData(null);
    setParsedProblem(manualProblem);
    setSubmitted(true);
  }

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex w-full max-w-5xl flex-col items-center gap-8 sm:items-start">
        <h1 className="text-6xl font-bold">OptiGen</h1>

        <div className="flex w-full flex-col gap-4">
          <div className="w-full max-w-xl">
            <label className="text-lg font-semibold">Carregar arquivo (CSV ou TXT)</label>
            <input
              type="file"
              className="mt-2 w-full rounded border p-2 text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
              accept=".csv, .txt"
              onChange={handleFileChange}
            />
            <p className="mt-2 text-sm text-slate-600">
              Aceita matriz quadrada de custos ou modelo ILP com objetivo e restrições.
            </p>
            <button
              className="mt-3 w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSubmit}
              disabled={!file}
            >
              Continuar com arquivo
            </button>
          </div>

          <div className="w-full border-t pt-4">
            <div className="text-lg font-semibold">Ou insira manualmente</div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Quantidade de variáveis de decisão
                <input
                  type="number"
                  className="rounded border p-2 text-black focus:text-blue-600"
                  placeholder="Variáveis de decisão"
                  value={variables}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setVariables(e.target.value)}
                  min="1"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium">
                Quantidade de restrições
                <input
                  type="number"
                  className="rounded border p-2 text-black focus:text-blue-600"
                  placeholder="Quantidade de restrições"
                  value={constraints}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setConstraints(e.target.value)}
                  min="1"
                />
              </label>
            </div>

            <button
              className="mt-3 rounded bg-slate-800 px-4 py-2 text-white hover:bg-slate-900"
              onClick={handleGenerateManualForm}
            >
              Gerar formulário
            </button>

            {manualError && (
              <div className="mt-3 rounded border border-red-100 bg-red-50 p-2 text-sm text-red-700">
                {manualError}
              </div>
            )}

            {manualFormGenerated && (
              <div className="mt-5 flex flex-col gap-5">
                <div className="rounded border bg-slate-50 p-4">
                  <div className="mb-3 font-semibold">Função objetivo</div>
                  <div className="mb-3 flex gap-2">
                    <button
                      className={`rounded px-3 py-2 text-sm ${
                        objectiveSense === "max" ? "bg-blue-600 text-white" : "border bg-white"
                      }`}
                      onClick={() => setObjectiveSense("max")}
                      type="button"
                    >
                      Maximizar
                    </button>
                    <button
                      className={`rounded px-3 py-2 text-sm ${
                        objectiveSense === "min" ? "bg-blue-600 text-white" : "border bg-white"
                      }`}
                      onClick={() => setObjectiveSense("min")}
                      type="button"
                    >
                      Minimizar
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {objectiveCoefficients.map((value, index) => (
                      <label key={index} className="flex flex-col gap-1 text-sm">
                        c{index + 1}
                        <input
                          type="number"
                          className="rounded border p-2 text-black"
                          value={value}
                          onChange={(e) => updateObjectiveCoefficient(index, e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded border bg-slate-50 p-4">
                  <div className="mb-3 font-semibold">Restrições</div>
                  <div className="flex flex-col gap-4">
                    {constraintCoefficients.map((row, rowIndex) => (
                      <div key={rowIndex} className="rounded border bg-white p-3">
                        <div className="mb-2 text-sm font-medium">Restrição {rowIndex + 1}</div>
                        <div className="grid items-end gap-2 sm:grid-cols-3 md:grid-cols-6">
                          {row.map((value, columnIndex) => (
                            <label key={columnIndex} className="flex flex-col gap-1 text-sm">
                              a{columnIndex + 1}
                              <input
                                type="number"
                                className="rounded border p-2 text-black"
                                value={value}
                                onChange={(e) =>
                                  updateConstraintCoefficient(rowIndex, columnIndex, e.target.value)
                                }
                              />
                            </label>
                          ))}
                          <label className="flex flex-col gap-1 text-sm">
                            Tipo
                            <select
                              className="rounded border p-2 text-black"
                              value={constraintSenses[rowIndex]}
                              onChange={(e) =>
                                updateConstraintSense(rowIndex, e.target.value as ConstraintSense)
                              }
                            >
                              <option value="<=">{"<="}</option>
                              <option value=">=">{">="}</option>
                              <option value="=">=</option>
                            </select>
                          </label>
                          <label className="flex flex-col gap-1 text-sm">
                            b
                            <input
                              type="number"
                              className="rounded border p-2 text-black"
                              value={constraintRhs[rowIndex]}
                              onChange={(e) => updateConstraintRhs(rowIndex, e.target.value)}
                            />
                          </label>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {row.map((_, index) => `a${index + 1}*x${index + 1}`).join(" + ")}{" "}
                          {constraintSenses[rowIndex]} b
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700"
                  onClick={handleBuildManualProblem}
                >
                  Montar problema
                </button>
              </div>
            )}
          </div>
        </div>

        {submitted && (parsedData || parsedProblem) && (
          <GeneticAlgorithm fileData={parsedData} problem={parsedProblem} />
        )}
      </main>
    </div>
  );
}
