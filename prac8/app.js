const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();

const PORT = 3000;


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve the HTML page and static assets from this folder
app.use(express.static(__dirname));
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "prac8.html"));
});


// MySQL connection
const db = mysql.createConnection({

    host: "localhost",

    user: "root",

    password: "",

    database: "techmart"
});

let dbAvailable = false;

const defaultProducts = [
    {
        id: 1,
        name: "Laptop",
        category: "Computer",
        price: 55000,
        quantity: 10,
        description: "Core i5 Laptop"
    },
    {
        id: 2,
        name: "Smartphone",
        category: "Mobile",
        price: 25000,
        quantity: 15,
        description: "5G Smartphone"
    },
    {
        id: 3,
        name: "Keyboard",
        category: "Accessories",
        price: 1200,
        quantity: 25,
        description: "Wireless Keyboard"
    },
    {
        id: 4,
        name: "Wireless Mouse",
        category: "Accessories",
        price: 800,
        quantity: 20,
        description: "2.4GHz Wireless Mouse"
    }
];


db.connect((error) => {

    if (error) {

        console.error(
            "Database connection failed:",
            error.message
        );

        dbAvailable = false;
        console.log("Using default product data because MySQL is not available.");

        return;
    }

    dbAvailable = true;
    console.log(
        "MySQL connected successfully!"
    );

    const createTableSql = `
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            category VARCHAR(50) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            quantity INT NOT NULL,
            description VARCHAR(255) DEFAULT ''
        )
    `;

    db.query(createTableSql, (err) => {
        if (err) {
            console.error("Table creation failed:", err.message);
            return;
        }

        const countSql = "SELECT COUNT(*) AS count FROM products";

        db.query(countSql, (countErr, result) => {
            if (countErr) {
                console.error("Count query failed:", countErr.message);
                return;
            }

            if (result[0].count === 0) {
                const seedSql = `
                    INSERT INTO products (name, category, price, quantity, description)
                    VALUES
                        ('Laptop', 'Computer', 55000, 10, 'Core i5 Laptop'),
                        ('Smartphone', 'Mobile', 25000, 15, '5G Smartphone'),
                        ('Keyboard', 'Accessories', 1200, 25, 'Wireless Keyboard'),
                        ('Wireless Mouse', 'Accessories', 800, 20, '2.4GHz Wireless Mouse')
                `;

                db.query(seedSql, (seedErr) => {
                    if (seedErr) {
                        console.error("Seed insert failed:", seedErr.message);
                    } else {
                        console.log("Default products inserted into database.");
                    }
                });
            }
        });
    });
});


// Sanitization
function sanitizeInput(value) {

    if (typeof value !== "string") {
        return "";
    }

    return value
        .trim()
        .replace(/[<>]/g, "");
}


// Validation
function validateProduct(data) {

    const name =
        sanitizeInput(data.name);

    const category =
        sanitizeInput(data.category);

    const description =
        sanitizeInput(data.description);


    const price =
        Number(data.price);

    const quantity =
        Number(data.quantity);


    const errors = [];


    if (!name) {

        errors.push(
            "Product name is required."
        );

    } else if (
        name.length < 2 ||
        name.length > 100
    ) {

        errors.push(
            "Product name must be between 2 and 100 characters."
        );
    }


    if (!category) {

        errors.push(
            "Category is required."
        );

    } else if (
        category.length > 50
    ) {

        errors.push(
            "Category cannot exceed 50 characters."
        );
    }


    if (
        data.price === "" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {

        errors.push(
            "Price must be greater than 0."
        );
    }


    if (
        data.quantity === "" ||
        !Number.isInteger(quantity) ||
        quantity < 0
    ) {

        errors.push(
            "Quantity must be a whole number and cannot be negative."
        );
    }


    if (description.length > 255) {

        errors.push(
            "Description cannot exceed 255 characters."
        );
    }


    return {

        errors,

        product: {
            name,
            category,
            price,
            quantity,
            description
        }

    };
}


// =============================
// READ
// =============================

app.get(
    "/api/products",
    (req, res) => {

        if (!dbAvailable) {
            return res.json(defaultProducts);
        }

        const sql = `
            SELECT
                id,
                name,
                category,
                price,
                quantity,
                description
            FROM products
            ORDER BY id DESC
        `;


        db.query(
            sql,
            (error, results) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({
                        message:
                            "Unable to fetch products."
                    });
                }


                res.json(results);
            }
        );
    }
);


