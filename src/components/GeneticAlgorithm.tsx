import React, { useState } from "react";
import {
  AssignmentResult,
  GAOptions,
  ILPProblem,
  ILPSolution,
  geneticAssignment,
  solveIntegerLinearProgram,
} from "./geneticAssignment";
import GAParametersCard from "./GAParametersCard";
import ValidationCard from "./ValidationCard";
import ResultsCard from "./ResultsCard";
import OptimizationProcessCard from "./OptimizationProcessCard";
import GraphVisualizationCard from "./GraphVisualizationCard";

interface GeneticAlgorithmProps {
  fileData: number[][] | null;
  problem?: ILPProblem | null;
}

type EditableGAOptionKey = "populationSize" | "generations" | "mutationRate";
type GAOptionErrors = Partial<Record<EditableGAOptionKey, string>>;

const DEFAULT_GA_OPTIONS: GAOptions = {
  populationSize: 500,
  generations: 3000,
  crossoverRate: 0.85,
  mutationRate: 0.1,
  elitism: 10,
  tournamentSize: 4,
  localSearchSwaps: 15,
  penaltyWeight: 1000,
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

function validateGAOptions(options: GAOptions) {
  const errors: GAOptionErrors = {};

  if (options.populationSize <= 0) {
    errors.populationSize = "Informe um valor maior que 0.";
  }

  if (options.generations <= 0) {
    errors.generations = "Informe um valor maior que 0.";
  }

  if (options.mutationRate < 0 || options.mutationRate > 1) {
    errors.mutationRate = "Use um valor entre 0 e 1.";
  }

  return errors;
}

const GeneticAlgorithm: React.FC<GeneticAlgorithmProps> = ({ fileData, problem }) => {
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null);
  const [ilpResult, setIlpResult] = useState<ILPSolution | null>(null);
  const [ilpLogs, setIlpLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [options, setOptions] = useState<GAOptions>(DEFAULT_GA_OPTIONS);
  const [optionErrors, setOptionErrors] = useState<GAOptionErrors>({});

  const handleOptionChange = (key: EditableGAOptionKey, value: number) => {
    setOptions((current) => {
      const next = { ...current, [key]: value };
      setOptionErrors(validateGAOptions(next));
      return next;
    });
  };

  const handleRestoreDefaults = () => {
    setOptions(DEFAULT_GA_OPTIONS);
    setOptionErrors({});
  };

  const handleRunAlgorithm = async () => {
    setError(null);
    setAssignmentResult(null);
    setIlpResult(null);
    setProcessingTime(null);

    const currentOptionErrors = validateGAOptions(options);
    setOptionErrors(currentOptionErrors);

    if (Object.keys(currentOptionErrors).length > 0) {
      setError("Corrija os parâmetros do algoritmo genético antes de executar.");
      return;
    }

    if (fileData && fileData.length > 0) {
      const matrix = fileData.map((row) => row.map((value) => Number(value)));
      const size = matrix.length;
      const isSquare = matrix.every((row) => row.length === size);

      if (!isSquare) {
        setError("A matriz precisa ser quadrada (n x n) para o GA de atribuição.");
        return;
      }

      setRunning(true);
      await waitForNextPaint();
      const startedAt = performance.now();

      try {
        const result = geneticAssignment(matrix, {
          populationSize: options.populationSize,
          generations: options.generations,
          crossoverRate: options.crossoverRate,
          mutationRate: options.mutationRate,
          elitism: options.elitism,
          tournamentSize: options.tournamentSize,
        });

        setAssignmentResult(result);
        setProcessingTime((performance.now() - startedAt) / 1000);
      } catch (errorValue: unknown) {
        setError(getErrorMessage(errorValue, "Erro ao rodar o GA de atribuição."));
      } finally {
        setRunning(false);
      }

      return;
    }

    if (problem) {
      setRunning(true);
      setIlpLogs([]);
      await waitForNextPaint();
      const startedAt = performance.now();

      try {
        const result = solveIntegerLinearProgram(problem, options);
        setIlpResult(result);
        setIlpLogs(result.logs ?? []);
        setProcessingTime((performance.now() - startedAt) / 1000);
      } catch (errorValue: unknown) {
        setError(getErrorMessage(errorValue, "Erro ao rodar o algoritmo."));
      } finally {
        setRunning(false);
      }

      return;
    }

    setError("Nenhum arquivo ou problema válido foi fornecido.");
  };

  const problemInfo = fileData
    ? `${fileData.length} variáveis, ${fileData[0]?.length ?? 0} colunas`
    : problem
      ? `${problem.n} variáveis, ${problem.m} restrições`
      : "—";

  return (
    <div className="space-y-6">
      <GAParametersCard
        options={options}
        errors={optionErrors}
        onChange={handleOptionChange}
        onRestoreDefaults={handleRestoreDefaults}
      />
      <ValidationCard
        problemInfo={problemInfo}
        error={error}
        running={running}
        processingTime={processingTime}
        onRunAlgorithm={handleRunAlgorithm}
      />
      <OptimizationProcessCard
        running={running}
        processingTime={processingTime}
        ilpLogs={ilpLogs}
        assignmentResult={assignmentResult}
        ilpResult={ilpResult}
        options={options}
      />
      <GraphVisualizationCard assignmentResult={assignmentResult} ilpResult={ilpResult} problem={problem} />
      <ResultsCard
        assignmentResult={assignmentResult}
        ilpResult={ilpResult}
        ilpLogs={ilpLogs}
        problem={problem}
        options={options}
      />
    </div>
  );
};

export default GeneticAlgorithm;
