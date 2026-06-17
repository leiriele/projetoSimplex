import React, { useState } from "react";
import type { GAOptions } from "@/components/geneticAssignment";

type EditableGAParameterKey = "populationSize" | "generations" | "mutationRate";

type GAParametersCardProps = {
  options: GAOptions;
  errors: Partial<Record<EditableGAParameterKey, string>>;
  onChange: (key: EditableGAParameterKey, value: number) => void;
  onRestoreDefaults: () => void;
};

const editableFields: Array<{
  key: EditableGAParameterKey;
  label: string;
  description: string;
  step: string;
}> = [
  {
    key: "populationSize",
    label: "Tamanho da População",
    description: "Controla a diversidade de soluções avaliadas em cada geração.",
    step: "1",
  },
  {
    key: "generations",
    label: "Número de Gerações",
    description: "Controla o tempo de busca e a exploração do espaço de soluções.",
    step: "1",
  },
  {
    key: "mutationRate",
    label: "Taxa de Mutação",
    description: "Ajuda a escapar de ótimos locais durante a evolução.",
    step: "0.01",
  },
];

export default function GAParametersCard({
  options,
  errors,
  onChange,
  onRestoreDefaults,
}: GAParametersCardProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="space-y-3">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[1.05rem] font-semibold text-slate-900">
              <span className="text-blue-600">⚙</span>
              Parâmetros do Algoritmo Genético
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Ajuste os três parâmetros principais para comparar desempenho, GAP e estabilidade.
            </p>
          </div>

          <button
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            onClick={onRestoreDefaults}
            type="button"
          >
            Restaurar Padrão
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {editableFields.map((field) => (
            <label key={field.key} className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-800">{field.label}</span>
              <span className="text-xs leading-5 text-slate-500">{field.description}</span>
              <input
                type="number"
                className={`rounded-xl border px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 ${
                  errors[field.key] ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
                }`}
                value={options[field.key]}
                step={field.step}
                onChange={(event) => onChange(field.key, Number(event.target.value))}
              />
              {errors[field.key] && <span className="text-xs text-red-600">{errors[field.key]}</span>}
            </label>
          ))}
        </div>

        <button
          className="mt-5 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          onClick={() => setAdvancedOpen((current) => !current)}
          type="button"
          aria-expanded={advancedOpen}
        >
          <span>Configuração avançada fixa</span>
          <span className="text-lg leading-none text-slate-500">{advancedOpen ? "-" : "+"}</span>
        </button>

        {advancedOpen && (
          <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
            <div>Crossover: {(options.crossoverRate * 100).toFixed(0)}%</div>
            <div>Elitismo: {options.elitism}</div>
            <div>Torneio: {options.tournamentSize}</div>
            <div>Buscas locais: {options.localSearchSwaps}</div>
            <div>Peso da penalidade: {options.penaltyWeight}</div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-slate-900">Resumo dos parâmetros</div>
        <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
          <div>População: {options.populationSize}</div>
          <div>Gerações: {options.generations}</div>
          <div>Mutação: {(options.mutationRate * 100).toFixed(0)}%</div>
        </div>
      </section>
    </div>
  );
}
