import React, { ChangeEvent, useState } from "react";
import type { ConstraintSense } from "@/components/geneticAssignment";

type UploadCardProps = {
  file: File | null;
  variables: string;
  constraints: string;
  objectiveSense: "max" | "min";
  objectiveCoefficients: string[];
  constraintCoefficients: string[][];
  constraintSenses: ConstraintSense[];
  constraintRhs: string[];
  manualFormGenerated: boolean;
  manualError: string | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmitFile: () => void;
  onVariablesChange: (value: string) => void;
  onConstraintsChange: (value: string) => void;
  onGenerateManualForm: () => void;
  onObjectiveSenseChange: (value: "max" | "min") => void;
  onObjectiveCoefficientChange: (index: number, value: string) => void;
  onConstraintCoefficientChange: (row: number, column: number, value: string) => void;
  onConstraintSenseChange: (index: number, value: ConstraintSense) => void;
  onConstraintRhsChange: (index: number, value: string) => void;
  onBuildManualProblem: () => void;
};

export default function UploadCard({
  file,
  variables,
  constraints,
  objectiveSense,
  objectiveCoefficients,
  constraintCoefficients,
  constraintSenses,
  constraintRhs,
  manualFormGenerated,
  manualError,
  onFileChange,
  onSubmitFile,
  onVariablesChange,
  onConstraintsChange,
  onGenerateManualForm,
  onObjectiveSenseChange,
  onObjectiveCoefficientChange,
  onConstraintCoefficientChange,
  onConstraintSenseChange,
  onConstraintRhsChange,
  onBuildManualProblem,
}: UploadCardProps) {
  const [manualSectionOpen, setManualSectionOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-[1.05rem] font-semibold text-slate-900">
        <span className="text-emerald-600">↥</span>
        Upload de Arquivo
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <label className="block text-sm font-medium text-slate-700" htmlFor="problem-file-input">
          Selecione um arquivo CSV ou TXT
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            id="problem-file-input"
            type="file"
            className="sr-only"
            accept=".csv, .txt"
            onChange={onFileChange}
          />
          <label
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            htmlFor="problem-file-input"
          >
            Carregar
          </label>
          <span className="text-sm text-slate-500">{file ? file.name : "Nenhum arquivo selecionado."}</span>
        </div>
        <div className="mt-3 text-sm text-emerald-700">
          {file ? `Arquivo selecionado: ${file.name}` : "Nenhum arquivo selecionado."}
        </div>
        <button
          className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onSubmitFile}
          disabled={!file}
          type="button"
        >
          Continuar com arquivo
        </button>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-5">
        <button
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          onClick={() => setManualSectionOpen((current) => !current)}
          type="button"
          aria-expanded={manualSectionOpen}
        >
          <span>Ou preencha manualmente</span>
          <span className="text-lg leading-none text-slate-500">{manualSectionOpen ? "-" : "+"}</span>
        </button>

        {manualSectionOpen && (
          <div className="mt-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Quantidade de variáveis
                <input
                  type="number"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-black outline-none focus:border-blue-500"
                  value={variables}
                  onChange={(event) => onVariablesChange(event.target.value)}
                  min="1"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                Quantidade de restrições
                <input
                  type="number"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-black outline-none focus:border-blue-500"
                  value={constraints}
                  onChange={(event) => onConstraintsChange(event.target.value)}
                  min="1"
                />
              </label>
            </div>

            <button
              className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              onClick={onGenerateManualForm}
              type="button"
            >
              Gerar formulário
            </button>
          </div>
        )}
      </div>

      {manualError && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {manualError}
        </div>
      )}

      {manualSectionOpen && manualFormGenerated && (
        <div className="mt-5 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-slate-900">Função objetivo</div>
              <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                <button
                  className={`rounded-full px-4 py-2 text-sm ${
                    objectiveSense === "max" ? "bg-blue-600 text-white" : "text-slate-600"
                  }`}
                  onClick={() => onObjectiveSenseChange("max")}
                  type="button"
                >
                  Maximizar
                </button>
                <button
                  className={`rounded-full px-4 py-2 text-sm ${
                    objectiveSense === "min" ? "bg-blue-600 text-white" : "text-slate-600"
                  }`}
                  onClick={() => onObjectiveSenseChange("min")}
                  type="button"
                >
                  Minimizar
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {objectiveCoefficients.map((value, index) => (
                <label key={index} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                  c{index + 1}
                  <input
                    type="number"
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-black outline-none focus:border-blue-500"
                    value={value}
                    onChange={(event) => onObjectiveCoefficientChange(index, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 text-sm font-semibold text-slate-900">Restrições</div>
            <div className="space-y-4">
              {constraintCoefficients.map((row, rowIndex) => (
                <div key={rowIndex} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex flex-col gap-1">
                    <div className="text-sm font-medium text-slate-900">Restrição {rowIndex + 1}</div>
                    <div className="text-xs text-slate-500">
                      {row.map((_, index) => `a${index + 1}*x${index + 1}`).join(" + ")}{" "}
                      {constraintSenses[rowIndex]} b
                    </div>
                  </div>

                  <div className="grid items-end gap-3 md:grid-cols-3 xl:grid-cols-6">
                    {row.map((value, columnIndex) => (
                      <label key={columnIndex} className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                        a{columnIndex + 1}
                        <input
                          type="number"
                          className="rounded-xl border border-slate-200 px-4 py-3 text-black outline-none focus:border-blue-500"
                          value={value}
                          onChange={(event) =>
                            onConstraintCoefficientChange(rowIndex, columnIndex, event.target.value)
                          }
                        />
                      </label>
                    ))}

                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                      Tipo
                      <select
                        className="rounded-xl border border-slate-200 px-4 py-3 text-black outline-none focus:border-blue-500"
                        value={constraintSenses[rowIndex]}
                        onChange={(event) =>
                          onConstraintSenseChange(rowIndex, event.target.value as ConstraintSense)
                        }
                      >
                        <option value="<=">{"<="}</option>
                        <option value=">=">{">="}</option>
                        <option value="=">=</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                      b
                      <input
                        type="number"
                        className="rounded-xl border border-slate-200 px-4 py-3 text-black outline-none focus:border-blue-500"
                        value={constraintRhs[rowIndex]}
                        onChange={(event) => onConstraintRhsChange(rowIndex, event.target.value)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            onClick={onBuildManualProblem}
            type="button"
          >
            Montar problema
          </button>
        </div>
      )}
    </section>
  );
}
