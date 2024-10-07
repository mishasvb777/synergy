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

# # Печатаем заголовок страницы
# print(driver.title)

# класс кнопки входа на сайт, не меняется
interButton = '.ww-btn.ww-btn--orange.ww-btn--small.ng-star-inserted'
inputLogin = '.ww-tabs__item'

modalLogin = '.cdk-dialog-container'
# # Ищем кнопку по классу (замените 'button-class' на реальный класс кнопки)
# button = driver.find_element(By.CLASS_NAME, interButton)

# Ожидание до 10 секунд пока элемент не станет доступен
button = WebDriverWait(driver, 20).until(
    EC.presence_of_element_located((By.CSS_SELECTOR, interButton))
)

# Вызываем событие onClick на кнопке
ActionChains(driver).move_to_element(button).click(button).perform()

try:
    # Ожидаем появления модального окна в течение 10 секунд
    modal = WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, modalLogin))
    )
    
    print(modal)
    # Находим инпут внутри модального окна
    login_input = modal.find_element(By.CSS_SELECTOR, inputLogin)

    ActionChains(modal).move_to_element(login_input).click(login_input).perform()

    
    # Вводим значение в инпут
    # login_input.send_keys('961-958-82-88')

except Exception as e:
    print(f"Модальное окно или инпут не найдены: {e}")

# Ждем ввода от пользователя перед закрытием браузера
input("Нажмите Enter, чтобы закрыть браузер...")

# # Закрываем драйвер
# driver.quit()

# ww-btn ww-btn--orange ww-btn--small ng-star-inserted  RNmpXc