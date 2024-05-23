animal_type = input("Введите вид питомца: ")
pet_name = input("Введите кличку питомца: ")
pet_age = input("Введите возраст питомца: ")

sentence = f"Это {animal_type} по кличке \"{pet_name}\". Возраст: {pet_age} года."

print(sentence)

embryo = input("Введите первую стадию развития человека: ")
fetus = input("Введите вторую стадию развития человека: ")
infant = input("Введите третью стадию развития человека: ")
child = input("Введите четвертую стадию развития человека: ")
adolescent = input("Введите пятую стадию развития человека: ")
adult = input("Введите шестую стадию развития человека: ")

development_stages = ' => '.join([embryo, fetus, infant, child, adolescent, adult, 'Homo sapiens sapiens'])

print(development_stages)