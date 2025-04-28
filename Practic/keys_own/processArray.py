def process_array(A, B):
    # Инициализация переменных
    sum_positive = 0
    count_positive = 0
    count_greater_B = 0
    product_greater_B = 1

    for element in A:
        # Подсчет положительных элементов
        if element > 0:
            sum_positive += element
            count_positive += 1
        
        # Подсчет элементов, больших B
        if element > B:
            count_greater_B += 1
            product_greater_B *= element

    return {
        "sum_positive": sum_positive,
        "count_positive": count_positive,
        "count_greater_B": count_greater_B,
        "product_greater_B": product_greater_B
    }

# Тестирование
if __name__ == "__main__":
    # Исходные данные
    A = [3, -1, 7, 0, 8, -5, 10]
    B = 5

    # Вызов функции
    result = process_array(A, B)

    # Вывод результатов
    print("Сумма положительных элементов:", result["sum_positive"])
    print("Количество положительных элементов:", result["count_positive"])
    print("Количество элементов, больших B:", result["count_greater_B"])
    print("Произведение элементов, больших B:", result["product_greater_B"])

