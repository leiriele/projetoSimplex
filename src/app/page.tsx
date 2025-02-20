"use client";

import { useState } from "react";
import GeneticAlgorithm from "@/components/GeneticAlgorithm"; // Importando o componente

export default function Home() {
  const [variables, setVariables] = useState("");
  const [constraints, setConstraints] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    if (!isNaN(Number(variables)) && !isNaN(Number(constraints))) {
      setSubmitted(true);
    } else {
      alert("Por favor, insira números válidos para as variáveis e restrições.");
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-6xl font-bold">SIMPLEX</h1>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <label className="text-lg font-semibold">Quantidade de variáveis de decisão</label>
          <input
            type="number"
            className="border rounded p-2 w-full text-black focus:text-blue-600"
            placeholder="Variáveis de decisão"
            value={variables}
            onChange={(e) => setVariables(e.target.value)}
          />
          <label className="text-lg font-semibold">Quantidade de restrições</label>
          <input
            type="number"
            className="border rounded p-2 w-full text-black focus:text-blue-600"
            placeholder="Quantidade de restrições"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white rounded p-2 w-full hover:bg-blue-700"
            onClick={handleSubmit}
          >
            Continuar
          </button>
        </div>

        {/* Chama o compontente Algoritmo genetico*/}
        {submitted && !isNaN(Number(variables)) && !isNaN(Number(constraints)) && (
          <GeneticAlgorithm variables={parseInt(variables, 10)} constraints={parseInt(constraints, 10)} />
        )}
      </main>
    </div>
  );
}
