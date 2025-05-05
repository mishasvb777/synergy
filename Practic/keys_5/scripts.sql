-- Жанры
CREATE TABLE Genre (
    genre_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Авторы
CREATE TABLE Author (
    author_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(150) NOT NULL,
    birth_date DATE,
    biography TEXT
);

-- Книги
CREATE TABLE Book (
    book_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    publication_year INT,
    isbn VARCHAR(13) UNIQUE,
    author_id INT,
    genre_id INT,
    FOREIGN KEY (author_id) REFERENCES Author(author_id),
    FOREIGN KEY (genre_id) REFERENCES Genre(genre_id)
);

-- Пользователи
CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    registration_date DATE DEFAULT CURRENT_DATE
);

-- Взятые книги
CREATE TABLE BorrowedBook (
    borrow_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    book_id INT,
    borrow_date DATE DEFAULT CURRENT_DATE,
    return_date DATE,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (book_id) REFERENCES Book(book_id)
);

-- Отзывы
CREATE TABLE Review (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    book_id INT,
    text TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    publish_date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (book_id) REFERENCES Book(book_id)
);

-- Индексы
CREATE INDEX idx_user_email ON User(email);
CREATE INDEX idx_book_title ON Book(title);
CREATE INDEX idx_review_rating ON Review(rating);

-- Представления
-- Последние 10 отзывов
CREATE VIEW RecentReviews AS
SELECT u.username, b.title, r.rating, r.publish_date
FROM Review r
JOIN User u ON r.user_id = u.user_id
JOIN Book b ON r.book_id = b.book_id
ORDER BY r.publish_date DESC
LIMIT 10;

-- Скрипты заполнения тестовыми данными
INSERT INTO Genre (name) VALUES ('Фантастика'), ('Драма'), ('Научная литература');

INSERT INTO Author (full_name, birth_date, biography)
VALUES ('Лев Толстой', '1828-09-09', 'Русский писатель...'),
       ('Айзек Азимов', '1920-01-02', 'Американский писатель и популяризатор науки...');

INSERT INTO Book (title, publication_year, isbn, author_id, genre_id)
VALUES ('Анна Каренина', 1877, '1234567890123', 1, 2),
       ('Основание', 1951, '9876543210987', 2, 1);