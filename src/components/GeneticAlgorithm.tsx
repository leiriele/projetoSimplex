import React, { useState } from "react";

interface GeneticAlgorithmProps {
  variables: number;
  constraints: number;
}

const GeneticAlgorithm: React.FC<GeneticAlgorithmProps> = ({ variables, constraints }) => {
  const [coefLinear, setCoefLinear] = useState<number[]>(Array(variables).fill(0));
  const [coefQuadratico, setCoefQuadratico] = useState<number[]>(Array(variables).fill(0));
  const [coefInteracao, setCoefInteracao] = useState<number[][]>(
    Array(variables).fill(null).map(() => Array(variables).fill(0))
  );
  const [matrizRestricoes, setMatrizRestricoes] = useState<number[][]>(
    Array(constraints).fill(null).map(() => Array(variables).fill(0))
  );
  const [termosIndependentes, setTermosIndependentes] = useState<number[]>(Array(constraints).fill(0));
  const [resultado, setResultado] = useState<[number[], number] | null>(null);

  const handleRunAlgorithm = () => {
    //ALGORITMO GENÉTICO aqui
    console.log("Rodando Algoritmo Genético com os dados:", {
      coefLinear,
      coefQuadratico,
      coefInteracao,
      matrizRestricoes,
      termosIndependentes,
    });
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Configurar Problema</h2>
      
      <h3 className="text-lg font-semibold">Função Objetivo</h3>
      {coefLinear.map((_, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="number"
            className="border rounded p-2 w-16  text-black focus:text-blue-600"
            placeholder={`Linear x${i + 1}`}
            value={coefLinear[i]}
            onChange={(e) => {
              const newCoef = [...coefLinear];
              newCoef[i] = parseFloat(e.target.value) || 0;
              setCoefLinear(newCoef);
            }}
          />
          <input
            type="number"
            className="border rounded p-2 w-16 text-black focus:text-blue-600"
            placeholder={`Quadrático x${i + 1}`}
            value={coefQuadratico[i]}
            onChange={(e) => {
              const newCoef = [...coefQuadratico];
              newCoef[i] = parseFloat(e.target.value) || 0;
              setCoefQuadratico(newCoef);
            }}
          />
        </div>
      ))}
      
      
      <h3 className="text-lg font-semibold mt-4">Restrições</h3>
      {matrizRestricoes.map((row, i) => (
        <div key={i} className="flex gap-2 items-center">
          {row.map((_, j) => (
            <input
              key={j}
              type="number"
              className="border rounded p-2 w-16 text-black focus:text-blue-600"
              placeholder={`x${j + 1}`}
              value={matrizRestricoes[i][j]}
              onChange={(e) => {
                const newCoef = matrizRestricoes.map(row => [...row]);
                newCoef[i][j] = parseFloat(e.target.value) || 0;
                setMatrizRestricoes(newCoef);
              }}
            />
          ))}
          ≤
          <input
            type="number"
            className="border rounded p-2 w-16 text-black focus:text-blue-600"
            placeholder="B"
            value={termosIndependentes[i]}
            onChange={(e) => {
              const newTermos = [...termosIndependentes];
              newTermos[i] = parseFloat(e.target.value) || 0;
              setTermosIndependentes(newTermos);
            }}
          />
        </div>
      ))}
      
      <button
        className="bg-blue-600 text-white rounded p-2 w-full hover:bg-blue-700 mt-4"
        onClick={handleRunAlgorithm}
      >
        Rodar Algoritmo
      </button>
    </div>
  );
};

export default GeneticAlgorithm;
