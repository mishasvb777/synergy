# Задание №1
def rectangle_properties():
    try:
        width = float(input("Введите ширину прямоугольника: "))
        length = float(input("Введите длину прямоугольника: "))

        area = width * length
        perimeter = 2 * (width + length)

        print(f"Площадь прямоугольника: {area}")
        print(f"Периметр прямоугольника: {perimeter}")

    except ValueError:
        print("Ошибка! Пожалуйста, введите числа.")

rectangle_properties()


# Задание №2
def calculate_number(number):
    units = number % 10
    tens = (number // 10) % 10
    hundreds = (number // 100) % 10
    thousands = (number // 1000) % 10
    ten_thousands = number // 10000

    result = (tens ** units) * (hundreds * 100) / (ten_thousands - thousands)
    return result

input_number = 46275
result = calculate_number(input_number)
print(result)