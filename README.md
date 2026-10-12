## Task 03 — REST API and Persistent Data

### Overview
This task adds a REST API to the Internship Board using Node.js, Express, and SQLite. Internship records are stored persistently in a database.

### Technologies
- Node.js
- Express.js
- SQLite
- better-sqlite3

### Features
- Retrieve all internships with pagination.
- Retrieve an internship by ID.
- Create a new internship.
- Update an existing internship.
- Delete an internship.
- Validate required fields, work modes, URLs, IDs, and pagination parameters.
- Return appropriate HTTP status codes for successful and invalid requests.
- Store internship data in an SQLite database.

### Backend Setup

1. Install Node.js.
2. Open a terminal in the `backend` directory.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Initialize the database and sample records:

   ```bash
   node db.js
   ```

5. Start the API server:

   ```bash
   node server.js
   ```

The server runs at `http://localhost:3000`.

### API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/internships?page=1&limit=2` | List internships with pagination |
| GET | `/api/internships/:id` | Get one internship |
| POST | `/api/internships` | Create an internship |
| PUT | `/api/internships/:id` | Update an internship |
| DELETE | `/api/internships/:id` | Delete an internship |

### Testing

The following tests were completed successfully:
- GET endpoints and pagination.
- POST, PUT, and DELETE operations.
- Validation of missing fields and invalid work modes.
- Invalid IDs and pagination limits.
- Handling requests for nonexistent internships.

### Notes
The included sample internship records and application URLs are for demonstration and testing purposes.