# Задание №1
def reverse_array(n, arr):
    reversed_arr = arr[::-1]
    return reversed_arr

# Задание №2
def rearrange_array(n, arr):
    rearranged_arr = [arr[-1]] + arr[:-1]
    return rearranged_arr

# Задание №3
def min_boats(m, n, weights):
    weights.sort()
    boats = 0
    left, right = 0, n - 1

    while left <= right:
        if weights[left] + weights[right] <= m:
            left += 1
            right -= 1
        else:
            right -= 1
        boats += 1

    return boats

# Ввод данных для задания №1
n = int(input())
array = [int(input()) for _ in range(n)]
reversed_array = reverse_array(n, array)
print(*reversed_array)

# Ввод данных для задания №2
n = int(input())
array = list(map(int, input().split()))
rearranged_array = rearrange_array(n, array)
print(*rearranged_array)

# Ввод данных для задания №3
m = int(input())
n = int(input())
weights = [int(input()) for _ in range(n)]
min_boats_needed = min_boats(m, n, weights)
print(min_boats_needed)