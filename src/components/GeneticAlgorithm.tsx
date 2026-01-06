import React, { useMemo, useState } from "react";
import { geneticAssignment } from "./geneticAssignment"; // ajuste o caminho

interface GeneticAlgorithmProps {
  fileData: number[][] | null; // matriz n×n (custos)
}

const GeneticAlgorithm: React.FC<GeneticAlgorithmProps> = ({ fileData }) => {
  const [resultado, setResultado] = useState<{ perm: number[]; cost: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // Parâmetros (ajuste conforme n)
  const options = useMemo(
    () => ({
      populationSize: 300,
      generations: 1500,
      crossoverRate: 0.9,
      mutationRate: 0.2,
      elitism: 10,
      tournamentSize: 4,
      localSearchSwaps: 30,
    }),
    []
  );

  const handleRunAlgorithm = () => {
    setError(null);
    setResultado(null);

    if (!fileData || fileData.length === 0) {
      setError("Nenhum arquivo carregado.");
      return;
    }

    // Sanitiza (remove linhas vazias e converte pra número)
    const matrix = fileData
      .filter((row) => Array.isArray(row) && row.length > 0)
      .map((row) => row.map((v) => Number(v)));

    const n = matrix.length;
    const isSquare = matrix.every((row) => row.length === n);

    if (!isSquare) {
      setError(`A matriz precisa ser quadrada (n×n). Recebi ${n} linhas e larguras diferentes.`);
      return;
    }

    // ⚠️ Proteção simples pro browser
    // (ajuste esse limite conforme a sua máquina)
    if (n > 2000) {
      setError(
        `n=${n} é grande demais para rodar no navegador com matriz completa em memória. ` +
          `Para n muito grande (ex: 10.000), rode no backend/worker e/ou use leitura por blocos.`
      );
      return;
    }

    setRunning(true);
    try {
      const { bestPerm, bestCost } = geneticAssignment(matrix, options);
      setResultado({ perm: bestPerm, cost: bestCost });
    } catch (e: any) {
      setError(e?.message ?? "Erro ao rodar o algoritmo.");
    } finally {
      setRunning(false);
    }
  };

  const nInfo = fileData ? `${fileData.length}×${fileData[0]?.length ?? 0}` : "—";

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">GA — Problema de Atribuição (n variável)</h2>
      <div className="text-sm mb-4">
        Matriz carregada: <b>{nInfo}</b>
      </div>

      {error && <div className="mb-3 p-2 border rounded bg-red-50 text-red-700">{error}</div>}

      <button
        className="bg-blue-600 text-white rounded p-2 w-full hover:bg-blue-700 disabled:opacity-60"
        onClick={handleRunAlgorithm}
        disabled={!fileData || running}
      >
        {running ? "Rodando..." : "Rodar Algoritmo"}
      </button>

      {resultado && (
        <div className="mt-4 p-3 border rounded">
          <div className="font-semibold text-lg">Melhor custo: {resultado.cost}</div>
          <div className="text-sm mt-2 break-words">
            {resultado.perm.map((col, row) => `${row + 1}→${col + 1}`).join(", ")}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneticAlgorithm;
