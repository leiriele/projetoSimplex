import React from "react";

type ValidationCardProps = {
  problemInfo: string;
  error: string | null;
  running: boolean;
  processingTime: number | null;
  onRunAlgorithm: () => void;
};

export default function ValidationCard({
  problemInfo,
  error,
  running,
  processingTime,
  onRunAlgorithm,
}: ValidationCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-[1.05rem] font-semibold text-slate-900">Validação e Execução</div>
          <div className="mt-1 text-sm text-slate-600">Problema carregado: {problemInfo}</div>
        </div>
      </div>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
        onClick={onRunAlgorithm}
        disabled={running}
        type="button"
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
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Calculando melhor solução, objetivo real e violações...
        </div>
      )}

      {!running && processingTime !== null && (
        <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Tempo total de processamento: {processingTime.toFixed(2)}s
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </section>
  );
}
