
// ========================================
// Get HTML elements
// ========================================

const searchInput = document.getElementById("search");

const domainFilter = document.getElementById("domain-filter");

const internshipList = document.getElementById("internship-list");

const emptyState = document.getElementById("empty-state");

const errorState = document.getElementById("error-state");


// ========================================
// Store internship data
// ========================================

let internships = [];


// ========================================
// Load internship data
// ========================================

async function loadInternships() {

    try {

        const response = await fetch("internships.json");

        if (!response.ok) {
            throw new Error("Unable to load internship data");
        }

        const data = await response.json();

        internships = data.internships;

        createDomainOptions();

        displayInternships(internships);

    } catch (error) {

        console.error(error);

        internshipList.innerHTML = "";

        errorState.hidden = false;

    }
}


// ========================================
// Create domain filter options
// ========================================

function createDomainOptions() {

    const domains = [];

    internships.forEach(function (internship) {

        if (!domains.includes(internship.domain)) {

            domains.push(internship.domain);

        }

    });


    domains.forEach(function (domain) {

        const option = document.createElement("option");

        option.value = domain;

        option.textContent = domain;

        domainFilter.appendChild(option);

    });

}


// ========================================
// Display internship cards
// ========================================

function displayInternships(internshipData) {

    internshipList.innerHTML = "";

    emptyState.hidden = true;


    if (internshipData.length === 0) {

        emptyState.hidden = false;

        return;

    }


    internshipData.forEach(function (internship) {

        const card = document.createElement("article");

        card.className = "internship-card";


        // Internship title

        const title = document.createElement("h3");

        title.textContent = internship.title;


        // Domain

        const domain = document.createElement("p");

        domain.className = "internship-domain";

        domain.textContent = internship.domain;


        // Location and mode

        const info = document.createElement("p");

        info.className = "internship-info";

        info.textContent =
            `${internship.mode} • ${internship.location}`;


        // Skills container

        const skillsContainer = document.createElement("div");

        skillsContainer.className = "skills";


        internship.skills.forEach(function (skill) {

            const skillElement = document.createElement("span");

            skillElement.className = "skill";

            skillElement.textContent = skill;

            skillsContainer.appendChild(skillElement);

        });


        // Number of openings

        const openings = document.createElement("p");

        openings.className = "openings";

        openings.textContent =
            `${internship.openings} opening${internship.openings === 1 ? "" : "s"}`;


        // View button

        const button = document.createElement("button");

        button.className = "view-button";

        button.type = "button";

        button.textContent = "View Details";


        button.addEventListener("click", function () {

            alert(
                `${internship.title}\n\n` +
                `Domain: ${internship.domain}\n` +
                `Mode: ${internship.mode}\n` +
                `Location: ${internship.location}\n` +
                `Skills: ${internship.skills.join(", ")}\n` +
                `Openings: ${internship.openings}`
            );

        });


        // Add elements to card

        card.appendChild(title);

        card.appendChild(domain);

        card.appendChild(info);

        card.appendChild(skillsContainer);

        card.appendChild(openings);

        card.appendChild(button);


        // Add card to page

        internshipList.appendChild(card);

    });

}


// ========================================
// Filter internships
// ========================================

function filterInternships() {

    const searchText =
        searchInput.value.toLowerCase().trim();

    const selectedDomain =
        domainFilter.value;


    const filteredInternships = internships.filter(function (internship) {

        const searchableText = (

            internship.title + " " +

            internship.domain + " " +

            internship.location + " " +

            internship.mode + " " +

            internship.skills.join(" ")

        ).toLowerCase();


        const matchesSearch =
            searchableText.includes(searchText);


        const matchesDomain =
            selectedDomain === "all" ||
            internship.domain === selectedDomain;


        return matchesSearch && matchesDomain;

    });


    displayInternships(filteredInternships);

}


// ========================================
// Search event
// ========================================

searchInput.addEventListener(
    "input",
    filterInternships
);


// ========================================
// Domain filter event
// ========================================

domainFilter.addEventListener(
    "change",
    filterInternships
);


// ========================================
// Start the application
// ========================================

loadInternships();
