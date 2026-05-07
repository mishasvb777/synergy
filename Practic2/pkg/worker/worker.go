package worker

import (
	"errors"
	"fmt"
)

type WORKER struct {
	lastNameAndInitials string
	position            string
	salary              float64
	hireYear            int
}

func NewDefaultWorker() WORKER {
	return WORKER{
		lastNameAndInitials: "Не указано",
		position:            "Не указано",
		salary:              0,
		hireYear:            2000,
	}
}

func NewWorker(lastNameAndInitials, position string, salary float64, hireYear int) (WORKER, error) {
	w := WORKER{
		lastNameAndInitials: lastNameAndInitials,
		position:            position,
	}

	if err := w.SetSalary(salary); err != nil {
		return WORKER{}, err
	}
	if err := w.SetHireYear(hireYear); err != nil {
		return WORKER{}, err
	}

	return w, nil
}

func NewWorkerShort(lastNameAndInitials, position string) WORKER {
	w := NewDefaultWorker()
	w.lastNameAndInitials = lastNameAndInitials
	w.position = position
	return w
}

func (w *WORKER) SetLastNameAndInitials(value string) {
	w.lastNameAndInitials = value
}

func (w *WORKER) SetPosition(value string) {
	w.position = value
}

func (w *WORKER) SetSalary(value float64) error {
	if value < 0 {
		return errors.New("зарплата не может быть отрицательной")
	}
	w.salary = value
	return nil
}

func (w *WORKER) SetHireYear(value int) error {
	if value < 1900 || value > 2100 {
		return errors.New("год поступления на работу вне допустимого диапазона")
	}
	w.hireYear = value
	return nil
}

func (w WORKER) LastNameAndInitials() string {
	return w.lastNameAndInitials
}

func (w WORKER) Position() string {
	return w.position
}

func (w WORKER) Salary() float64 {
	return w.salary
}

func (w WORKER) HireYear() int {
	return w.hireYear
}

func (w WORKER) ExperienceYears(currentYear int) int {
	if currentYear < w.hireYear {
		return 0
	}
	return currentYear - w.hireYear
}

func (w WORKER) HasExperienceGreaterThan(years int, currentYear int) bool {
	return w.ExperienceYears(currentYear) > years
}

func (w WORKER) DisplayString() string {
	return fmt.Sprintf(
		"ФИО: %s, должность: %s, зарплата: %.2f, год приема: %d",
		w.lastNameAndInitials, w.position, w.salary, w.hireYear,
	)
}
