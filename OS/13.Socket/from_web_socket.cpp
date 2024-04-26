#include <iostream>
#include <boost/asio.hpp>

using boost::asio::ip::tcp;

int main() {
    boost::asio::io_context ioContext;

    tcp::socket socket(ioContext);
    socket.connect(tcp::endpoint(boost::asio::ip::address::from_string("127.0.0.1"), 12345));

    std::string socketName;
    std::cout << "Введите название сокета: ";
    std::cin >> socketName;

    boost::system::error_code error;
    boost::asio::write(socket, boost::asio::buffer(socketName), error);

    if (error) {
        std::cerr << "Ошибка при отправке данных: " << error.message() << std::endl;
        return 1;
    }

    std::cout << "Название сокета успешно отправлено на сервер" << std::endl;

    return 0;
}