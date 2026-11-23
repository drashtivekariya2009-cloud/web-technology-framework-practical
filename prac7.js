const express = require("express");
const session = require("express-session");

const app = express();
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    throw new Error("SESSION_SECRET environment variable is required");
}

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false
}));

const users = {
    staff: { role: "Staff" },
    student: { role: "Student" }
};

function isValidPassword(password) {
    return typeof password === "string" &&
        password.length >= 8 &&
        password.length <= 12 &&
        /[A-Z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password);
}

// Common CSS and page design
function page(title, content) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <style>
            body {
                font-family: Arial;
                background: #f0f4ff;
                margin: 0;
                color: #24324a;
            }

            nav {
                background: #243b67;
                padding: 18px;
                text-align: center;
            }

            nav a {
                color: white;
                text-decoration: none;
                margin: 15px;
            }

            .box {
                background: white;
                max-width: 600px;
                margin: 45px auto;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 4px 15px #ccd3e5;
            }

            h1 {
                color: #5b55c8;
            }

            input {
                padding: 10px;
                width: 90%;
                margin: 10px 0;
            }

            select {
                padding: 10px;
                width: 95%;
                margin: 10px 0;
            }

            .password-field {
                position: relative;
                width: 95%;
            }

            .password-field input {
                box-sizing: border-box;
                width: 100%;
                padding-right: 48px;
            }

            .password-toggle {
                position: absolute;
                top: 50%;
                right: 8px;
                transform: translateY(-50%);
                background: transparent;
                color: #24324a;
                padding: 6px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }

            .password-toggle svg {
                width: 20px;
                height: 20px;
                fill: none;
                stroke: currentColor;
                stroke-width: 2;
                stroke-linecap: round;
                stroke-linejoin: round;
            }

            button, .btn {
                background: #5b55c8;
                color: white;
                border: none;
                padding: 11px 18px;
                border-radius: 6px;
                cursor: pointer;
                text-decoration: none;
            }

            .card {
                background: #eef0ff;
                padding: 15px;
                margin: 12px 0;
                border-radius: 8px;
            }

            footer {
                text-align: center;
                padding: 20px;
                color: #666;
            }
        </style>
    </head>

    <body>
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/login">Login</a>
        </nav>

        ${content}

        <footer>Central City Library | Learn Something New</footer>
    </body>
    </html>`;
}

// Home route
app.get("/", (req, res) => {
    res.send(page("Library Home", `
        <div class="box">
            <h1>📚 Central City Library</h1>
            <p>Welcome to your digital learning space.</p>
            <p>Explore books, research papers, and study materials in one place.</p>
            <p>Learn, discover, and grow with easy access to knowledge and resources.</p>
            <a class="btn" href="/login">Explore →</a>
        </div>
    `));
});

// About route
app.get("/about", (req, res) => {
    res.send(page("About Library", `
        <div class="box">
            <h1>About Our Library</h1>
            <p>Central City Library is a learning hub built for curiosity, knowledge, and growth.</p>

            <div class="card">
                <strong>📚 Our Mission</strong><br>
                To support students, teachers, and staff with easy access to useful resources.
            </div>

            <div class="card">
                <strong>🔎 What We Offer</strong><br>
                Digital books, research material, and online learning tools for everyday study.
            </div>

            <div class="card">
                <strong>🎯 Why It Matters</strong><br>
                We help learners discover ideas, build confidence, and improve academic performance.
            </div>
        </div>
    `));
});

// Login page
app.get("/login", (req, res) => {
    if (req.session.user) {
        return res.redirect("/dashboard");
    }

    res.send(page("Member Login", `
        <div class="box">
            <h1>Welcome Back! Please Login 🔐</h1>
            <p>Access your library account to continue learning and exploring resources.</p>

            <form action="/login" method="POST" id="login-form">
                <label for="role">Login as</label><br>
                <select name="role" id="role" required>
                    <option value="">Select your role</option>
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                </select><br>

                <label for="identifier" id="identifier-label">Student ID / Username</label><br>
                <input name="identifier" id="identifier" autocomplete="username" required><br>

                <label for="password">Password</label><br>
                <div class="password-field">
                <input
                    name="password"
                    id="password"
                    type="password"
                    autocomplete="current-password"
                    minlength="8"
                    maxlength="12"
                    pattern="(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,12}"
                    title="8-12 characters, at least one uppercase letter, one number, and one special character."
                    required
                >
                <button type="button" class="password-toggle" id="password-toggle" aria-label="Show password" title="Show password">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                        <path class="eye-slash" d="M4 4 20 20"></path>
                    </svg>
                </button>
                </div>
                <p id="password-error" role="alert" style="color: #b42318;" hidden></p>

                <button type="submit">Sign In</button>
            </form>
            <script>
                const roleField = document.getElementById("role");
                const identifierLabel = document.getElementById("identifier-label");
                const passwordField = document.getElementById("password");
                const passwordToggle = document.getElementById("password-toggle");
                const passwordError = document.getElementById("password-error");
                const loginForm = document.getElementById("login-form");
                let passwordRulesShown = false;

                passwordToggle.addEventListener("click", () => {
                    const showingPassword = passwordField.type === "password";
                    passwordField.type = showingPassword ? "text" : "password";
                    passwordToggle.setAttribute("aria-label", showingPassword ? "Hide password" : "Show password");
                    passwordToggle.title = showingPassword ? "Hide password" : "Show password";
                    passwordToggle.querySelector(".eye-slash").style.display = showingPassword ? "none" : "block";
                });

                roleField.addEventListener("change", () => {
                    identifierLabel.textContent = roleField.value === "student"
                        ? "Student ID"
                        : roleField.value === "staff"
                            ? "Username"
                            : "Student ID / Username";
                });

                passwordField.addEventListener("focus", () => {
                    if (!passwordRulesShown) {
                        alert("Password must be 8-12 characters and include at least one uppercase letter, one number, and one special character.");
                        passwordRulesShown = true;
                    }
                });

                function validatePassword() {
                    const valid = passwordField.validity.valid;
                    passwordError.textContent = valid
                        ? ""
                        : "Password must be 8-12 characters and include at least one uppercase letter, one number, and one special character.";
                    passwordError.hidden = valid;
                    return valid;
                }

                passwordField.addEventListener("input", validatePassword);
                loginForm.addEventListener("submit", (event) => {
                    if (!validatePassword()) {
                        event.preventDefault();
                        passwordField.reportValidity();
                    }
                });
            </script>
        </div>
    `));
});

// Check login
app.post("/login", (req, res) => {
    const role = req.body.role;
    const identifier = req.body.identifier;
    const password = req.body.password;
    const user = users[role];
    const expectedIdentifier = role === "student" ? "student" : "staff";

    if (user && identifier === expectedIdentifier && isValidPassword(password)) {
        req.session.user = {
            username: identifier,
            role: user.role
        };
        res.redirect("/dashboard");
    } else {
        res.send(page("Login Failed", `
            <div class="box">
                <h1>Login Failed!</h1>
                <p>Oops! The username or password you entered is incorrect.</p>
                <a class="btn" href="/login">Try Again</a>
            </div>
        `));
    }
});

// Check authentication
function checkLogin(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
}

// Protected dashboard
app.get("/dashboard", checkLogin, (req, res) => {
    const user = req.session.user;

    res.send(page("Dashboard", `
        <div class="box">
            <h1>Welcome, ${user.role}! 🎓</h1>
            <p>Hello ${user.username}, you are successfully logged in.</p>

            <div class="card">📚 Explore Digital Books</div>
            <div class="card">📝 Read Research Papers</div>
            <div class="card">🌐 Access Study Resources</div>

            <a class="btn" href="/logout">Logout</a>
        </div>
    `));
});

// Logout route
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
