import React from "react";
import type { AssignmentResult, ILPProblem, ILPSolution } from "@/components/geneticAssignment";

type GraphVisualizationCardProps = {
  assignmentResult: AssignmentResult | null;
  ilpResult: ILPSolution | null;
  problem?: ILPProblem | null;
};

function buildBars(assignmentResult: AssignmentResult | null, ilpResult: ILPSolution | null) {
  if (ilpResult) {
    return ilpResult.bestSolution.map((value, index) => ({
      label: `x${index + 1}`,
      value,
    }));
  }

  if (assignmentResult) {
    return assignmentResult.bestPerm.map((column, index) => ({
      label: `L${index + 1}`,
      value: column + 1,
    }));
  }

  return [];
}

export default function GraphVisualizationCard({
  assignmentResult,
  ilpResult,
  problem,
}: GraphVisualizationCardProps) {
  const bars = buildBars(assignmentResult, ilpResult);
  const max = Math.max(1, ...bars.map((bar) => Math.abs(bar.value)));
  const hasResult = bars.length > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-[1.05rem] font-semibold text-slate-900">
        <span className="text-blue-600">⌁</span>
        Visualização Gráfica
      </div>

      {!hasResult && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Execute o algoritmo para visualizar a solução em formato gráfico.
        </div>
      )}

      {hasResult && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {ilpResult
              ? `${problem?.sense === "max" ? "Maximização" : "Minimização"} com valor objetivo ${ilpResult.bestObjective.toFixed(2)}`
              : `Atribuição com custo total ${assignmentResult?.bestCost}`}
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex h-72 items-end gap-3 overflow-x-auto">
              {bars.map((bar) => {
                const height = Math.max(8, (Math.abs(bar.value) / max) * 220);

                return (
                  <div key={bar.label} className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2">
                    <div className="text-xs font-medium text-slate-600">{bar.value}</div>
                    <div
                      className="w-full rounded-t bg-blue-500"
                      style={{ height: `${height}px` }}
                      aria-label={`${bar.label}: ${bar.value}`}
                    />
                    <div className="text-xs text-slate-500">{bar.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
