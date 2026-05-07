package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"practic/pkg/worker"
)

func currentYear() int {
	return time.Now().Year()
}

func readLine(scanner *bufio.Scanner, prompt string) string {
	for {
		fmt.Print(prompt)
		if scanner.Scan() {
			return strings.TrimSpace(scanner.Text())
		}
		fmt.Println("Ошибка чтения. Повторите ввод.")
	}
}

func readInt(scanner *bufio.Scanner, prompt string, minValue int, maxValue int) int {
	for {
		raw := readLine(scanner, prompt)
		value, err := strconv.Atoi(raw)
		if err == nil && value >= minValue && value <= maxValue {
			return value
		}
		fmt.Println("Некорректный ввод. Повторите.")
	}
}

func readFloat(scanner *bufio.Scanner, prompt string, minValue float64) float64 {
	for {
		raw := readLine(scanner, prompt)
		value, err := strconv.ParseFloat(raw, 64)
		if err == nil && value >= minValue {
			return value
		}
		fmt.Println("Некорректный ввод. Повторите.")
	}
}

func main() {
	fmt.Println("Программа учета работников (кейс 2.3)")

	scanner := bufio.NewScanner(os.Stdin)
	workers := make([]worker.WORKER, 0)

	count := readInt(scanner, "Введите количество работников: ", 1, 1000)
	for i := 0; i < count; i++ {
		fmt.Printf("\nРаботник #%d\n", i+1)
		fullName := readLine(scanner, "Фамилия и инициалы: ")
		position := readLine(scanner, "Должность: ")
		salary := readFloat(scanner, "Зарплата: ", 0)
		hireYear := readInt(scanner, "Год поступления на работу: ", 1900, 2100)

		w, err := worker.NewWorker(fullName, position, salary, hireYear)
		if err != nil {
			fmt.Printf("Ошибка создания записи работника: %v\n", err)
			i--
			continue
		}
		workers = append(workers, w)
	}

	threshold := readInt(scanner, "\nВведите минимальный стаж (в годах): ", 0, 100)
	year := currentYear()

	fmt.Printf("\nРаботники со стажем больше %d лет:\n", threshold)
	found := false
	for _, w := range workers {
		if w.HasExperienceGreaterThan(threshold, year) {
			fmt.Printf("- %s (стаж: %d)\n", w.LastNameAndInitials(), w.ExperienceYears(year))
			found = true
		}
	}

	if !found {
		fmt.Println("Подходящих работников не найдено.")
	}
}
