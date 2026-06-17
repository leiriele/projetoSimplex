"""
Script de validação: Maximização vs Minimização
Demonstra a diferença na fitness calculation
"""

import numpy as np

# ============= EXEMPLO DE PROBLEMA =============
# Função Objetivo: max z = 5x1 + 4x2 + 8x3 + 3x4 + 9x5 + 2x6 + 7x7 + 6x8 + 10x9 + 1x10
# Restrições:
#   2x1 + 1x2 + 3x3 + ... >= 15
#   1x1 + 2x2 + 1x3 + ... >= 20
#   etc.

# Coeficientes da função objetivo
c = np.array([5, 4, 8, 3, 9, 2, 7, 6, 10, 1])

# Matriz de restrições
A = np.array([
    [2, 1, 3, 1, 2, 1, 4, 2, 5, 1],
    [1, 2, 1, 2, 1, 3, 1, 4, 1, 2],
    [3, 1, 2, 3, 4, 1, 2, 1, 3, 3],
])

# Lado direito
b = np.array([15, 20, 18])

# ============= SOLUÇÃO DE EXEMPLO =============
x_solution = np.array([2, 1, 3, 1, 2, 1, 4, 2, 5, 1])

# Cálculo objetivo
objective_value = np.dot(c, x_solution)
print(f"Valor da função objetivo: {objective_value}")

# Verificar violações de restrição (suponha restrições do tipo <=)
violations = []
for i in range(len(A)):
    lhs = np.dot(A[i], x_solution)
    violation = max(0, lhs - b[i])  # violação se lhs > b (para <=)
    violations.append(violation)

total_violation = sum(violations)
print(f"Violação total de restrições: {total_violation}")

# ============= CÁLCULO DE FITNESS =============
penalty_weight = 10.0

print("\n" + "="*60)
print("CÁLCULO DE FITNESS")
print("="*60)

# Minimização (ANTES - INCORRETO)
print("\n❌ MINIMIZAÇÃO (modo antigo - INCORRETO para max):")
fitness_min_old = objective_value + total_violation * penalty_weight
print(f"   fitness = objetivo + penalty")
print(f"   fitness = {objective_value} + {total_violation * penalty_weight}")
print(f"   fitness = {fitness_min_old}")
print(f"   → Para minimizar, busca o MENOR fitness")

# Maximização (CORRETO)
print("\n✅ MAXIMIZAÇÃO (CORRETO):")
fitness_max = objective_value - total_violation * penalty_weight
print(f"   fitness = objetivo - penalty")
print(f"   fitness = {objective_value} - {total_violation * penalty_weight}")
print(f"   fitness = {fitness_max}")
print(f"   → Para maximizar, busca o MAIOR fitness")

# Minimização (CORRETO)
print("\n✅ MINIMIZAÇÃO (CORRETO):")
fitness_min = objective_value + total_violation * penalty_weight
print(f"   fitness = objetivo + penalty")
print(f"   fitness = {objective_value} + {total_violation * penalty_weight}")
print(f"   fitness = {fitness_min}")
print(f"   → Para minimizar, busca o MENOR fitness")

print("\n" + "="*60)
print("COMPARAÇÃO COM DUAS SOLUÇÕES")
print("="*60)

x1 = np.array([2, 1, 3, 1, 2, 1, 4, 2, 5, 1])
x2 = np.array([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])

obj1 = np.dot(c, x1)
obj2 = np.dot(c, x2)

viol1 = sum(max(0, np.dot(A[i], x1) - b[i]) for i in range(len(A)))
viol2 = sum(max(0, np.dot(A[i], x2) - b[i]) for i in range(len(A)))

print(f"\nSolução 1: x = {x1}")
print(f"  Objetivo: {obj1}")
print(f"  Violação: {viol1}")
print(f"  Fitness (MAX): {obj1 - viol1 * penalty_weight}")
print(f"  Fitness (MIN): {obj1 + viol1 * penalty_weight}")

print(f"\nSolução 2: x = {x2}")
print(f"  Objetivo: {obj2}")
print(f"  Violação: {viol2}")
print(f"  Fitness (MAX): {obj2 - viol2 * penalty_weight}")
print(f"  Fitness (MIN): {obj2 + viol2 * penalty_weight}")

print(f"\n{'Para MAXIMIZAR:' if obj1 - viol1 * penalty_weight > obj2 - viol2 * penalty_weight else 'Para MINIMIZAR:'}")
if obj1 - viol1 * penalty_weight > obj2 - viol2 * penalty_weight:
    print(f"  ✓ Solução 1 é melhor (fitness MAX: {obj1 - viol1 * penalty_weight} > {obj2 - viol2 * penalty_weight})")
else:
    print(f"  ✓ Solução 2 é melhor (fitness MAX: {obj2 - viol2 * penalty_weight} > {obj1 - viol1 * penalty_weight})")
