"use client";

import { useState } from "react";

export default function Home() {
  const [variables, setVariables] = useState("");
  const [constraints, setConstraints] = useState("");

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
          <button className="bg-blue-600 text-white rounded p-2 w-full hover:bg-blue-700">
            Continuar
          </button>
        </div>
      </main>
      
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Docs
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
