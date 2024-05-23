# Задание №1
def check_palindrome(s):
    if s == s[::-1]:
        print("yes")
    else:
        print("no")

# Задание №2
def remove_extra_spaces(s):
    s = ' '.join(s.split())
    print(s)

input_string = input("Введите строку: ")

check_palindrome(input_string)
remove_extra_spaces(input_string)