
const API_URL = "http://localhost:3000/api";

// HTML elements
const searchInput = document.getElementById("search");
const domainFilter = document.getElementById("domain-filter");
const internshipList = document.getElementById("internship-list");
const emptyState = document.getElementById("empty-state");
const errorState = document.getElementById("error-state");
const errorMessage = document.getElementById("error-message");
const loadingState = document.getElementById("loading-state");
const retryButton = document.getElementById("retry-button");

const applicationSection = document.getElementById("application-section");
const applicationForm = document.getElementById("application-form");
const internshipIdInput = document.getElementById("internship-id");
const selectedInternship = document.getElementById("selected-internship");
const applicationMessage = document.getElementById("application-message");
const submitButton = document.getElementById("submit-application");
const cancelButton = document.getElementById("cancel-application");

let internships = [];

// Load internships from the backend API
async function loadInternships() {
    loadingState.hidden = false;
    errorState.hidden = true;
    emptyState.hidden = true;
    internshipList.replaceChildren();

    try {
        const response = await fetch(`${API_URL}/internships`);

        if (!response.ok) {
            throw new Error("Unable to load internships.");
        }

        const result = await response.json();

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error("The server returned an unexpected response.");
        }

        internships = result.data;

        createDomainOptions();
        filterInternships();
    } catch (error) {
        console.error("Loading error:", error);
        internships = [];
        internshipList.replaceChildren();
        errorMessage.textContent =
            "Could not connect to the internship server. Check that the backend is running, then try again.";
        errorState.hidden = false;
    } finally {
        loadingState.hidden = true;
    }
}

// Create domain filter options using the internship titles
function createDomainOptions() {
    const previousValue = domainFilter.value;
    const domains = [...new Set(
        internships.map(internship => internship.title)
    )];

    domainFilter.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "All Domains";
    domainFilter.appendChild(allOption);

    domains.forEach(domain => {
        const option = document.createElement("option");
        option.value = domain;
        option.textContent = domain;
        domainFilter.appendChild(option);
    });

    if (domains.includes(previousValue)) {
        domainFilter.value = previousValue;
    }
}

// Display internship cards
function displayInternships(items) {
    internshipList.replaceChildren();
    emptyState.hidden = items.length !== 0;

    items.forEach(internship => {
        const card = document.createElement("article");
        card.className = "internship-card";

        const title = document.createElement("h3");
        title.textContent = internship.title;

        const company = document.createElement("p");
        company.className = "internship-domain";
        company.textContent = internship.company;

        const info = document.createElement("p");
        info.className = "internship-info";
        info.textContent = `${internship.mode} • ${internship.location}`;

        const description = document.createElement("p");
        description.textContent = internship.description;

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.className = "view-button";
        viewButton.textContent = "View Details";

        viewButton.addEventListener("click", () => {
            alert(
                `${internship.title}\n\n` +
                `Company: ${internship.company}\n` +
                `Mode: ${internship.mode}\n` +
                `Location: ${internship.location}\n\n` +
                internship.description
            );
        });

        const applyButton = document.createElement("button");
        applyButton.type = "button";
        applyButton.className = "view-button";
        applyButton.textContent = "Apply Now";

        applyButton.addEventListener("click", () => {
            openApplicationForm(internship);
        });

        card.append(
            title,
            company,
            info,
            description,
            viewButton,
            applyButton
        );

        internshipList.appendChild(card);
    });
}

// Search and filter internships
function filterInternships() {
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedDomain = domainFilter.value;

    const filtered = internships.filter(internship => {
        const searchableText = [
            internship.title,
            internship.company,
            internship.location,
            internship.mode,
            internship.description
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchText);
        const matchesDomain =
            selectedDomain === "all" ||
            internship.title === selectedDomain;

        return matchesSearch && matchesDomain;
    });

    displayInternships(filtered);
}

// Open the application form
function openApplicationForm(internship) {
    applicationForm.reset();
    applicationMessage.textContent = "";
    internshipIdInput.value = internship.id;
    selectedInternship.textContent =
        `Applying for: ${internship.title} at ${internship.company}`;

    applicationSection.hidden = false;
    applicationSection.scrollIntoView({ behavior: "smooth" });
    document.getElementById("full-name").focus();
}

// Close the application form
cancelButton.addEventListener("click", () => {
    applicationSection.hidden = true;
    applicationMessage.textContent = "";
});

// Submit an application to the backend
applicationForm.addEventListener("submit", async event => {
    event.preventDefault();
    applicationMessage.textContent = "";

    if (!applicationForm.reportValidity()) {
        return;
    }

    const payload = {
        internship_id: Number(internshipIdInput.value),
        full_name: document.getElementById("full-name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        cover_letter: document.getElementById("cover-letter").value.trim()
    };

    if (payload.full_name.length < 2) {
        applicationMessage.textContent =
            "Please enter a name with at least 2 characters.";
        return;
    }

    if (
        payload.cover_letter.length < 20 ||
        payload.cover_letter.length > 2000
    ) {
        applicationMessage.textContent =
            "Your cover letter must contain 20 to 2000 characters.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";

    try {
        const response = await fetch(`${API_URL}/applications`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Application submission failed.");
        }

        applicationMessage.textContent =
            "Success! Your application has been submitted.";
        applicationMessage.setAttribute("role", "status");
        applicationForm.reset();
    } catch (error) {
        console.error("Application error:", error);
        applicationMessage.textContent =
            error.message || "Unable to submit your application. Please try again.";
        applicationMessage.setAttribute("role", "alert");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit Application";
    }
});

// Event listeners
searchInput.addEventListener("input", filterInternships);
domainFilter.addEventListener("change", filterInternships);
retryButton.addEventListener("click", loadInternships);

// Start the application
loadInternships();
