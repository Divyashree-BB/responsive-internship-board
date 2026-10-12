
const baseUrl = "http://localhost:3000/api/internships";

async function check(name, url, options, expectedStatus) {
    const response = await fetch(url, options);
    const result = await response.json();

    console.log(
        `${name}: Expected ${expectedStatus}, Received ${response.status}`
    );

    if (response.status !== expectedStatus) {
        console.log("Unexpected response:", result);
        throw new Error(`${name} failed`);
    }
}

async function testValidation() {
    try {
        // Missing required title
        await check(
            "Missing title",
            baseUrl,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company: "Test Company",
                    location: "Bengaluru",
                    mode: "Remote",
                    description: "Test description",
                    apply_url: "https://example.com/apply"
                })
            },
            400
        );

        // Invalid work mode
        await check(
            "Invalid mode",
            baseUrl,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: "Test Intern",
                    company: "Test Company",
                    location: "Bengaluru",
                    mode: "Online",
                    description: "Test description",
                    apply_url: "https://example.com/apply"
                })
            },
            400
        );

        // Invalid ID format
        await check(
            "Invalid internship ID",
            `${baseUrl}/abc`,
            undefined,
            400
        );

        // Invalid pagination limit
        await check(
            "Invalid pagination limit",
            `${baseUrl}?page=1&limit=100`,
            undefined,
            400
        );

        // Nonexistent internship ID
        await check(
            "Nonexistent internship",
            `${baseUrl}/999999`,
            undefined,
            404
        );

        console.log("\nAll validation tests passed!");

    } catch (error) {
        console.error("\nTest error:", error.message);
    }
}

testValidation();
