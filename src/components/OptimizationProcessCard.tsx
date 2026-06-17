import React from "react";
import type { AssignmentResult, GAOptions, ILPSolution } from "@/components/geneticAssignment";

type OptimizationProcessCardProps = {
  running: boolean;
  processingTime: number | null;
  ilpLogs: string[];
  assignmentResult: AssignmentResult | null;
  ilpResult: ILPSolution | null;
  options: GAOptions;
};

function extractFitnessSeries(logs: string[]) {
  return logs
    .map((log, index) => {
      const fitnessMatch = log.match(/Fitness = (-?\d+(?:\.\d+)?)/);
      const objectiveMatch = log.match(/Objetivo real = (-?\d+(?:\.\d+)?)/);
      const value = Number(fitnessMatch?.[1] ?? objectiveMatch?.[1]);

      return Number.isFinite(value) ? { label: `Geração ${index + 1}`, value } : null;
    })
    .filter((item): item is { label: string; value: number } => item !== null);
}

function buildLinePoints(values: number[], width: number, height: number) {
  if (values.length === 0) {
    return "";
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export default function OptimizationProcessCard({
  running,
  processingTime,
  ilpLogs,
  assignmentResult,
  ilpResult,
  options,
}: OptimizationProcessCardProps) {
  const series = extractFitnessSeries(ilpLogs);
  const hasResult = Boolean(assignmentResult || ilpResult);
  const progress = running ? 40 : hasResult ? 100 : 0;
  const points = buildLinePoints(series.map((item) => item.value), 1000, 320);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-[1.05rem] font-semibold text-slate-900">
        <span className="text-emerald-600">▶</span>
        Processo de Otimização
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-600">
          {running
            ? "O algoritmo está executando com os parâmetros atuais."
            : hasResult
              ? "Processamento concluído para a última execução."
              : "Aguardando execução do algoritmo."}
        </div>
        <div className="text-sm font-medium text-slate-700">
          {processingTime !== null ? `Tempo: ${processingTime.toFixed(2)}s` : `${options.generations} gerações`}
        </div>
      </div>

      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
        <div
          className="flex h-full items-center justify-center bg-blue-600 text-[11px] font-semibold text-white transition-all"
          style={{ width: `${progress}%` }}
        >
          {progress > 0 ? `${progress}%` : ""}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 text-center text-sm text-slate-600">Fitness médio</div>
        <div className="h-80 w-full">
          {points ? (
            <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 320" preserveAspectRatio="none">
              {Array.from({ length: 6 }).map((_, index) => {
                const y = (index / 5) * 320;
                return <line key={index} x1="0" x2="1000" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
              })}
              {Array.from({ length: 8 }).map((_, index) => {
                const x = (index / 7) * 1000;
                return <line key={index} x1={x} x2={x} y1="0" y2="320" stroke="#e2e8f0" strokeWidth="1" />;
              })}
              <polyline fill="none" points={points} stroke="#2563eb" strokeWidth="4" vectorEffect="non-scaling-stroke" />
              {points.split(" ").map((point, index) => {
                const [cx, cy] = point.split(",");
                return <circle key={index} cx={cx} cy={cy} r="5" fill="#93c5fd" stroke="#2563eb" strokeWidth="2" />;
              })}
            </svg>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
              O gráfico de evolução será exibido quando houver logs de gerações.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
