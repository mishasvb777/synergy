#include <iostream>
#include <fstream>

int main() {
    std::string socketName;

    std::cout << "Введите название сокета: ";
    std::cin >> socketName;

    std::ofstream fileSocket("socket.txt");
    if (fileSocket.is_open()) {
        fileSocket << socketName;
        fileSocket.close();
        std::cout << "Название сокета успешно записано в файл 'socket.txt'" << std::endl;
    } else {
        std::cerr << "Ошибка при открытии файла для записи" << std::endl;
        return 1;
    }

    return 0;
}