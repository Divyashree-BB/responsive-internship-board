
const baseUrl = "http://localhost:3000/api/internships";

async function testAPI() {
    let testId;

    try {
        // 1. POST: Create a temporary test internship
        const createResponse = await fetch(baseUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Test Intern",
                company: "Test Company",
                location: "Bengaluru",
                mode: "Remote",
                description: "Temporary record for API testing",
                apply_url: "https://example.com/apply/test"
            })
        });

        const created = await createResponse.json();
        console.log("\n1. POST - Create internship:", createResponse.status);
        console.log(created);

        if (createResponse.status !== 201) {
            throw new Error("POST test failed");
        }

        testId = created.data.id;

        // 2. PUT: Update the temporary internship
        const updateResponse = await fetch(`${baseUrl}/${testId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Updated Test Intern",
                company: "Test Company",
                location: "Mysuru",
                mode: "Hybrid",
                description: "Updated temporary test record",
                apply_url: "https://example.com/apply/updated"
            })
        });

        const updated = await updateResponse.json();
        console.log("\n2. PUT - Update internship:", updateResponse.status);
        console.log(updated);

        if (updateResponse.status !== 200) {
            throw new Error("PUT test failed");
        }

        // 3. DELETE: Delete only the temporary internship
        const deleteResponse = await fetch(`${baseUrl}/${testId}`, {
            method: "DELETE"
        });

        const deleted = await deleteResponse.json();
        console.log("\n3. DELETE - Remove test internship:", deleteResponse.status);
        console.log(deleted);

        if (deleteResponse.status !== 200) {
            throw new Error("DELETE test failed");
        }

        // 4. GET: Confirm the temporary record no longer exists
        const checkResponse = await fetch(`${baseUrl}/${testId}`);
        const check = await checkResponse.json();

        console.log("\n4. GET deleted record:", checkResponse.status);
        console.log(check);

        if (checkResponse.status !== 404) {
            throw new Error("Deleted record was expected to return 404");
        }

        console.log("\nAll CRUD tests passed!");

    } catch (error) {
        console.error("\nTest error:", error.message);
    }
}

testAPI();
