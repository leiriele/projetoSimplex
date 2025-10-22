// src/app/page.tsx

"use client";

import { useState, ChangeEvent } from "react";
import GeneticAlgorithm from "@/components/GeneticAlgorithm"; 
import { parseFileContent } from "@/utils/fileParser"; 

export default function Home() {
  const [variables, setVariables] = useState("");
  const [constraints, setConstraints] = useState("");
  
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<number[][] | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    setSubmitted(false); 
    setParsedData(null);
    if (file) {
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && typeof e.target.result === 'string') {
          const text = e.target.result;
          const data = parseFileContent(text);

          if (data && data.length > 0) {
            const numVariables = data[0].length; 
            const numConstraints = data.length - 1; 
            if (numVariables > 0 && numConstraints >= 0) {
              setVariables(String(numVariables));
              setConstraints(String(numConstraints));
              setParsedData(data); 
              setSubmitted(true);
            } else {
              alert("O arquivo não parece ter um formato válido (variáveis ou restrições insuficientes).");
            }
          } else {
            alert("Não foi possível processar o arquivo. Verifique o formato.");
          }
        } else {
           alert("Erro ao ler o arquivo como texto.");
        }
      };

      reader.onerror = () => {
        alert("Erro ao ler o arquivo.");
      };

      reader.readAsText(file);

    } 
    else if (Number(variables) > 0 && Number(constraints) >= 0) { // Permite 0 restrições
      setSubmitted(true);
    } else {
      alert("Por favor, insira números válidos (variáveis > 0, restrições >= 0) ou carregue um arquivo.");
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target && e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setVariables("");
      setConstraints("");
    } else {
      setFile(null);
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-6xl font-bold">OptiGen</h1>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          
          <label className="text-lg font-semibold">Carregar arquivo (CSV ou TXT)</label>
          <input
            type="file"
            className="border rounded p-2 w-full text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
            accept=".csv, .txt"
            onChange={handleFileChange}
          />

          <label className="text-lg font-semibold">Ou insira manualmente:</label>
          
          <label className="text-lg font-semibold">Quantidade de variáveis de decisão</label>
          <input
            type="number"
            className="border rounded p-2 w-full text-black focus:text-blue-600"
            placeholder="Variáveis de decisão"
            value={variables}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setVariables(e.target.value)}
            disabled={file !== null} 
            min="1" 
          />
          <label className="text-lg font-semibold">Quantidade de restrições</label>
          <input
            type="number"
            className="border rounded p-2 w-full text-black focus:text-blue-600"
            placeholder="Quantidade de restrições"
            value={constraints}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConstraints(e.target.value)}
            disabled={file !== null}
            min="0" 
          />

          <button
            className="bg-blue-600 text-white rounded p-2 w-full hover:bg-blue-700 mt-2"
            onClick={handleSubmit}
          >
            Continuar
          </button>
        </div>

        {submitted && Number(variables) > 0 && Number(constraints) >= 0 && (
          <GeneticAlgorithm 
            variables={parseInt(variables, 10)} 
            constraints={parseInt(constraints, 10)} 
            fileData={parsedData} 
          />
        )}
      </main>
    </div>
  );
}