from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Создаем экземпляр Service с помощью webdriver_manager
service = Service(ChromeDriverManager().install())

# Инициализируем веб-драйвер
driver = webdriver.Chrome(service=service)

# Открываем веб-страницу
driver.get('https://winline.ru/')

# Класс кнопки входа на сайт, не меняется
interButton = '.ww-btn.ww-btn--orange.ww-btn--small.ng-star-inserted'
modalLogin = '.cdk-dialog-container'
btnLogin = 'span[class="ww-tabs__item"]'
inputLogin = '.ww-field.ng-star-inserted'

search = 'input[class="sidebar-controls__search__input"]'

# inputLogin = '.ww-field__input.ng-pristine.ng-valid.ng-touched' '.sidebar-controls__search__input.ng-tns-c125-0.ng-pristine.ng-valid.ng-touched'

try:
    searchInput = WebDriverWait(driver, 50).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, search))
    )
    print("Поиск найдена")

    # ActionChains(driver).move_to_element(login_btn).click(login_btn).perform()
    # print("Клик по Логин выполнен")

    searchInput.send_keys('Шемрок Роверс')

    # # Ожидание до 20 секунд пока элемент не станет доступен
    # button = WebDriverWait(driver, 20).until(
    #     EC.presence_of_element_located((By.CSS_SELECTOR, interButton))
    # )
    # print("Кнопка найдена")

    # # Вызываем событие onClick на кнопке
    # ActionChains(driver).move_to_element(button).click(button).perform()

    # # Ожидаем появления модального окна в течение 30 секунд
    # modal = WebDriverWait(driver, 30).until(
    #     EC.presence_of_element_located((By.CSS_SELECTOR, modalLogin))
    # )
    # print("Модальное окно найдено")

    # # Находим инпут внутри модального окна
    # login_btn = WebDriverWait(driver, 30).until(
    #     EC.presence_of_element_located((By.CSS_SELECTOR, btnLogin))
    # )
    # print("Инпут найден")

    # # Прокручиваем к инпуту, чтобы он стал видимым
    # driver.execute_script("arguments[0].scrollIntoView(true);", login_btn)

    # # Кликаем по инпуту
    # ActionChains(driver).move_to_element(login_btn).click(login_btn).perform()
    # print("Клик по Логин выполнен")

    # #Находим поле ввода логина
    # login_input = WebDriverWait(driver, 30).until(
    #     EC.element_to_be_clickable((By.CSS_SELECTOR, inputLogin))
    # )
    # print("Поле Пароля найдено")

    # # ActionChains(driver).move_to_element(login_input).click(login_input).perform()
    # # print("Клик по Паролю")

    # # Прокручиваем к инпуту, чтобы он стал видимым
    # # Прокручиваем к полю ввода, чтобы оно стало видимым
    # driver.execute_script("arguments[0].scrollIntoView(true);", login_input)
    # print("Прокрутили")


    # # Убедимся, что поле ввода видимо и доступно для взаимодействия
    # WebDriverWait(driver, 10).until(EC.visibility_of(login_input))
    # print("Проверили видимость")

    # WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.CSS_SELECTOR, inputLogin)))
    # print("Проверили то что можно по нему кликать")

    # # Очистим поле ввода перед вводом текста (на всякий случай)
    # # login_input.clear()
    # # print("Очистили поле")

    # # Вводим данные в поле ввода с помощью send_keys
    # login_input.send_keys('your_login')
    # print("Данные введены в поле ввода")

    #Вносим в инпут логина данные


except Exception as e:
    print(f"Модальное окно или инпут не найдены: {e}")

# Ждем ввода от пользователя перед закрытием браузера
input("Нажмите Enter, чтобы закрыть браузер...")