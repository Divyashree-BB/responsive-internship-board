
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// 1. Security headers
// --------------------------------------------------
app.use(helmet());

// --------------------------------------------------
// 2. CORS configuration
// Allow the local frontend to call this backend.
// --------------------------------------------------
app.use(
    cors({
        origin: [
            "http://127.0.0.1:5501",
            "http://localhost:5501"
        ]
    })
);

// --------------------------------------------------
// 3. Request logging
// Log method, path, status code and response time.
// Do not log request bodies or sensitive query values.
// --------------------------------------------------
app.use((req, res, next) => {
    const startTime = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - startTime;

        console.log(
            `[${new Date().toISOString()}] ` +
            `${req.method} ${req.path} ` +
            `Status: ${res.statusCode} ` +
            `Duration: ${duration}ms`
        );
    });

    next();
});

// --------------------------------------------------
// 4. Rate limiting
// Maximum 100 requests per 15 minutes per client.
// --------------------------------------------------
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        error: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);

// --------------------------------------------------
// 5. JSON request body parsing
// Limit request bodies to 10 KB.
// --------------------------------------------------
app.use(express.json({ limit: "10kb" }));

// --------------------------------------------------
// 6. SQLite database connection
// Use the existing database file.
// --------------------------------------------------
const db = new Database(
    path.join(__dirname, "internships.db")
);

// --------------------------------------------------
// 7. Validation helpers
// --------------------------------------------------
const allowedModes = ["Remote", "Hybrid", "On-site"];

const requiredFields = [
    "title",
    "company",
    "location",
    "mode",
    "description",
    "apply_url"
];

function validateInternship(body) {
    if (
        body === null ||
        typeof body !== "object" ||
        Array.isArray(body)
    ) {
        return "Request body must be a JSON object";
    }

    for (const field of requiredFields) {
        if (
            typeof body[field] !== "string" ||
            body[field].trim() === ""
        ) {
            return `${field} is required and must be a non-empty string`;
        }

        if (body[field].trim().length > 2000) {
            return `${field} must not exceed 2000 characters`;
        }
    }

    if (!allowedModes.includes(body.mode)) {
        return "Mode must be Remote, Hybrid, or On-site";
    }

    try {
        const url = new URL(body.apply_url.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
            return "Application URL must use HTTP or HTTPS";
        }
    } catch {
        return "Please provide a valid application URL";
    }

    return null;
}

function getValidId(value) {
    if (!/^[1-9]\d*$/.test(String(value))) {
        return null;
    }

    const id = Number(value);

    return Number.isSafeInteger(id) ? id : null;
}

function getInternshipValues(body) {
    return requiredFields.map(field => body[field].trim());
}

// --------------------------------------------------
// 8. Root endpoint
// --------------------------------------------------
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Internship REST API is running"
    });
});

// --------------------------------------------------
// 9. Health check
// Checks both the API and SQLite database.
// --------------------------------------------------
app.get("/health", (req, res) => {
    try {
        db.prepare("SELECT 1 AS result").get();

        return res.status(200).json({
            success: true,
            status: "healthy",
            service: "Internship REST API",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error(
            `[${new Date().toISOString()}] Health check failed`
        );

        return res.status(503).json({
            success: false,
            status: "unhealthy",
            service: "Internship REST API",
            database: "unavailable"
        });
    }
});

// --------------------------------------------------
// 10. GET: List internships with pagination
// --------------------------------------------------
app.get("/api/internships", (req, res) => {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 5);

    if (
        !Number.isSafeInteger(page) ||
        !Number.isSafeInteger(limit) ||
        page < 1 ||
        limit < 1 ||
        limit > 50
    ) {
        return res.status(400).json({
            success: false,
            error: "Page must be a positive integer. Limit must be between 1 and 50."
        });
    }

    const total = db.prepare(
        "SELECT COUNT(*) AS total FROM internships"
    ).get().total;

    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const internships = db.prepare(`
        SELECT * FROM internships
        ORDER BY id
        LIMIT ? OFFSET ?
    `).all(limit, offset);

    return res.status(200).json({
        success: true,
        pagination: {
            page,
            limit,
            total,
            totalPages
        },
        data: internships
    });
});

// --------------------------------------------------
// 11. GET: Retrieve one internship
// --------------------------------------------------
app.get("/api/internships/:id", (req, res) => {
    const id = getValidId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            error: "ID must be a positive integer"
        });
    }

    const internship = db.prepare(
        "SELECT * FROM internships WHERE id = ?"
    ).get(id);

    if (!internship) {
        return res.status(404).json({
            success: false,
            error: "Internship not found"
        });
    }

    return res.status(200).json({
        success: true,
        data: internship
    });
});

