package worker

import "testing"

func TestDefaultWorker(t *testing.T) {
	w := NewDefaultWorker()
	if w.LastNameAndInitials() != "Не указано" {
		t.Fatalf("unexpected default name: %s", w.LastNameAndInitials())
	}
	if w.Position() != "Не указано" {
		t.Fatalf("unexpected default position: %s", w.Position())
	}
	if w.Salary() != 0 {
		t.Fatalf("unexpected default salary: %v", w.Salary())
	}
}

func TestNewWorkerAndExperience(t *testing.T) {
	w, err := NewWorker("Иванов И.И.", "Разработчик", 120000, 2019)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if w.ExperienceYears(2026) != 7 {
		t.Fatalf("unexpected experience: %d", w.ExperienceYears(2026))
	}
	if !w.HasExperienceGreaterThan(5, 2026) {
		t.Fatalf("expected experience greater than threshold")
	}
}

func TestInvalidSalary(t *testing.T) {
	if _, err := NewWorker("Петров П.П.", "Аналитик", -1, 2020); err == nil {
		t.Fatal("expected salary validation error")
	}
}

func TestInvalidHireYear(t *testing.T) {
	if _, err := NewWorker("Сидоров С.С.", "Тестировщик", 70000, 1800); err == nil {
		t.Fatal("expected hire year validation error")
	}
}
