# Задание №1
pets = {}

pet_name = input("Введите имя питомца: ")
pet_type = input("Введите вид питомца: ")
pet_age = int(input("Введите возраст питомца: "))
pet_owner = input("Введите имя владельца: ")

if pet_age % 10 == 1 and pet_age != 11:
    age_str = "год"
elif 2 <= pet_age % 10 <= 4 and (pet_age < 10 or pet_age > 20):
    age_str = "года"
else:
    age_str = "лет"

pets[pet_name] = {
    "Вид питомца": pet_type,
    "Возраст питомца": pet_age,
    "Имя владельца": pet_owner
}

print(f"Его возраст: {pet_age} {age_str}")
print(f"Это {pet_type} по кличке \"{pet_name}\". Возраст питомца: {pet_age} {age_str}. Имя владельца: {pet_owner}")

# Задание №2
my_dict = {}

for i in range(10, -6, -1):
    my_dict[i] = i ** i

print(my_dict)