// --------------------------------------------------
// 12. POST: Create an internship
// --------------------------------------------------
app.post("/api/internships", (req, res) => {
    const error = validateInternship(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            error
        });
    }

    const values = getInternshipValues(req.body);

    const result = db.prepare(`
        INSERT INTO internships
        (title, company, location, mode, description, apply_url)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(...values);

    const internship = db.prepare(
        "SELECT * FROM internships WHERE id = ?"
    ).get(result.lastInsertRowid);

    return res.status(201).json({
        success: true,
        message: "Internship created successfully",
        data: internship
    });
});

// --------------------------------------------------
// 13. PUT: Update an existing internship
// --------------------------------------------------
app.put("/api/internships/:id", (req, res) => {
    const id = getValidId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            error: "ID must be a positive integer"
        });
    }

    const existing = db.prepare(
        "SELECT id FROM internships WHERE id = ?"
    ).get(id);

    if (!existing) {
        return res.status(404).json({
            success: false,
            error: "Internship not found"
        });
    }

    const error = validateInternship(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            error
        });
    }

    const values = getInternshipValues(req.body);

    db.prepare(`
        UPDATE internships
        SET title = ?,
            company = ?,
            location = ?,
            mode = ?,
            description = ?,
            apply_url = ?
        WHERE id = ?
    `).run(...values, id);

    const updated = db.prepare(
        "SELECT * FROM internships WHERE id = ?"
    ).get(id);

    return res.status(200).json({
        success: true,
        message: "Internship updated successfully",
        data: updated
    });
});

// --------------------------------------------------
// 14. DELETE: Remove an internship
// --------------------------------------------------
app.delete("/api/internships/:id", (req, res) => {
    const id = getValidId(req.params.id);

    if (id === null) {
        return res.status(400).json({
            success: false,
            error: "ID must be a positive integer"
        });
    }

    const result = db.prepare(
        "DELETE FROM internships WHERE id = ?"
    ).run(id);

    if (result.changes === 0) {
        return res.status(404).json({
            success: false,
            error: "Internship not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Internship deleted successfully",
        id
    });
});

// --------------------------------------------------
// 15. POST: Submit an internship application
// --------------------------------------------------
app.post("/api/applications", (req, res) => {
    const {
        internship_id,
        full_name,
        email,
        phone = "",
        cover_letter
    } = req.body || {};

    const id = getValidId(internship_id ?? "");

    if (id === null) {
        return res.status(400).json({
            success: false,
            error: "A valid internship_id is required"
        });
    }

    if (
        typeof full_name !== "string" ||
        full_name.trim().length < 2 ||
        full_name.trim().length > 100
    ) {
        return res.status(400).json({
            success: false,
            error: "Name must be between 2 and 100 characters"
        });
    }

    if (
        typeof email !== "string" ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return res.status(400).json({
            success: false,
            error: "Please provide a valid email address"
        });
    }

    if (
        typeof phone !== "string" ||
        phone.length > 20
    ) {
        return res.status(400).json({
            success: false,
            error: "Phone number must not exceed 20 characters"
        });
    }

    if (
        typeof cover_letter !== "string" ||
        cover_letter.trim().length < 20 ||
        cover_letter.trim().length > 2000
    ) {
        return res.status(400).json({
            success: false,
            error: "Cover letter must be between 20 and 2000 characters"
        });
    }

    const internship = db.prepare(
        "SELECT id FROM internships WHERE id = ?"
    ).get(id);

    if (!internship) {
        return res.status(404).json({
            success: false,
            error: "Internship not found"
        });
    }

    try {
        const result = db.prepare(`
            INSERT INTO applications
            (internship_id, full_name, email, phone, cover_letter)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            id,
            full_name.trim(),
            email.trim().toLowerCase(),
            phone.trim(),
            cover_letter.trim()
        );

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: {
                id: result.lastInsertRowid,
                internship_id: id
            }
        });
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                success: false,
                error: "You have already applied for this internship"
            });
        }

        console.error(
            `[${new Date().toISOString()}] Application submission failed`
        );

        return res.status(500).json({
            success: false,
            error: "Unable to submit application"
        });
    }
});

// --------------------------------------------------
// 16. Handle unknown routes
// --------------------------------------------------
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        error: "Route not found"
    });
});

// --------------------------------------------------
// 17. Centralized error handler
// --------------------------------------------------
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            success: false,
            error: "Invalid JSON request body"
        });
    }

    if (err.type === "entity.too.large") {
        return res.status(413).json({
            success: false,
            error: "Request body is too large"
        });
    }

    console.error(
        `[${new Date().toISOString()}] ` +
        `Unhandled error on ${req.method} ${req.path}`
    );

    return res.status(500).json({
        success: false,
        error: "Internal server error"
    });
});

// --------------------------------------------------
// 18. Start the server
// --------------------------------------------------
const server = app.listen(PORT, () => {
    console.log(
        `[${new Date().toISOString()}] ` +
        `Server running at http://localhost:${PORT}`
    );
});

// Log server startup errors, such as a port conflict.
server.on("error", (error) => {
    console.error(
        `[${new Date().toISOString()}] Server startup failed: ${error.code}`
    );
    process.exitCode = 1;
});

// Graceful shutdown
function shutdown() {
    console.log("Shutting down server...");

    server.close(() => {
        db.close();
        console.log("Server and database connection closed.");
        process.exit(0);
    });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
