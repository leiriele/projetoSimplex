import React, { useState } from "react";
import type { ILPProblem } from "@/components/geneticAssignment";

type DataPreviewCardProps = {
  parsedData: number[][] | null;
  parsedProblem: ILPProblem | null;
};

function formatExpression(coefficients: number[]) {
  return coefficients.map((coefficient, index) => `${coefficient}*x${index + 1}`).join(" + ");
}

export default function DataPreviewCard({ parsedData, parsedProblem }: DataPreviewCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const hasData = Boolean(parsedData || parsedProblem);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-[1.05rem] font-semibold text-slate-900">
        <span className="text-sky-500">◉</span>
        Visualização dos Dados
      </div>

      {!hasData && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Carregue um arquivo ou monte um problema manualmente para visualizar o resumo aqui.
        </div>
      )}

      {parsedData && (
        <div className="space-y-4">
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Função objetivo:</span> problema de atribuição por matriz de custos
          </div>
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Variáveis:</span> {parsedData[0]?.length ?? 0}
          </div>
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Restrições:</span> {parsedData.length}
          </div>
        </div>
      )}

      {parsedProblem && (
        <div className="space-y-4">
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Função objetivo:</span> {parsedProblem.sense} z ={" "}
            {formatExpression(parsedProblem.objective)}
          </div>
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Variáveis:</span> {parsedProblem.n}
          </div>
          <div className="text-sm text-slate-700">
            <span className="font-semibold">Restrições:</span> {parsedProblem.m}
          </div>
        </div>
      )}

      {hasData && (
        <button
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          onClick={() => setDetailsOpen((current) => !current)}
          type="button"
          aria-expanded={detailsOpen}
        >
          <span>{detailsOpen ? "Recolher estrutura" : "Ver estrutura completa"}</span>
          <span className="text-lg leading-none text-slate-500">{detailsOpen ? "-" : "+"}</span>
        </button>
      )}

      {detailsOpen && parsedData && (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Amostra exibida: {Math.min(parsedData.length, 10)} linhas x{" "}
            {Math.min(parsedData[0]?.length ?? 0, 10)} colunas
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="min-w-full text-sm text-slate-700">
              <tbody>
                {parsedData.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-slate-100 last:border-b-0">
                    {row.slice(0, 10).map((value, columnIndex) => (
                      <td key={columnIndex} className="px-4 py-3">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detailsOpen && parsedProblem && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="max-h-80 space-y-2 overflow-auto text-sm text-slate-700">
            {parsedProblem.constraints.map((constraint, index) => (
              <div key={index}>
                R{index + 1}: {formatExpression(constraint.coefficients)} {constraint.sense} {constraint.rhs}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
