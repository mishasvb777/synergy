N = int(input("Введите число N: "))
numbers = [int(input()) for _ in range(N)]
count_zeros = numbers.count(0)
print(count_zeros)

X = int(input("Введите натуральное число X: "))
count_divisors = 0
for i in range(1, int(X**0.5) + 1):
    if X % i == 0:
        count_divisors += 1
        if i != X // i:
            count_divisors += 1
print(count_divisors)

A = int(input("Введите целое число A: "))
B = int(input("Введите целое число B: "))

for num in range(A, B+1):
    if num % 2 == 0:
        print(num, end=" ")