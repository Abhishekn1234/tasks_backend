# Real-Time Collaborative Task & Status Engine

A full-stack collaborative task management application built with **Node.js, Express, MongoDB, Mongoose, React, and Vite**.

The application allows multiple authenticated users to create, assign, update, and manage tasks while handling concurrent status updates safely. The frontend uses optimistic UI updates, rollback on failed requests, toast notifications, and polling to simulate real-time synchronization between multiple clients.

---

## Features

### Backend

* Node.js and Express REST API
* MongoDB with Mongoose
* JWT authentication
* User registration and login
* Task creation
* Task assignment and reassignment
* Atomic task status transitions
* Optimistic concurrency control using MongoDB `__v`
* `409 Conflict` response for stale concurrent updates
* MongoDB aggregation-based metrics
* Status breakdown reporting
* Average completion time per user
* Per-user task creation rate limiting
* Maximum 5 task creation requests per minute
* Request payload validation
* Centralized error handling

### Frontend

* React with Vite
* React Router
* Axios API integration
* Responsive modern UI
* Login and registration pages
* Password visibility toggle
* Task creation form
* Task cards
* Optimistic status updates
* Automatic rollback when a status update fails
* Configurable 50% simulated request failure
* Toast notifications
* 10-second task polling
* Polling cleanup using `useEffect`
* Task metrics dashboard

---

## Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JSON Web Token
* bcryptjs
* express-rate-limit
* CORS
* dotenv

### Frontend

* React
* Vite
* Axios
* React Router
* React Hot Toast
* Lucide React
* CSS

---

## Project Structure

```text
real-time-collaborative-task-engine/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── ratelimiter.js
│   │   │   └── validate.js
│   │   │
│   │   ├── models/
│   │   │   ├── Task.js
│   │   │   └── User.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   └── taskRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── taskService.js
│   │   │
│   │   ├── utils/
│   │   │   └── generateToken.js
│   │   │
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   └── taskValidator.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── authApi.js
│   │   │   └── taskApi.js
│   │   │
│   │   ├── components/
│   │   │   ├── Metrics.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskList.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   │
│   │   ├── utils/
│   │   │   └── auth.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env
│   └── package.json
│
└── README.md
```

---

# Prerequisites

Make sure the following are installed:

* Node.js
* npm
* MongoDB
* Git

Check the installations:

```bash
node --version
npm --version
mongod --version
git --version
```

MongoDB must be running before starting the backend.

---

# Backend Setup

Open a terminal in the project root.

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/collaborative_tasks
JWT_SECRET=your_super_secret_jwt_key_12345
CLIENT_URL=http://localhost:5173
```

Start the development server:

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

Backend will run at:

```text
http://localhost:5000
```

Test the API:

```text
GET http://localhost:5000/
```

Expected response:

```json
{
  "success": true,
  "message": "Real-Time Collaborative Task API"
}
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000/api

```

Start the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

# Environment Variables

## Backend

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/collaborative_tasks
JWT_SECRET=your_super_secret_jwt_key_12345
CLIENT_URL=http://localhost:5173
```

## Frontend

```env
VITE_API_URL=http://localhost:5000/api

```

`VITE_SIMULATE_FAILURE` controls the frontend failure simulation.

```text
true
```

enables a random 50% simulated status-update failure.

```text
false
```

disables the simulation and allows requests to reach the backend normally.

---

# Authentication

The application uses JWT-based authentication.

After successful registration or login, the backend returns a JWT token.

The frontend stores the token and authenticated user information locally.

Protected API requests send:

```http
Authorization: Bearer TOKEN
```

Authentication middleware verifies the token before allowing access to protected task endpoints.

---

# API Endpoints

Base URL:

```text
http://localhost:5000/api
```

## Authentication

### Register

```http
POST /auth/register
```

Request:

```json
{
  "name": "Abhishek",
  "email": "abhishek@test.com",
  "password": "123456"
}
```

Response:

```json
{
  "success": true,
  "message": "Registration successful",
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "Abhishek",
    "email": "abhishek@test.com"
  }
}
```

---

### Login

```http
POST /auth/login
```

Request:

```json
{
  "email": "abhishek@test.com",
  "password": "123456"
}
```

---

### Get Users

```http
GET /auth/users
```

Requires authentication.

This endpoint is used by the task creation form to populate the assignment dropdown.

---

# Tasks

All task endpoints require authentication.

## Get Tasks

```http
GET /tasks
```

Returns all tasks sorted by newest creation time.

---

## Create Task

```http
POST /tasks
```

Request:

```json
{
  "title": "Build React frontend",
  "description": "Create collaborative task dashboard",
  "assignedTo": "USER_ID"
}
```

The endpoint is protected by a rate limiter.

### Rate Limit

Each authenticated user can create a maximum of:

```text
5 requests per minute
```

The sixth request within the same one-minute window returns:

```http
429 Too Many Requests
```

---

## Update Task Status

```http
PATCH /tasks/:id/status
```

Request:

```json
{
  "status": "In Progress",
  "version": 0
}
```

Allowed status transitions:

```text
Pending
   ↓
In Progress
   ↓
Completed
```

Invalid transitions are rejected by the backend.

---

## Assign/Reassign Task

```http
PATCH /tasks/:id/assign
```

Request:

```json
{
  "assignedTo": "USER_ID"
}
```

The task is reassigned to the specified user.

---

## Delete Task

```http
DELETE /tasks/:id
```

Deletes the specified task.

---

# Metrics

## Get Metrics

```http
GET /tasks/metrics
```

Returns:

* Task count grouped by status
* Average completion time per assigned user
* Number of completed tasks per user

Example response structure:

```json
{
  "success": true,
  "metrics": {
    "statusBreakdown": [
      {
        "status": "Completed",
        "count": 5
      },
      {
        "status": "In Progress",
        "count": 2
      },
      {
        "status": "Pending",
        "count": 3
      }
    ],
    "averageCompletionTime": [
      {
        "userId": "USER_ID",
        "userName": "Abhishek",
        "email": "abhishek@test.com",
        "averageCompletionTimeMs": 3600000,
        "completedTaskCount": 2
      }
    ]
  }
}
```

---

# Concurrency Control

One of the main requirements of this challenge is preventing race conditions when multiple users update the same task simultaneously.

The task schema uses Mongoose optimistic concurrency:

```js
optimisticConcurrency: true
```

The status update also explicitly uses the MongoDB version key:

```text
__v
```

The update query matches:

```text
_id
__v
status
```

and increments the version atomically:

```text
$inc:
{
  __v: 1
}
```

The important part of the update is conceptually:

```text
Find task where:

_id = requested task
__v = client's version
status = current status

Then atomically:

status = new status
__v = __v + 1
```

## Example

Suppose two users retrieve the same task:

```text
Status: Pending
__v: 0
```

Both users attempt:

```text
Pending → In Progress
```

Both send:

```json
{
  "status": "In Progress",
  "version": 0
}
```

The first request succeeds:

```text
Pending → In Progress
__v: 0 → 1
```

The second request still expects:

```text
__v = 0
```

but the database now contains:

```text
__v = 1
```

Therefore the second atomic update matches no document.

The API returns:

```http
409 Conflict
```

with a message indicating that the task was modified by another user.

This prevents stale clients from silently overwriting another user's update.

---

# Why the Status Transition Is Safe

The backend does not rely only on frontend restrictions.

The backend maintains the allowed transition map:

```text
Pending → In Progress
In Progress → Completed
Completed → no further transition
```

Therefore even if a client manually sends an invalid request, the server validates the current state and rejects invalid transitions.

The frontend is only responsible for providing the UI control.

The backend remains the source of truth.

---

# Optimistic UI

The frontend updates the task card immediately before waiting for the backend response.

For example:

```text
Current:

Pending

User clicks:

Move to In Progress

Immediately:

In Progress
```

The API request is then sent to the backend.

If the request succeeds:

```text
Optimistic state
       ↓
Server response
       ↓
Final server task
```

The frontend replaces the optimistic task with the server response.

---

# Rollback on Failure

If the request fails, the frontend restores the previous task state.

Flow:

```text
Pending
   ↓
User clicks
   ↓
UI immediately shows In Progress
   ↓
Request fails
   ↓
UI restores Pending
   ↓
Toast notification
```

