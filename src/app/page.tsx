// src/app/page.tsx

"use client";

import { ChangeEvent, useState } from "react";
import GeneticAlgorithm from "@/components/GeneticAlgorithm";
import UploadCard from "@/components/UploadCard";
import DataPreviewCard from "@/components/DataPreviewCard";
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

    reader.onload = (event: ProgressEvent<FileReader>) => {
      if (event.target && typeof event.target.result === "string") {
        const text = event.target.result;
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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files?.[0]) {
      setFile(event.target.files[0]);
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
    setObjectiveCoefficients((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
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
    setConstraintSenses((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function updateConstraintRhs(index: number, value: string) {
    setConstraintRhs((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
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
    <div className="min-h-screen bg-[#f8fafc] px-4 py-8">
      <main className="mx-auto w-full max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Otimização de Problemas de Programação Linear Inteira
          </h1>
          <p className="mt-3 text-base text-slate-600 sm:text-lg">
            Upload, análise e visualização gráfica de soluções
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <UploadCard
            file={file}
            variables={variables}
            constraints={constraints}
            objectiveSense={objectiveSense}
            objectiveCoefficients={objectiveCoefficients}
            constraintCoefficients={constraintCoefficients}
            constraintSenses={constraintSenses}
            constraintRhs={constraintRhs}
            manualFormGenerated={manualFormGenerated}
            manualError={manualError}
            onFileChange={handleFileChange}
            onSubmitFile={handleSubmit}
            onVariablesChange={setVariables}
            onConstraintsChange={setConstraints}
            onGenerateManualForm={handleGenerateManualForm}
            onObjectiveSenseChange={setObjectiveSense}
            onObjectiveCoefficientChange={updateObjectiveCoefficient}
            onConstraintCoefficientChange={updateConstraintCoefficient}
            onConstraintSenseChange={updateConstraintSense}
            onConstraintRhsChange={updateConstraintRhs}
            onBuildManualProblem={handleBuildManualProblem}
          />

          <DataPreviewCard parsedData={parsedData} parsedProblem={parsedProblem} />
        </div>

        {submitted && (parsedData || parsedProblem) && (
          <div className="mt-6">
            <GeneticAlgorithm fileData={parsedData} problem={parsedProblem} />
          </div>
        )}
      </main>
    </div>
  );
}
