import random

def generate_matrix(rows, cols):
    matrix = [[random.randint(-100, 100) for _ in range(cols)] for _ in range(rows)]
    return matrix

def add_matrices(matrix1, matrix2):
    rows = len(matrix1)
    cols = len(matrix1[0])
    result = [[0 for _ in range(cols)] for _ in range(rows)]

    for i in range(rows):
        for j in range(cols):
            result[i][j] = matrix1[i][j] + matrix2[i][j]

    return result

matrix_1 = generate_matrix(10, 10)
matrix_2 = generate_matrix(10, 10)

print("Matrix 1:")
for row in matrix_1:
    print(row)

print("\nMatrix 2:")
for row in matrix_2:
    print(row)

matrix_3 = add_matrices(matrix_1, matrix_2)

print("\nResult Matrix:")
for row in matrix_3:
    print(row)