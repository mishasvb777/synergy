# Задание №1
def describe_number(num):
    if num == 0:
        print("нулевое число")
    elif num % 2 == 0:
        if num > 0:
            print("положительное четное число")
        else:
            print("отрицательное четное число")
    else:
        print("число не является четным")

# Задание №2
def count_vowels_and_consonants(word):
    vowels = {'a', 'e', 'i', 'o', 'u'}
    vowel_count = sum(1 for letter in word if letter in vowels)
    consonant_count = sum(1 for letter in word if letter.isalpha() and letter not in vowels)
    
    if vowel_count == 0 or consonant_count == 0:
        print(False)
    else:
        print(f"Гласных букв: {vowel_count}")
        print(f"Согласных букв: {consonant_count}")

# Задание №3
def investment_decision(X, A, B):
    if A >= X and B >= X:
        return 2
    elif A >= X:
        return "Mike"
    elif B >= X:
        return "Ivan"
    elif A + B >= X:
        return 1
    else:
        return 0

number = int(input("Введите целое число: "))
word = input("Введите слово из маленьких латинских букв: ")
X = int(input("Введите минимальную сумму инвестиций X: "))
A = int(input("Введите сумму инвестиций у Майкла A: "))
B = int(input("Введите сумму инвестиций у Ивана B: "))

describe_number(number)
count_vowels_and_consonants(word)
result = investment_decision(X, A, B)
print(result)
