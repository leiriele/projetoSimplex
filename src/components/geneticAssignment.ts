export type ConstraintSense = "<=" | ">=" | "=";

export type ILPConstraint = {
  coefficients: number[];
  sense: ConstraintSense;
  rhs: number;
};

export type ILPProblem = {
  type: "ilp";
  n: number;
  m: number;
  objective: number[];
  sense: "min" | "max";
  constraints: ILPConstraint[];
};

export type GAOptions = {
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
  elitism: number;
  tournamentSize: number;
  localSearchSwaps: number;
  penaltyWeight: number;
};

export type ILPSolution = {
  bestSolution: number[];
  bestObjective: number;
  bestViolation: number;
  feasible: boolean;
};

export type AssignmentResult = {
  bestPerm: number[];
  bestCost: number;
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function copyArray(arr: number[]) {
  return arr.slice();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function dot(a: number[], b: number[]) {
  let total = 0;
  for (let i = 0; i < a.length; i++) {
    total += a[i] * b[i];
  }
  return total;
}

function isBetterObjective(current: number, best: number, sense: "min" | "max") {
  return sense === "min" ? current < best : current > best;
}

function createBounds(problem: ILPProblem) {
  const bounds = Array.from({ length: problem.n }, () => ({ min: 0, max: 20 }));

  for (const constraint of problem.constraints) {
    if (constraint.rhs < 0) {
      continue;
    }
    for (let j = 0; j < problem.n; j++) {
      const coef = constraint.coefficients[j];
      if (coef > 0) {
        const estimate = Math.max(0, Math.floor(constraint.rhs / coef) + 5);
        bounds[j].max = Math.min(100, Math.max(bounds[j].max, estimate));
      }
    }
  }

  return bounds;
}

function randomIndividual(bounds: { min: number; max: number }[]) {
  return bounds.map((bound) => randomInt(bound.min, bound.max));
}

function evaluateIndividual(problem: ILPProblem, individual: number[], penaltyWeight: number) {
  const objectiveValue = dot(problem.objective, individual);
  let violation = 0;

  for (const constraint of problem.constraints) {
    const lhs = dot(constraint.coefficients, individual);
    if (constraint.sense === "<=" && lhs > constraint.rhs) {
      violation += lhs - constraint.rhs;
    }
    if (constraint.sense === ">=" && lhs < constraint.rhs) {
      violation += constraint.rhs - lhs;
    }
    if (constraint.sense === "=" && lhs !== constraint.rhs) {
      violation += Math.abs(lhs - constraint.rhs);
    }
  }

  // Para MAXIMIZAÇÃO: fitness = objectiveValue - penalty
  // Para MINIMIZAÇÃO: fitness = objectiveValue + penalty
  const fitnessValue = problem.sense === "max" 
    ? objectiveValue - violation * penaltyWeight
    : objectiveValue + violation * penaltyWeight;
  
  return {
    fitness: fitnessValue,
    objectiveValue,
    violation,
  };
}

function repairIndividual(
  problem: ILPProblem,
  individual: number[],
  bounds: { min: number; max: number }[]
) {
  const repaired = copyArray(individual);

  for (const constraint of problem.constraints) {
    const lhs = dot(constraint.coefficients, repaired);
    const delta = constraint.rhs - lhs;

    if (constraint.sense === "<=" && delta < 0) {
      const positiveIndices = constraint.coefficients
        .map((coef, idx) => ({ coef, idx }))
        .filter((item) => item.coef > 0);
      if (positiveIndices.length > 0) {
        const choice = positiveIndices[randomInt(0, positiveIndices.length - 1)];
        const decrease = Math.ceil(Math.abs(delta) / choice.coef);
        repaired[choice.idx] = clamp(repaired[choice.idx] - decrease, bounds[choice.idx].min, bounds[choice.idx].max);
      }
    }

    if (constraint.sense === ">=" && delta > 0) {
      const positiveIndices = constraint.coefficients
        .map((coef, idx) => ({ coef, idx }))
        .filter((item) => item.coef > 0);
      if (positiveIndices.length > 0) {
        const choice = positiveIndices[randomInt(0, positiveIndices.length - 1)];
        const increase = Math.ceil(delta / choice.coef);
        repaired[choice.idx] = clamp(repaired[choice.idx] + increase, bounds[choice.idx].min, bounds[choice.idx].max);
      }
    }

    if (constraint.sense === "=" && delta !== 0) {
      const nonZeroIndices = constraint.coefficients
        .map((coef, idx) => ({ coef, idx }))
        .filter((item) => item.coef !== 0);
      if (nonZeroIndices.length > 0) {
        const choice = nonZeroIndices[randomInt(0, nonZeroIndices.length - 1)];
        const adjustment = Math.ceil(delta / choice.coef);
        repaired[choice.idx] = clamp(repaired[choice.idx] + adjustment, bounds[choice.idx].min, bounds[choice.idx].max);
      }
    }
  }

  return repaired.map((value, index) => clamp(value, bounds[index].min, bounds[index].max));
}

function crossoverUniform(p1: number[], p2: number[], bounds: { min: number; max: number }[]) {
  const child: number[] = [];
  for (let i = 0; i < p1.length; i++) {
    child.push(Math.random() < 0.5 ? p1[i] : p2[i]);
    if (Math.random() < 0.15) {
      const average = Math.round((p1[i] + p2[i]) / 2);
      child[i] = clamp(average, bounds[i].min, bounds[i].max);
    }
  }
  return child;
}

function mutateIndividual(individual: number[], bounds: { min: number; max: number }[]) {
  const child = copyArray(individual);
  const idx = randomInt(0, child.length - 1);
  child[idx] = randomInt(bounds[idx].min, bounds[idx].max);
  return child;
}

function pickByTournament(population: number[][], fitness: number[], k: number, sense: "min" | "max" = "min") {
  let bestIndex = randomInt(0, population.length - 1);
  for (let i = 1; i < k; i++) {
    const idx = randomInt(0, population.length - 1);
    const isBetter = sense === "max" ? fitness[idx] > fitness[bestIndex] : fitness[idx] < fitness[bestIndex];
    if (isBetter) {
      bestIndex = idx;
    }
  }
  return population[bestIndex];
}

function permute(p: number[]) {
  const out = copyArray(p);
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function orderedCrossover(p1: number[], p2: number[]) {
  const n = p1.length;
  const child = Array(n).fill(-1);
  const start = randomInt(0, n - 2);
  const end = randomInt(start + 1, n - 1);

  const used = new Set<number>();
  for (let i = start; i <= end; i++) {
    child[i] = p1[i];
    used.add(p1[i]);
  }

  let write = (end + 1) % n;
  for (let read = 0; read < n; read++) {
    const gene = p2[(end + 1 + read) % n];
    if (!used.has(gene)) {
      child[write] = gene;
      write = (write + 1) % n;
    }
  }

  return child;
}

function swapMutation(perm: number[]) {
  const child = copyArray(perm);
  const i = randomInt(0, perm.length - 1);
  let j = randomInt(0, perm.length - 1);
  while (j === i) j = randomInt(0, perm.length - 1);
  const tmp = child[i];
  child[i] = child[j];
  child[j] = tmp;
  return child;
}

function calcPermCost(costMatrix: number[][], perm: number[]) {
  let total = 0;
  for (let i = 0; i < perm.length; i++) {
    total += costMatrix[i][perm[i]];
  }
  return total;
}

export function geneticAssignment(costMatrix: number[][], opt: {
  populationSize: number;
  generations: number;
  crossoverRate: number;
  mutationRate: number;
  elitism: number;
  tournamentSize: number;
}): AssignmentResult {
  const n = costMatrix.length;
  for (let i = 0; i < n; i++) {
    if (!costMatrix[i] || costMatrix[i].length !== n) {
      throw new Error("A matriz de custos precisa ser quadrada (n x n).");
    }
  }

  const base = Array.from({ length: n }, (_, idx) => idx);
  let population: number[][] = [];
  let fitness: number[] = [];

  for (let i = 0; i < opt.populationSize; i++) {
    const individual = permute(base);
    population.push(individual);
    fitness.push(calcPermCost(costMatrix, individual));
  }

  let bestPerm = copyArray(population[0]);
  let bestCost = fitness[0];

  for (let i = 1; i < fitness.length; i++) {
    if (fitness[i] < bestCost) {
      bestCost = fitness[i];
      bestPerm = copyArray(population[i]);
    }
  }

  for (let gen = 0; gen < opt.generations; gen++) {
    const idxs = population.map((_, index) => index);
    idxs.sort((a, b) => fitness[a] - fitness[b]);

    const newPop: number[][] = [];
    const newFit: number[] = [];

    const eliteCount = Math.min(opt.elitism, opt.populationSize);
    for (let e = 0; e < eliteCount; e++) {
      newPop.push(copyArray(population[idxs[e]]));
      newFit.push(fitness[idxs[e]]);
    }

    while (newPop.length < opt.populationSize) {
      const p1 = pickByTournament(population, fitness, opt.tournamentSize);
      const p2 = pickByTournament(population, fitness, opt.tournamentSize);
      let child = Math.random() < opt.crossoverRate ? orderedCrossover(p1, p2) : copyArray(p1);
      if (Math.random() < opt.mutationRate) {
        child = swapMutation(child);
      }
      const childCost = calcPermCost(costMatrix, child);
      newPop.push(child);
      newFit.push(childCost);
      if (childCost < bestCost) {
        bestCost = childCost;
        bestPerm = copyArray(child);
      }
    }

    population = newPop;
    fitness = newFit;
  }

  return { bestPerm, bestCost };
}

export function solveIntegerLinearProgram(problem: ILPProblem, opt: GAOptions): ILPSolution {
  const bounds = createBounds(problem);
  let population: number[][] = [];
  let fitness: number[] = [];
  let evaluations: Array<ReturnType<typeof evaluateIndividual>> = [];

  for (let i = 0; i < opt.populationSize; i++) {
    const individual = randomIndividual(bounds);
    const evaluation = evaluateIndividual(problem, individual, opt.penaltyWeight);
    population.push(individual);
    fitness.push(evaluation.fitness);
    evaluations.push(evaluation);
  }

  let bestSolution = copyArray(population[0]);
  let bestObjective = evaluations[0].objectiveValue;
  let bestViolation = evaluations[0].violation;
  let bestFeasible: { solution: number[]; objective: number; violation: number } | null =
    evaluations[0].violation === 0
      ? { solution: copyArray(population[0]), objective: evaluations[0].objectiveValue, violation: 0 }
      : null;

  for (let i = 1; i < evaluations.length; i++) {
    if (
      evaluations[i].violation === 0 &&
      (!bestFeasible || isBetterObjective(evaluations[i].objectiveValue, bestFeasible.objective, problem.sense))
    ) {
      bestFeasible = {
        solution: copyArray(population[i]),
        objective: evaluations[i].objectiveValue,
        violation: 0,
      };
    }
  }

  for (let gen = 0; gen < opt.generations; gen++) {
    const idxs = population.map((_, index) => index);
    idxs.sort((a, b) => problem.sense === "max" ? fitness[b] - fitness[a] : fitness[a] - fitness[b]);

    const newPopulation: number[][] = [];
    const newFitness: number[] = [];
    const newEvaluations: Array<ReturnType<typeof evaluateIndividual>> = [];

    const eliteCount = Math.min(opt.elitism, opt.populationSize);
    for (let e = 0; e < eliteCount; e++) {
      const elite = copyArray(population[idxs[e]]);
      newPopulation.push(elite);
      newFitness.push(fitness[idxs[e]]);
      newEvaluations.push(evaluations[idxs[e]]);
    }

    while (newPopulation.length < opt.populationSize) {
      const parent1 = pickByTournament(population, fitness, opt.tournamentSize, problem.sense);
      const parent2 = pickByTournament(population, fitness, opt.tournamentSize, problem.sense);
      let child = crossoverUniform(parent1, parent2, bounds);

      if (Math.random() < opt.mutationRate) {
        child = mutateIndividual(child, bounds);
      }

      if (opt.localSearchSwaps > 0) {
        child = repairIndividual(problem, child, bounds);
      }

      const evaluation = evaluateIndividual(problem, child, opt.penaltyWeight);
      newPopulation.push(child);
      newFitness.push(evaluation.fitness);
      newEvaluations.push(evaluation);

      if (evaluation.violation === 0) {
        if (!bestFeasible || isBetterObjective(evaluation.objectiveValue, bestFeasible.objective, problem.sense)) {
          bestFeasible = {
            solution: copyArray(child),
            objective: evaluation.objectiveValue,
            violation: 0,
          };
        }
      }
    }

    population = newPopulation;
    fitness = newFitness;
    evaluations = newEvaluations;

    for (let i = 0; i < population.length; i++) {
      if (evaluations[i].fitness < fitness[0]) {
        // track the current best fitness for diagnosis; no action needed here
      }
      if (evaluations[i].fitness < fitness[0]) {
        // no-op
      }
    }

    const currentBest = evaluations.reduce((best, current, index) => {
      if (current.fitness < best.evaluation.fitness) {
        return { evaluation: current, index };
      }
      return best;
    }, { evaluation: evaluations[0], index: 0 });

    if (
      currentBest.evaluation.violation === 0 &&
      isBetterObjective(currentBest.evaluation.objectiveValue, bestObjective, problem.sense)
    ) {
      bestObjective = currentBest.evaluation.objectiveValue;
      bestSolution = copyArray(population[currentBest.index]);
      bestViolation = currentBest.evaluation.violation;
    }
  }

  if (bestFeasible) {
    return {
      bestSolution: bestFeasible.solution,
      bestObjective: bestFeasible.objective,
      bestViolation: bestFeasible.violation,
      feasible: true,
    };
  }

  const currentBestOverall = evaluations.reduce((best, current, idx) => {
    if (current.fitness < best.evaluation.fitness) {
      return { evaluation: current, index: idx };
    }
    return best;
  }, { evaluation: evaluations[0], index: 0 });

  return {
    bestSolution: copyArray(population[currentBestOverall.index]),
    bestObjective: currentBestOverall.evaluation.objectiveValue,
    bestViolation: currentBestOverall.evaluation.violation,
    feasible: currentBestOverall.evaluation.violation === 0,
  };
}
