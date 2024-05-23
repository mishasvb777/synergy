# Задание №1
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n - 1)

def factorials_descending(n):
    fact = factorial(n)
    factorials = [factorial(i) for i in range(fact, 0, -1)]
    return factorials

number = 3 
result = factorials_descending(number)
print(result)

# Задание №2
import collections

pets = {}

def create():
    last = collections.deque(pets, maxlen=1)[0]
    new_id = last + 1
    pet_name = input("Введите кличку питомца: ")
    pet_type = input("Введите вид питомца: ")
    pet_age = int(input("Введите возраст питомца: "))
    pet_owner = input("Введите имя владельца: ")
    
    pets[new_id] = {
        pet_name: {
            "Вид питомца": pet_type,
            "Возраст питомца": pet_age,
            "Имя владельца": pet_owner
        }
    }

def read(ID):
    if ID in pets.keys():
        pet_info = pets[ID]
        for pet_name, details in pet_info.items():
            print(f'Это {details["Вид питомца"]} по кличке "{pet_name}". Возраст питомца: {details["Возраст питомца"]} лет. Имя владельца: {details["Имя владельца"]}')
    else:
        print("Питомец с таким ID не найден.")

def update(ID):
    if ID in pets.keys():
        pet_info = pets[ID]
        for pet_name, details in pet_info.items():
            new_pet_type = input("Введите новый вид питомца: ")
            new_pet_age = int(input("Введите новый возраст питомца: "))
            new_pet_owner = input("Введите новое имя владельца: ")
            
            details["Вид питомца"] = new_pet_type
            details["Возраст питомца"] = new_pet_age
            details["Имя владельца"] = new_pet_owner
            print("Информация о питомце успешно обновлена.")
    else:
        print("Питомец с таким ID не найден.")

def delete(ID):
    if ID in pets.keys():
        del pets[ID]
        print("Запись о питомце успешно удалена.")
    else:
        print("Питомец с таким ID не найден.")

create()
read(1)
update(1)
delete(1)