// =============================
// CREATE
// =============================

app.post(
    "/api/products",
    (req, res) => {

        const {
            errors,
            product
        } = validateProduct(req.body);


        if (errors.length > 0) {

            return res.status(400).json({

                message:
                    errors.join(" ")

            });
        }

        if (!dbAvailable) {
            const nextId = defaultProducts.length ? Math.max(...defaultProducts.map(item => item.id)) + 1 : 1;
            const newProduct = {
                id: nextId,
                ...product
            };
            defaultProducts.unshift(newProduct);

            return res.status(201).json({
                message: "Product added successfully!",
                id: nextId
            });
        }


        const sql = `
            INSERT INTO products
            (
                name,
                category,
                price,
                quantity,
                description
            )
            VALUES (?, ?, ?, ?, ?)
        `;


        db.execute(

            sql,

            [
                product.name,
                product.category,
                product.price,
                product.quantity,
                product.description
            ],

            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({

                        message:
                            "Unable to add product."

                    });
                }


                res.status(201).json({

                    message:
                        "Product added successfully!",

                    id:
                        result.insertId

                });

            }
        );
    }
);


// =============================
// UPDATE
// =============================

app.put(
    "/api/products/:id",
    (req, res) => {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid product ID."

            });
        }


        const {
            errors,
            product
        } = validateProduct(req.body);


        if (errors.length > 0) {

            return res.status(400).json({

                message:
                    errors.join(" ")

            });
        }

        if (!dbAvailable) {
            const index = defaultProducts.findIndex(item => Number(item.id) === id);
            if (index === -1) {
                return res.status(404).json({ message: "Product not found." });
            }

            defaultProducts[index] = { ...defaultProducts[index], ...product };
            return res.json({ message: "Product updated successfully!" });
        }


        const sql = `
            UPDATE products
            SET
                name = ?,
                category = ?,
                price = ?,
                quantity = ?,
                description = ?
            WHERE id = ?
        `;


        db.execute(

            sql,

            [
                product.name,
                product.category,
                product.price,
                product.quantity,
                product.description,
                id
            ],

            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({

                        message:
                            "Unable to update product."

                    });
                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Product not found."

                    });
                }


                res.json({

                    message:
                        "Product updated successfully!"

                });

            }
        );
    }
);


// =============================
// DELETE
// =============================

app.delete(
    "/api/products/:id",
    (req, res) => {

        const id =
            Number(req.params.id);


        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid product ID."

            });
        }

        if (!dbAvailable) {
            const index = defaultProducts.findIndex(item => Number(item.id) === id);
            if (index === -1) {
                return res.status(404).json({ message: "Product not found." });
            }

            defaultProducts.splice(index, 1);
            return res.json({ message: "Product deleted successfully!" });
        }


        const sql =
            "DELETE FROM products WHERE id = ?";


        db.execute(

            sql,

            [id],

            (error, result) => {

                if (error) {

                    console.error(error);

                    return res.status(500).json({

                        message:
                            "Unable to delete product."

                    });
                }


                if (
                    result.affectedRows === 0
                ) {

                    return res.status(404).json({

                        message:
                            "Product not found."

                    });
                }


                res.json({

                    message:
                        "Product deleted successfully!"

                });

            }
        );
    }
);


// Start server
app.listen(
    PORT,
    () => {

        console.log(
            `TechMart running at http://localhost:${PORT}`
        );

    }
);