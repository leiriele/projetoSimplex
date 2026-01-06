type GAOptions = {
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
  elitism: number; // quantidade de melhores que passam direto
  tournamentSize: number;
  localSearchSwaps?: number; // opcional: refina com swaps locais
};

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr: number[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function costOfPermutation(costMatrix: number[][], perm: number[]) {
  let total = 0;
  for (let i = 0; i < perm.length; i++) total += costMatrix[i][perm[i]];
  return total;
}

// Seleção por torneio (minimização)
function tournamentSelect(pop: number[][], fitness: number[], k: number) {
  let bestIdx = randInt(0, pop.length - 1);
  for (let t = 1; t < k; t++) {
    const idx = randInt(0, pop.length - 1);
    if (fitness[idx] < fitness[bestIdx]) bestIdx = idx;
  }
  return pop[bestIdx];
}

// Crossover OX (Order Crossover) — ótimo pra permutações
function orderCrossover(p1: number[], p2: number[]) {
  const n = p1.length;
  const a = randInt(0, n - 2);
  const b = randInt(a + 1, n - 1);

  const child = Array(n).fill(-1);
  // copia segmento de p1
  for (let i = a; i <= b; i++) child[i] = p1[i];

  // completa com a ordem de p2 sem repetir
  let write = (b + 1) % n;
  let read = (b + 1) % n;

  const used = new Set(child.filter(v => v !== -1));
  while (child.includes(-1)) {
    const candidate = p2[read];
    if (!used.has(candidate)) {
      child[write] = candidate;
      used.add(candidate);
      write = (write + 1) % n;
    }
    read = (read + 1) % n;
  }

  return child;
}

// Mutação swap
function swapMutation(perm: number[]) {
  const n = perm.length;
  const i = randInt(0, n - 1);
  let j = randInt(0, n - 1);
  while (j === i) j = randInt(0, n - 1);
  const m = [...perm];
  [m[i], m[j]] = [m[j], m[i]];
  return m;
}

// Pequena busca local: tenta alguns swaps e aceita se melhorar
function localSearchBySwaps(costMatrix: number[][], perm: number[], tries: number) {
  let best = [...perm];
  let bestCost = costOfPermutation(costMatrix, best);

  for (let t = 0; t < tries; t++) {
    const cand = swapMutation(best);
    const c = costOfPermutation(costMatrix, cand);
    if (c < bestCost) {
      best = cand;
      bestCost = c;
    }
  }
  return best;
}

export function geneticAssignment(costMatrix: number[][], options: GAOptions) {
  const n = costMatrix.length;
  if (!costMatrix.every(r => r.length === n)) {
    throw new Error("Matriz deve ser quadrada (n x n) para problema de atribuição.");
  }

  // população inicial
  const base = Array.from({ length: n }, (_, i) => i);
  let population: number[][] = Array.from({ length: options.populationSize }, () => shuffle(base));

  let fitness = population.map(p => costOfPermutation(costMatrix, p));

  let bestIdx = fitness.reduce((b, f, i) => (f < fitness[b] ? i : b), 0);
  let bestPerm = [...population[bestIdx]];
  let bestCost = fitness[bestIdx];

  for (let gen = 0; gen < options.generations; gen++) {
    // ordenar por fitness (min)
    const order = population
      .map((p, i) => ({ p, f: fitness[i] }))
      .sort((a, b) => a.f - b.f);

    const newPop: number[][] = [];

    // elitismo
    for (let e = 0; e < options.elitism; e++) newPop.push([...order[e].p]);

    // gerar filhos
    while (newPop.length < options.populationSize) {
      const parent1 = tournamentSelect(population, fitness, options.tournamentSize);
      const parent2 = tournamentSelect(population, fitness, options.tournamentSize);

      let child = Math.random() < options.crossoverRate
        ? orderCrossover(parent1, parent2)
        : [...parent1];

      if (Math.random() < options.mutationRate) child = swapMutation(child);

      if (options.localSearchSwaps && options.localSearchSwaps > 0) {
        child = localSearchBySwaps(costMatrix, child, options.localSearchSwaps);
      }

      newPop.push(child);
    }

    population = newPop;
    fitness = population.map(p => costOfPermutation(costMatrix, p));

    const genBestIdx = fitness.reduce((b, f, i) => (f < fitness[b] ? i : b), 0);
    if (fitness[genBestIdx] < bestCost) {
      bestCost = fitness[genBestIdx];
      bestPerm = [...population[genBestIdx]];
    }
  }

  return { bestPerm, bestCost };
}
