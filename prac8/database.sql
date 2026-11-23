CREATE DATABASE techmart;

USE techmart;


CREATE TABLE products (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    category VARCHAR(50) NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    quantity INT NOT NULL,

    description VARCHAR(255)

);


INSERT INTO products
(name, category, price, quantity, description)
VALUES
('Laptop', 'Computer', 55000, 10, 'Core i5 Laptop'),
('Smartphone', 'Mobile', 25000, 15, '5G Smartphone'),
('Keyboard', 'Accessories', 1200, 25, 'Wireless Keyboard'),
('Wireless Mouse', 'Accessories', 800, 20, '2.4GHz Wireless Mouse'),
VALUES

(
    'Laptop',
    'Computer',
    55000,
    10,
    'Core i5 Laptop'
),

(
    'Smartphone',
    'Mobile',
    25000,
    15,
    '5G Smartphone'
),

(
    'Keyboard',
    'Accessories',
    1200,
    25,
    'Wireless Keyboard'
);