numbers = []

while True:
    user_input = input("Введите число (0 для выхода): ")
    
    if user_input == '0':
        break
    
    if user_input.isdigit():
        number = int(user_input)
        numbers.append(number)
    else:
        print("Пожалуйста, введите число.")

print("\nВсе введённые числа (кроме нуля):")
for num in numbers:
    print(num)