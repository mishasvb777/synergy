#include <iostream>
#include <vector>
#include <unistd.h>

void multiplyMatrices(const std::vector<std::vector<int>>& matrix1, const std::vector<std::vector<int>>& matrix2, std::vector<std::vector<int>>& result, int startRow, int endRow) {
    for (int i = startRow; i < endRow; ++i) {
        for (int j = 0; j < matrix2[0].size(); ++j) {
            result[i][j] = 0;
            for (int k = 0; k < matrix1[0].size(); ++k) {
                result[i][j] += matrix1[i][k] * matrix2[k][j];
            }
        }
    }
}

int main() {
    std::vector<std::vector<int>> matrix1 = {{1, 2}, {3, 4}};
    std::vector<std::vector<int>> matrix2 = {{5, 6}, {7, 8}};
    std::vector<std::vector<int>> result(matrix1.size(), std::vector<int>(matrix2[0].size(), 0));

    int numProcesses = matrix1.size();
    for (int i = 0; i < numProcesses; ++i) {
        pid_t pid = fork();

        if (pid == 0) {
            // Дочерний процесс
            multiplyMatrices(matrix1, matrix2, result, i, i + 1);
            return 0;
        }
    }

    for (int i = 0; i < numProcesses; ++i) {
        cwait(NULL);
    }ы

    for (const auto& row : result) {
        for (int elem : row) {
            std::cout << elem << " ";
        }
        std::cout << std::endl;
    }

    return 0;
}