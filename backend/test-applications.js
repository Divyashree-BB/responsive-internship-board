
const baseUrl = "http://localhost:3000/api/applications";

async function runTest(name, request, expectedStatus) {
    const response = await fetch(baseUrl, request);
    const result = await response.json();

    console.log(`\n${name}`);
    console.log("Expected status:", expectedStatus);
    console.log("Actual status:", response.status);
    console.log("Response:", result);

    if (response.status !== expectedStatus) {
        throw new Error(`${name} FAILED`);
    }

    console.log("Result: PASSED");
}

async function testApplications() {
    try {
        // Test 1: Reject missing required fields
        await runTest(
            "Test 1 - Missing fields",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({})
            },
            400
        );

        // Test 2: Reject invalid email
        await runTest(
            "Test 2 - Invalid email",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    internship_id: 1,
                    full_name: "Test Student",
                    email: "invalid-email",
                    phone: "9876543210",
                    cover_letter:
                        "I am interested in this internship and would like to apply."
                })
            },
            400
        );

        // Test 3: Reject an internship ID that does not exist
        await runTest(
            "Test 3 - Internship not found",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    internship_id: 999999,
                    full_name: "Test Student",
                    email: "missing.test@example.com",
                    phone: "",
                    cover_letter:
                        "I am interested in this internship and would like to apply."
                })
            },
            404
        );

        // Test 4: Reject the duplicate application created earlier
        await runTest(
            "Test 4 - Duplicate application",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    internship_id: 1,
                    full_name: "Test Student",
                    email: "student.test@example.com",
                    phone: "9876543210",
                    cover_letter:
                        "I am interested in this internship and would like to apply."
                })
            },
            409
        );

        console.log("\nAll application validation tests passed!");

    } catch (error) {
        console.error("\nTest suite failed:", error.message);
        process.exitCode = 1;
    }
}

testApplications();