This prevents the interface from displaying a state that was not successfully persisted.

---

# Simulated 50% Failure

The challenge requires demonstrating error recovery.

The frontend can randomly simulate a failed status request:

```js
const shouldFail =
  Math.random() < 0.5;

if (shouldFail) {
  throw new Error(
    "Simulated request failure"
  );
}
```

With:

```env
VITE_SIMULATE_FAILURE=true
```

approximately half of the status-update attempts will fail.

The optimistic UI will then roll back and display a toast message.

To disable simulation:

```env
VITE_SIMULATE_FAILURE=false
```

After changing a Vite environment variable, restart the frontend development server.

---

# Polling and Synchronization

The dashboard polls the task endpoint every 10 seconds:

```text
GET /api/tasks
```

This simulates real-time synchronization between multiple clients without requiring WebSockets.

The polling flow is:

```text
Dashboard loads
      ↓
GET /api/tasks
      ↓
Display tasks
      ↓
Wait 10 seconds
      ↓
GET /api/tasks
      ↓
Update state
      ↓
Repeat
```

The polling interval is cleaned up when the dashboard component unmounts:

```js
return () => {
  clearInterval(interval);
};
```

This prevents unnecessary background intervals after leaving the dashboard.

---

# MongoDB Aggregation

The metrics endpoint performs its calculations inside MongoDB rather than retrieving all tasks and processing them in Node.js.

The aggregation uses:

```text
$facet
$group
$match
$project
$subtract
$avg
$lookup
$unwind
$sort
```

## Status Breakdown

Tasks are grouped by:

```text
status
```

and counted using:

```text
$sum: 1
```

## Average Completion Time

For completed tasks:

```text
completedAt - createdAt
```

is calculated using MongoDB's:

```text
$subtract
```

The results are then grouped by:

```text
assignedTo
```

and averaged using:

```text
$avg
```

User information is retrieved using:

```text
$lookup
```

This keeps reporting work at the database level.

---

# Validation

The backend validates incoming request payloads before passing them to the service layer.

Validation is applied to:

* Registration
* Login
* Task creation
* Status updates
* Task reassignment

Examples of validation rules include:

```text
Name must contain at least 2 characters
Email must be valid
Password must contain at least 6 characters
Task title must contain at least 3 characters
assignedTo is required
Status must be a supported status
Version must be a valid non-negative integer
```

Invalid requests return:

```http
400 Bad Request
```

---

# Error Handling

The application uses centralized Express error handling.

Common responses include:

```text
400 Bad Request
401 Unauthorized
404 Not Found
409 Conflict
429 Too Many Requests
500 Internal Server Error
```

The API returns JSON responses with a consistent structure:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# Testing the Application

## 1. Register a user

```http
POST /api/auth/register
```

```json
{
  "name": "Evaluator",
  "email": "evaluator@test.com",
  "password": "Test123456"
}
```

---

## 2. Login

```http
POST /api/auth/login
```

```json
{
  "email": "evaluator@test.com",
  "password": "Test123456"
}
```

Copy the returned JWT token.

---

## 3. Create multiple users

Register at least two users so that task assignment and concurrent access can be tested.

---

## 4. Create a task

Use:

```http
POST /api/tasks
```

with:

```json
{
  "title": "Test collaborative task",
  "description": "Test concurrent status updates",
  "assignedTo": "USER_ID"
}
```

---

## 5. Test status transitions

Initial:

```text
Pending
```

Update:

```text
Pending → In Progress
```

Then:

```text
In Progress → Completed
```

Attempting to move a completed task further should be rejected.

---

# Concurrency Test

To verify optimistic concurrency control:

1. Login from two browser sessions or API clients.
2. Retrieve the same task from both sessions.
3. Both clients should have the same `__v`.
4. Submit the same status transition from both clients.
5. The first request should succeed.
6. The stale request should receive `409 Conflict`.

Example:

```text
Initial:

Status: Pending
__v: 0

Client A:
version: 0
Pending → In Progress

Client B:
version: 0
Pending → In Progress
```

Expected:

```text
Client A → 200 OK
Client B → 409 Conflict
```

