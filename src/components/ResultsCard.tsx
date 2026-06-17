import React from "react";
import type { AssignmentResult, GAOptions, ILPProblem, ILPSolution } from "@/components/geneticAssignment";

type ResultsCardProps = {
  assignmentResult: AssignmentResult | null;
  ilpResult: ILPSolution | null;
  ilpLogs: string[];
  problem?: ILPProblem | null;
  options: GAOptions;
};

function formatLinearExpression(coefficients: number[]) {
  return coefficients.map((coefficient, index) => `${coefficient}*x${index + 1}`).join(" + ");
}

export default function ResultsCard({
  assignmentResult,
  ilpResult,
  ilpLogs,
  problem,
  options,
}: ResultsCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 text-[1.05rem] font-semibold text-slate-900">Resultados</div>

      {!assignmentResult && !ilpResult && ilpLogs.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Os resultados serão exibidos aqui após a execução.
        </div>
      )}

      <div className="space-y-4">
        {assignmentResult && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-lg font-semibold text-slate-900">Melhor solução de atribuição</div>
            <div className="mt-2 text-sm text-slate-700">Custo total: {assignmentResult.bestCost}</div>
            <div className="mt-3 text-sm text-slate-700">
              {assignmentResult.bestPerm.map((col, row) => `Linha ${row + 1} -> Coluna ${col + 1}`).join(", ")}
            </div>
          </div>
        )}

        {ilpResult && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-lg font-semibold text-slate-900">Melhor solução final encontrada pelo GA</div>
            <div className="mt-2 text-sm text-slate-700">
              {problem?.sense === "max" ? "Maximizar" : "Minimizar"}: {ilpResult.bestObjective.toFixed(2)}
            </div>
            <div className="mt-1 text-sm text-slate-700">Violação total: {ilpResult.bestViolation}</div>
            <div className="mt-3 break-words text-sm text-slate-700">x = [{ilpResult.bestSolution.join(", ")}]</div>
          </div>
        )}

        {problem && ilpResult && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-lg font-semibold text-slate-900">Detalhes do cálculo</div>

            <div className="mt-4">
              <div className="font-medium text-slate-900">Função objetivo</div>
              <div className="mt-1 text-sm text-slate-700">Z = {formatLinearExpression(problem.objective)}</div>
            </div>

            <div className="mt-4">
              <div className="font-medium text-slate-900">Restrições</div>
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                {problem.constraints.map((constraint, index) => (
                  <div key={index}>
                    R{index + 1}: {formatLinearExpression(constraint.coefficients)} {constraint.sense} {constraint.rhs}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-4 text-sm text-slate-700">
                <div className="font-medium text-slate-900">Violação</div>
                <div className="mt-2">
                  {"<="}: soma(max(0, Ax - b))
                  <br />
                  {">="}: soma(max(0, b - Ax))
                  <br />
                  =: soma(abs(Ax - b))
                </div>
              </div>

              <div className="rounded-xl bg-white p-4 text-sm text-slate-700">
                <div className="font-medium text-slate-900">Fitness</div>
                <div className="mt-2">
                  Maximização: objetivo - violação * {options.penaltyWeight}
                  <br />
                  Minimização: objetivo + violação * {options.penaltyWeight}
                </div>
              </div>
            </div>
          </div>
        )}

        {ilpLogs.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
            <div className="font-semibold">Console / Log</div>
            <pre className="mt-3 whitespace-pre-wrap break-words text-sm">{ilpLogs.join("\n")}</pre>
          </div>
        )}
      </div>
    </section>
  );
}
