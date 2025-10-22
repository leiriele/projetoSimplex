// 1. Importe 'useEffect'
import React, { useState, useEffect } from "react";

interface GeneticAlgorithmProps {
  variables: number;
  constraints: number;
  fileData: number[][] | null;
}

// 2. Receba 'fileData' nas props
const GeneticAlgorithm: React.FC<GeneticAlgorithmProps> = ({ 
  variables, 
  constraints, 
  fileData 
}) => {
  
  // Seus 'useStates' permanecem os mesmos.
  // Eles definem o estado inicial ANTES do useEffect rodar.
  const [coefLinear, setCoefLinear] = useState<number[]>(Array(variables).fill(0));
  const [coefQuadratico, setCoefQuadratico] = useState<number[]>(Array(variables).fill(0));
  const [coefInteracao, setCoefInteracao] = useState<number[][]>(Array(variables).fill(null).map(() => Array(variables).fill(0)));
  const [matrizRestricoes, setMatrizRestricoes] = useState<number[][]>(Array(constraints).fill(null).map(() => Array(variables).fill(0)));
  const [termosIndependentes, setTermosIndependentes] = useState<number[]>(Array(constraints).fill(0));
  const [resultado, setResultado] = useState<[number[], number] | null>(null);

  useEffect(() => {
    
    if (fileData) {
      const objectiveCoeffs = fileData[0] || [];
      setCoefLinear(objectiveCoeffs);
      setCoefQuadratico(Array(variables).fill(0));
      setCoefInteracao(Array(variables).fill(null).map(() => Array(variables).fill(0)));

      const constraintRows = fileData.slice(1);
     
      const newMatrizRestricoes = constraintRows.map(row => 
        row.slice(0, variables) 
      );
      const newTermosIndependentes = constraintRows.map(row => 
        row[row.length - 1] || 0 
      );
      
      setMatrizRestricoes(newMatrizRestricoes);
      setTermosIndependentes(newTermosIndependentes);
      
    } else {
      // MODO MANUAL: Resetar estados com base em 'variables' e 'constraints'
  
      setCoefLinear(Array(variables).fill(0));
      setCoefQuadratico(Array(variables).fill(0));
      setCoefInteracao(Array(variables).fill(null).map(() => Array(variables).fill(0)));
      setMatrizRestricoes(Array(constraints).fill(null).map(() => Array(variables).fill(0)));
      setTermosIndependentes(Array(constraints).fill(0));
    }
    
  }, [variables, constraints, fileData]); 

  
  const handleRunAlgorithm = () => {
    console.log("Rodando Algoritmo Genético com os dados:", {
      coefLinear,
      coefQuadratico,
      coefInteracao,
      matrizRestricoes,
      termosIndependentes,
    });
    //  retomar aqui.
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Configurar Problema</h2>
      
      <h3 className="text-lg font-semibold">Função Objetivo</h3>
      {coefLinear.map((_, i) => (
        <div key={i} className="flex gap-2 mb-2"> {/* Adicionado mb-2 */}
          <input
            type="number"
            className="border rounded p-2 w-24  text-black focus:text-blue-600" // Aumentado w-16 para w-24
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
            className="border rounded p-2 w-24 text-black focus:text-blue-600" // Aumentado w-16 para w-24
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
        <div key={i} className="flex gap-2 items-center mb-2"> {/* Adicionado mb-2 */}
          {row.map((_, j) => (
            <input
              key={j}
              type="number"
              className="border rounded p-2 w-16 text-black focus:text-blue-600"
              placeholder={`x${j + 1}`}
              value={matrizRestricoes[i][j]}
              onChange={(e) => {
                // Criando cópias profundas para evitar mutação
                const newCoef = matrizRestricoes.map(r => [...r]);
                newCoef[i][j] = parseFloat(e.target.value) || 0;
                setMatrizRestricoes(newCoef);
              }}
            />
          ))}
          ≤
          <input
            type="number"
            className="border rounded p-2 w-20 text-black focus:text-blue-600" // Aumentado w-16 para w-20
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