This demonstrates the concurrency protection implemented by the backend.

---

# Rate Limit Test

The task creation endpoint allows:

```text
5 requests/minute/user
```

Send six task creation requests within one minute.

Expected:

```text
Request 1 → Success
Request 2 → Success
Request 3 → Success
Request 4 → Success
Request 5 → Success
Request 6 → 429 Too Many Requests
```

The rate limiter uses the authenticated user's ID as the primary rate-limit key.

---

# Optimistic UI Test

Set:

```env

```

Restart the frontend:

```bash
npm run dev
```

Move a task from:

```text
Pending
```

to:

```text
In Progress
```

The UI should change immediately.

When the simulated request fails:

```text
In Progress
```

should roll back to:

```text
Pending
```

and a toast should appear.

When the request succeeds, the server response becomes the final state.

---

# Test Credentials

For evaluation, create and provide a dedicated test account.

Example:

```text
Email: evaluator@test.com
Password: Test123456
```

Additional users can be created through the registration page for testing task assignment and concurrent updates.

Do not commit real personal credentials or production secrets to the repository.

---

# Trade-offs

## Polling instead of WebSockets

The challenge allows polling or a real-time mechanism.

Polling every 10 seconds was selected because it provides a simple synchronization mechanism while keeping the implementation within the requested 3–4 hour scope.

A production implementation could use WebSockets or Server-Sent Events for lower-latency synchronization.

## JWT stored on the client

JWT authentication keeps the implementation simple for the take-home challenge.

For a production application, token storage and refresh-token handling would require additional security considerations.

## In-memory rate limiter

The current rate limiter uses `express-rate-limit`.

For a single-instance development application this is sufficient.

For a horizontally scaled production deployment, a shared store such as Redis would be more appropriate so that limits are consistent across application instances.

## Optimistic UI

Optimistic updates provide a faster user experience but require rollback handling when the server rejects the update.

The implementation keeps the previous task state and restores it when the request fails.

## MongoDB aggregation

Metrics are calculated using MongoDB aggregation instead of loading all tasks into Node.js memory.

This reduces application-side processing and satisfies the database-level reporting requirement.

---

# Future Improvements

Possible production enhancements include:

* WebSocket-based real-time task synchronization
* Redis-backed distributed rate limiting
* Refresh tokens
* Role-based authorization
* Task pagination
* Task filtering and searching
* More detailed audit logs
* Conflict-resolution UI
* Automated backend tests
* Automated frontend tests
* Docker support
* CI/CD pipeline
* Production monitoring and logging

---

# Running the Complete Application

Start MongoDB first.

Then open two terminals.

### Terminal 1

```bash
cd backend
npm install
npm run dev
```

### Terminal 2

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Register or login and start managing tasks.

---

# GitHub Submission Checklist

Before submitting the repository, verify:

* [ ] Backend starts successfully
* [ ] Frontend starts successfully
* [ ] MongoDB connection works
* [ ] Registration works
* [ ] Login works
* [ ] Task creation works
* [ ] Task assignment works
* [ ] Pending → In Progress works
* [ ] In Progress → Completed works
* [ ] Invalid transitions are rejected
* [ ] Concurrent updates produce a `409 Conflict`
* [ ] Metrics endpoint works
* [ ] Metrics use MongoDB aggregation
* [ ] Rate limit returns `429` after 5 requests/minute
* [ ] Optimistic UI updates immediately
* [ ] Failed optimistic updates roll back
* [ ] Toast notification appears after failure
* [ ] 10-second polling works
* [ ] Polling interval is cleaned up
* [ ] Test credentials are documented
* [ ] `.env` is in `.gitignore`
* [ ] No passwords or secrets are committed
* [ ] `node_modules` is not committed
* [ ] Repository is public
* [ ] README is included
* [ ] GitHub repository contains both `backend` and `frontend`

---

# License

This project was created as a take-home coding challenge.

```

One important final check before pushing: make sure your actual filenames match the README imports, especially **`taskApi.js` vs `taskapi.js`** and **`TaskList.jsx` vs `TasksList.jsx`**.
```
#   t a s k s _ b a c k e n d  
 