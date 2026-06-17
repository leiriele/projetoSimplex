# Guia de Uso - Algoritmo Genético com MAXIMIZAÇÃO

## 📚 Conceitos Principais

### 1. **Problema Original (Do seu exemplo Python)**

```
Maximizar: z = 5x₁ + 4x₂ + 8x₃ + 3x₄ + 9x₅ + 2x₆ + 7x₇ + 6x₈ + 10x₉ + 1x₁₀

Sujeito a:
  2x₁ + 1x₂ + 3x₃ + ... ≤ 15
  1x₁ + 2x₂ + 1x₃ + ... ≤ 20
  3x₁ + 1x₂ + 2x₃ + ... ≤ 18
  ...
  
  xᵢ ≥ 0 (inteiros)
```

---

## 📁 Formato de Entrada

### Opção A: CSV Simples (Automático)

Arquivo: `pl_problema_50x50.csv`

```csv
4,5,7,4,9,7,8,3,2,4,2,6,7,3,5,4,7,5,7,3,10,6,2,3,7,9,5,5,10,4,4,9,8,4,8,3,7,4,3,5,2,9,6,5,4,6,8,9,9,5,0
5,5,7,6,9,9,0,7,1,8,0,5,10,9,1,2,10,5,4,0,8,1,4,1,1,5,7,0,9,9,8,10,4,9,2,6,1,1,2,7,0,5,10,6,3,9,3,5,3,0,1178
1,2,0,6,3,7,8,2,2,6,0,2,10,2,9,8,8,9,4,3,0,9,2,4,4,0,1,7,2,9,4,2,6,1,4,7,5,4,6,10,7,2,6,7,3,0,1,10,4,5,1188
...
```

**Interpretação automática:**
- Linha 1 → Coeficientes da função objetivo: [c₁, c₂, ..., c₅₀]
- Linha 2+ → Restrições: [a₁, a₂, ..., a₅₀, b] onde b = RHS

### Opção B: Formato ILP Explícito

Arquivo: `entrada.txt`

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

## 🔄 Processo do Algoritmo Genético

```
┌─────────────────────────────────────┐
│ 1. Inicializar População Aleatória  │
│    (200 indivíduos)                 │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 2. Avaliar Fitness de Cada Indivíduo│
│                                     │
│ Para MAXIMIZAÇÃO:                   │
│ fitness = objetivo - penalidade     │
│ (quanto MAIOR, melhor)              │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 3. Seleção por Torneio              │
│    (elegem os MAIORES fitness)      │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 4. Crossover (Ordered Crossover)    │
│    (cria 2 filhos de 2 pais)        │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 5. Mutação                          │
│    (swap random de genes)           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ 6. Elitismo                         │
│    (mantém 8 melhores indivíduos)   │
└────────────┬────────────────────────┘
             │
             ▼
        800 gerações?
      /            \
    NÃO            SIM
     │              │
     └──────────────┴──→ Retornar Melhor Solução
```

---

## 📊 Exemplo de Saída

### Console/Log:

```
100 gerações (0.5s): valor = 245.00 | 102.5% do ótimo
200 gerações (1.0s): valor = 248.50 | 103.5% do ótimo
300 gerações (1.5s): valor = 249.75 | 104.0% do ótimo
...
800 gerações (4.0s): valor = 250.00 | 104.2% do ótimo

✅ Melhor solução final encontrada pelo GA:
x = [2, 1, 3, 1, 2, 1, 4, 2, 5, 1, ...]

📈 Maximizar: 250.00 (104.2% do ótimo)
```

### Interface:

```
┌─────────────────────────────────────────────────┐
│ GA — Resolução com Algoritmo Genético          │
├─────────────────────────────────────────────────┤
│ Problema carregado: 50 variáveis, 49 restrições│
│                                                 │
│              [Rodar Algoritmo]                  │
├─────────────────────────────────────────────────┤
│ ✓ Solução factível encontrada                  │
│                                                 │
│ 📈 Maximizar: 250.00                           │
│ Violação total: 0                              │
│ x1=2, x2=1, x3=3, x4=1, x5=2, x6=1, x7=4,     │
│ x8=2, x9=5, x10=1, ...                         │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Parâmetros do Algoritmo

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **populationSize** | 200 | Tamanho da população |
| **generations** | 800 | Número de gerações |
| **crossoverRate** | 0.85 | Probabilidade de crossover |
| **mutationRate** | 0.2 | Probabilidade de mutação |
| **elitism** | 8 | Número de elite mantidos |
| **tournamentSize** | 4 | Tamanho do torneio (seleção) |
| **penaltyWeight** | 1000 | Peso da penalidade de violação |

### Como Ajustar:

- **Aumentar `populationSize`** → Melhor exploração (mais lento)
- **Aumentar `generations`** → Mais iterações para convergência (mais lento)
- **Aumentar `mutationRate`** → Mais diversidade (menos convergência rápida)
- **Aumentar `penaltyWeight`** → Forçar factibilidade (menos exploração)

---

## ✅ Checklist de Verificação

Ao carregar e rodar o algoritmo, verifique:

- [ ] O arquivo foi carregado (mostra número de variáveis e restrições)
- [ ] Exibe "📈 Maximizar" (não "📉 Minimizar")
- [ ] O valor da função objetivo é **positivo**
- [ ] O valor **cresce** ao longo das gerações
- [ ] Violação total é **zero** (solução factível)
- [ ] A solução contém valores inteiros positivos

---

## 🐛 Troubleshooting

### Problema: "Valor da função objetivo negativo"
**Causa:** Penalty era maior que o objetivo
**Solução:** Reduzir `penaltyWeight` ou aumentar `generations`

### Problema: "Violação total > 0"
**Causa:** Não encontrou solução factível
**Solução:** 
- Aumentar `generations`
- Aumentar `penaltyWeight`
- Verificar se o problema é viável

### Problema: "Solução não melhora"
**Causa:** Convergência prematura
**Solução:**
- Aumentar `mutationRate`
- Aumentar `populationSize`
- Reduzir `elitism`

---

## 📈 Métricas de Performance

Veja o arquivo de saída:

```
Melhor solução de gerações: [245, 248.5, 249.75, 250.00, ...]
Média da população: [180, 200, 220, 240, ...]
```

**Análise:**
- Se "Melhor" e "Média" convergem → Populção uniforme (pode estar presa em local)
- Se "Melhor" cresce e "Média" fica atrás → Boa exploração e elitismo
- Se ambas crescem juntas → Convergência suave (bom)

