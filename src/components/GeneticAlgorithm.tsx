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

const GeneticAlgorithm: React.FC<GeneticAlgorithmProps> = ({ fileData, problem }) => {
  const [assignmentResult, setAssignmentResult] = useState<AssignmentResult | null>(null);
  const [ilpResult, setIlpResult] = useState<ILPSolution | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const options = useMemo(
    () => ({
      populationSize: 200,
      generations: 800,
      crossoverRate: 0.85,
      mutationRate: 0.2,
      elitism: 8,
      tournamentSize: 4,
      localSearchSwaps: 15,
      penaltyWeight: 1000,
    }),
    []
  );

  const handleRunAlgorithm = () => {
    setError(null);
    setAssignmentResult(null);
    setIlpResult(null);

    if (fileData && fileData.length > 0) {
      const matrix = fileData.map((row) => row.map((v) => Number(v)));
      const n = matrix.length;
      const isSquare = matrix.every((row) => row.length === n);

      if (!isSquare) {
        setError("A matriz precisa ser quadrada (n x n) para o GA de atribuição.");
        return;
      }

      setRunning(true);
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
      } catch (e: any) {
        setError(e?.message ?? "Erro ao rodar o GA de atribuição.");
      } finally {
        setRunning(false);
      }
      return;
    }

    if (problem) {
      setRunning(true);
      try {
        const result = solveIntegerLinearProgram(problem, options);
        setIlpResult(result);
      } catch (e: any) {
        setError(e?.message ?? "Erro ao rodar o algoritmo.");
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
    <div className="p-4 border rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">GA — Resolução com Algoritmo Genético</h2>
      <div className="text-sm mb-4">
        Problema carregado: <b>{problemInfo}</b>
      </div>

      {error && <div className="mb-3 p-2 border rounded bg-red-50 text-red-700">{error}</div>}

      <button
        className="bg-blue-600 text-white rounded p-2 w-full hover:bg-blue-700 disabled:opacity-60"
        onClick={handleRunAlgorithm}
        disabled={running}
      >
        {running ? "Rodando..." : "Rodar Algoritmo"}
      </button>

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
          <div className="font-semibold text-lg">
            {ilpResult.feasible ? "Solução factível encontrada" : "Melhor solução encontrada (pode ser inviável)"}
          </div>
          <div className="mt-2">
            {problem?.sense === "max" ? "📈 Maximizar" : "📉 Minimizar"}: {ilpResult.bestObjective.toFixed(2)}
          </div>
          <div>Violação total: {ilpResult.bestViolation}</div>
          <div className="text-sm mt-3 break-words">
            {ilpResult.bestSolution.map((value, index) => `x${index + 1}=${value}`).join(", ")}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneticAlgorithm;
