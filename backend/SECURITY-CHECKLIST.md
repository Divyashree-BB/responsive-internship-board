# Security Checklist — Internship Board

## 1. Security Headers
- [x] Helmet middleware added to Express.
- [x] Security headers verified using `curl -I`.
- [x] Content-Type and clickjacking protection headers checked.

## 2. Rate Limiting
- [x] Express rate limiter configured for API routes.
- [x] Limit configured to 100 requests per 15-minute window.
- [ ] Rate-limit response tested and recorded.

## 3. Input Validation
- [x] Required application fields validated on the server.
- [x] Email format validated.
- [x] Name and cover-letter length limits enforced.
- [x] Internship ID validated.
- [x] Duplicate applications rejected.

## 4. Database Security
- [x] Parameterized SQL queries used for database operations.
- [x] Application data stored in SQLite.
- [x] Duplicate applications prevented using a database constraint.

## 5. Frontend Integration
- [x] Frontend connected to backend API.
- [x] Loading and error states implemented.
- [x] Retry button added.
- [x] Application form added.
- [x] Client-side form validation enabled.
- [x] Submission success and failure messages implemented.

## 6. Testing
- [x] Internship CRUD tests passed.
- [x] Missing application fields test passed.
- [x] Invalid email test passed.
- [x] Nonexistent internship test passed.
- [x] Duplicate application test passed.

## 7. Final Verification
- [x] Rate limiting verified.
- [x] All tests run through `npm test`.
- [ ] Changes committed and pushed to GitHub.

**Note:** Checklist items should only be marked complete after the corresponding checks have actually been performed.