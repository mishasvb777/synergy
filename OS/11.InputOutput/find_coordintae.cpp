#include <iostream>
#include <fstream>
#include <string>
#include <sstream>

int main() {
    std::ifstream file("coordinate.txt");
    if (!file.is_open()) {
        std::cerr << "Error opening file." << std::endl;
        return 1;
    }

    std::string line;
    while (std::getline(file, line)) {
        std::istringstream iss(line);
        char discard;
        double latitude, longitude;

        if ((iss >> discard >> latitude >> discard >> longitude >> discard) && latitude >= 50 && latitude <= 80 && longitude >= 20 && longitude <= 45) {
            std::cout << "(" << latitude << ", " << longitude << ")" << std::endl;
        }
    }

    file.close();
    return 0;
}