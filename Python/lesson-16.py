class Turtle:
    def __init__(self, x, y, s):
        self.x = x
        self.y = y
        self.s = s

    def go_up(self):
        self.y += self.s

    def go_down(self):
        self.y -= self.s

    def go_left(self):
        self.x -= self.s

    def go_right(self):
        self.x += self.s

    def evolve(self):
        self.s += 1

    def degrade(self):
        if self.s > 1:
            self.s -= 1
        else:
            raise ValueError("Количество клеточек на шаг не может стать меньше или равным 0")

    def count_moves(self, x2, y2):
        x_diff = abs(x2 - self.x)
        y_diff = abs(y2 - self.y)
        return x_diff + y_diff

# Пример использования класса Turtle
turtle = Turtle(0, 0, 1)
turtle.evolve()
turtle.go_up()
turtle.go_right()
turtle.go_right()
turtle.degrade()
print("Минимальное количество действий до точки (3, 2):", turtle.count_moves(3, 2))