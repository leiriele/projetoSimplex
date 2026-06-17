# Adaptações para MAXIMIZAÇÃO

## 📋 Resumo das Mudanças

### 1. **geneticAssignment.ts** - Corrigida lógica de otimização

#### Mudança 1: Função `evaluateIndividual()`
```typescript
// ANTES (minimizava sempre)
const baseCost = problem.sense === "min" ? objectiveValue : -objectiveValue;
return { fitness: baseCost + violation * penaltyWeight, ... };

// DEPOIS (correta para max/min)
const fitnessValue = problem.sense === "max" 
  ? objectiveValue - violation * penaltyWeight
  : objectiveValue + violation * penaltyWeight;
return { fitness: fitnessValue, ... };
```

**Explicação:**
- **Maximização**: `fitness = objectiveValue - penalty` (quanto maior, melhor)
- **Minimização**: `fitness = objectiveValue + penalty` (quanto menor, melhor)

#### Mudança 2: Função `pickByTournament()`
```typescript
// Adicionado parâmetro 'sense' para respeitar direção de otimização
function pickByTournament(population, fitness, k, sense: "min" | "max" = "min") {
  const isBetter = sense === "max" 
    ? fitness[idx] > fitness[bestIndex]  // maior é melhor
    : fitness[idx] < fitness[bestIndex]; // menor é melhor
  if (isBetter) { bestIndex = idx; }
}
```

#### Mudança 3: Função `solveIntegerLinearProgram()`
```typescript
// Sorting respeitando o sentido
idxs.sort((a, b) => 
  problem.sense === "max" 
    ? fitness[b] - fitness[a]  // descendente para max
    : fitness[a] - fitness[b]  // ascendente para min
);

// Seleção por torneio com parâmetro sense
const parent1 = pickByTournament(population, fitness, opt.tournamentSize, problem.sense);
const parent2 = pickByTournament(population, fitness, opt.tournamentSize, problem.sense);
```

---

### 2. **fileParser.js** - Suporte para formato CSV/TXT

O parser agora detecta automaticamente se é um problema de **Programação Linear com Maximização**:

```javascript
// Formato esperado:
// Linha 1: coeficientes da função objetivo
// Linhas 2+: restrições, com último valor = RHS (lado direito)
```

**Exemplo com seu arquivo `pl_problema_50x50.csv`:**
```
4,5,7,4,9,7,8,3,2,4,...,9,5,0
5,5,7,6,9,9,0,7,1,8,...,3,0,1178
1,2,0,6,3,7,8,2,2,6,...,4,5,1188
...
```

O parser converte isso automaticamente em:
```json
{
  "type": "ilp",
  "n": 50,
  "m": 49,
  "objective": [4, 5, 7, 4, 9, ...],
  "sense": "max",
  "constraints": [
    { "coefficients": [5, 5, 7, ...], "sense": "<=", "rhs": 1178 },
    { "coefficients": [1, 2, 0, ...], "sense": "<=", "rhs": 1188 },
    ...
  ]
}
```

---

### 3. **GeneticAlgorithm.tsx** - Indicador visual

Adicionado ícone para indicar se está maximizando ou minimizando:
```jsx
{problem?.sense === "max" ? "📈 Maximizar" : "📉 Minimizar"}: {ilpResult.bestObjective.toFixed(2)}
```

---

## 🚀 Como usar

### Opção 1: Arquivo CSV/TXT simples (Maximização automática)
Salve seu arquivo no formato:
```
c1,c2,c3,...,cn,0              # Função objetivo
a11,a12,...,a1n,b1            # Restrição 1
a21,a22,...,a2n,b2            # Restrição 2
...
am1,am2,...,amn,bm            # Restrição m
```

### Opção 2: Formato ILP explícito
```
ILP
50
49
max: 4 5 7 4 9 7 8 3 2 4 ... 9 5 0
5 5 7 6 9 9 0 7 1 8 ... 3 0 <= 1178
1 2 0 6 3 7 8 2 2 6 ... 4 5 <= 1188
...
```

---

## ✅ Verificação

Para testar se está funcionando corretamente:

1. Carregue seu arquivo `pl_problema_50x50.csv`
2. Clique em "Rodar Algoritmo"
3. Verifique se:
   - ✓ Mostra "📈 Maximizar" (não "📉 Minimizar")
   - ✓ O valor da função objetivo é positivo e crescente
   - ✓ A violação das restrições diminui ao longo das gerações

---

## 📊 Comparação: Antes vs. Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **Sentido** | Sempre minimizava | Respeita `sense: "max"` |
| **Fitness MAX** | Invertida incorretamente | Correta: `objective - penalty` |
| **Seleção** | Sempre via menores fitness | Respeita max/min |
| **Entrada** | Apenas matriz quadrada | CSV/TXT com restrições e RHS |
| **Indicador** | Genérico | Específico (max/min) |

