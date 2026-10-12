
const Database = require("better-sqlite3");

// Create or open the database file
const db = new Database("internships.db");

// Create the internships table
db.exec(`
    CREATE TABLE IF NOT EXISTS internships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        mode TEXT NOT NULL
            CHECK (mode IN ('Remote', 'Hybrid', 'On-site')),
        description TEXT NOT NULL,
        apply_url TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
`);

// Insert sample records only if the table is empty
const count = db.prepare(
    "SELECT COUNT(*) AS total FROM internships"
).get();

if (count.total === 0) {
    const insert = db.prepare(`
        INSERT INTO internships
        (title, company, location, mode, description, apply_url)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    const seed = db.transaction(() => {
        insert.run(
            "Frontend Developer Intern",
            "DemoTech",
            "Bengaluru",
            "Hybrid",
            "Help build and improve web interfaces.",
            "https://example.com/apply/frontend"
        );

        insert.run(
            "Python Developer Intern",
            "CodeWorks",
            "Remote",
            "Remote",
            "Assist with Python development and testing.",
            "https://example.com/apply/python"
        );

        insert.run(
            "Data Analyst Intern",
            "DataLabs",
            "Mysuru",
            "On-site",
            "Work with datasets and prepare reports.",
            "https://example.com/apply/data"
        );

        insert.run(
            "Java Developer Intern",
            "SoftSolutions",
            "Bengaluru",
            "On-site",
            "Learn Java application development.",
            "https://example.com/apply/java"
        );

        insert.run(
            "UI UX Design Intern",
            "CreativeStudio",
            "Remote",
            "Remote",
            "Help design user-friendly interfaces.",
            "https://example.com/apply/design"
        );
    });

    seed();
    console.log("Sample internship records inserted.");
} else {
    console.log("Existing internship records preserved.");
}

console.log("Database initialized successfully.");

db.close();
