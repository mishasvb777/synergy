# Задание №1
n = int(input())
numbers = list(map(int, input().split()))
unique_numbers = len(set(numbers))
print(unique_numbers)

# Задание №2
list1 = set(map(int, input().split()))
list2 = set(map(int, input().split()))
common_numbers = len(list1.intersection(list2))
print(common_numbers)

# Задание №3
numbers = list(map(int, input().split()))
seen_numbers = set()
for num in numbers:
    if num in seen_numbers:
        print("YES")
    else:
        print("NO")
        seen_numbers.add(num)