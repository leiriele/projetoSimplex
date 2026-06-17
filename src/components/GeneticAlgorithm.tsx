import React, { useMemo, useState } from "react";
import {
  geneticAssignment,
  ILPProblem,
  ILPSolution,
  solveIntegerLinearProgram,
  AssignmentResult,
} from "./geneticAssignment";

interface GeneticAlgorithmProps {
  fileData: number[][] | null;
  problem?: ILPProblem | null;
}

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

function formatLinearExpression(coefficients: number[]) {
  return coefficients.map((coefficient, index) => `${coefficient}*x${index + 1}`).join(" + ");
}

const GeneticAlgorithm: React.FC<GeneticAlgorithmProps> = ({ fileData, problem }) => {
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null);
  const [ilpResult, setIlpResult] = useState<ILPSolution | null>(null);
  const [ilpLogs, setIlpLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  const options = useMemo(
    () => ({
      populationSize: 1000,
      generations: 3000,
      crossoverRate: 0.90,
      mutationRate: 0.10,
      elitism: 30,
      tournamentSize: 3,
      localSearchSwaps: 15,
      penaltyWeight: 1000,
    }),
    []
  );

  const handleRunAlgorithm = async () => {
    setError(null);
    setAssignmentResult(null);
    setIlpResult(null);
    setProcessingTime(null);

    if (fileData && fileData.length > 0) {
      const matrix = fileData.map((row) => row.map((v) => Number(v)));
      const n = matrix.length;
      const isSquare = matrix.every((row) => row.length === n);

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
      } catch (e: unknown) {
        setError(getErrorMessage(e, "Erro ao rodar o GA de atribuição."));
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
      } catch (e: unknown) {
        setError(getErrorMessage(e, "Erro ao rodar o algoritmo."));
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

  const repairStatus = options.localSearchSwaps > 0 ? "Reparo ativado" : "Reparo desativado";

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">GA — Resolução com Algoritmo Genético</h2>
      <div className="text-sm mb-4">
        Problema carregado: <b>{problemInfo}</b>
      </div>

      {error && <div className="mb-3 p-2 border rounded bg-red-50 text-red-700">{error}</div>}

      <button
        className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        onClick={handleRunAlgorithm}
        disabled={running}
      >
        {running && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
            aria-hidden="true"
          />
        )}
        {running ? "Processando resultados..." : "Rodar Algoritmo"}
      </button>

      {running && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded border border-blue-100 bg-blue-50 p-2 text-sm text-blue-700">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
            aria-hidden="true"
          />
          Calculando melhor solução, objetivo real e violações...
        </div>
      )}

      {!running && processingTime !== null && (
        <div className="mt-3 rounded border border-emerald-100 bg-emerald-50 p-2 text-center text-sm text-emerald-700">
          Tempo total de processamento: {processingTime.toFixed(2)}s
        </div>
      )}

      {assignmentResult && (
        <div className="mt-4 p-3 border rounded bg-slate-50">
          <div className="font-semibold text-lg">Melhor solução de atribuição</div>
          <div className="mt-2">Custo total: {assignmentResult.bestCost}</div>
          <div className="text-sm mt-3 break-words">
            {assignmentResult.bestPerm.map((col, row) => `Linha ${row + 1} → Coluna ${col + 1}`).join(", ")}
          </div>
        </div>
      )}

      {ilpResult && (
        <div className="mt-4 p-3 border rounded bg-slate-50">
          <div className="font-semibold text-lg">✅ Melhor solução final encontrada pelo GA:</div>
          <div className="mt-2">
            {problem?.sense === "max" ? "📈 Maximizar" : "📉 Minimizar"}: {ilpResult.bestObjective.toFixed(2)}
          </div>
          <div>Violação total: {ilpResult.bestViolation}</div>
          <div className="text-sm mt-3 break-words">
            x = [{ilpResult.bestSolution.map((value, index) => `${value}${index < ilpResult.bestSolution.length - 1 ? ", " : ""}`)}]
          </div>
        </div>
      )}

      {problem && ilpResult && (
        <div className="mt-4 rounded border bg-slate-50 p-3">
          <div className="text-lg font-semibold">Detalhes do cálculo</div>

          <div className="mt-3">
            <div className="font-medium">Função objetivo</div>
            <div className="text-sm break-words">Z = {formatLinearExpression(problem.objective)}</div>
          </div>

          <div className="mt-3">
            <div className="font-medium">Restrições</div>
            <div className="mt-1 flex flex-col gap-1 text-sm">
              {problem.constraints.map((constraint, index) => (
                <div key={index} className="break-words">
                  R{index + 1}: {formatLinearExpression(constraint.coefficients)} {constraint.sense}{" "}
                  {constraint.rhs}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <div className="font-medium">Violação</div>
            <div className="text-sm">
              {"<="}: violação = soma(max(0, Ax - b))
              <br />
              {">="}: violação = soma(max(0, b - Ax))
              <br />
              =: violação = soma(abs(Ax - b))
            </div>
          </div>

          <div className="mt-3">
            <div className="font-medium">Fitness</div>
            <div className="text-sm">
              Maximização: fitness = objetivo - violação * {options.penaltyWeight}
              <br />
              Minimização: fitness = objetivo + violação * {options.penaltyWeight}
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <div>
              <span className="font-medium">Cruzamento:</span> {options.crossoverRate}
            </div>
            <div>
              <span className="font-medium">Mutação:</span> {options.mutationRate}
            </div>
            <div>
              <span className="font-medium">Reparo:</span> {repairStatus}
            </div>
          </div>
        </div>
      )}

      {ilpLogs.length > 0 && (
        <div className="mt-4 p-3 border rounded bg-slate-50">
          <div className="font-semibold text-lg">Console/Log</div>
          <pre className="text-sm whitespace-pre-wrap break-words">{ilpLogs.join("\n")}</pre>
        </div>
      )}
    </div>
  );
};

export default GeneticAlgorithm;
