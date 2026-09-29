# Real-Time Collaborative Task & Status Engine: Backend

REST API for a collaborative task management app, built with **Node.js, Express, MongoDB and Mongoose**. It handles authentication, task assignment, safe concurrent status updates, and database-level metrics.



---

## Features

- JWT authentication (register and login)
- Task creation, assignment and reassignment
- Atomic task status transitions (Pending → In Progress → Completed)
- Optimistic concurrency control using MongoDB `__v`, returning `409 Conflict` on stale updates
- MongoDB aggregation metrics (status breakdown, average completion time per user)
- Per-user rate limit on task creation (max 5 per minute)
- Request payload validation
- Centralized error handling

## Tech Stack

Node.js, Express.js, MongoDB, Mongoose, jsonwebtoken, bcryptjs, express-rate-limit, CORS, dotenv

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20.19+ or 22+ (the project uses Express 5 and Mongoose 9)
- npm
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a MongoDB Atlas connection string
- Git

```bash
node --version
npm --version
mongod --version
git --version
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/Abhishekn1234/tasks_backend.git
cd tasks_backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (next to `package.json`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/collaborative_tasks
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

| Variable | Description |
| --- | --- |
| `PORT` | Port the API listens on (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens. Use a long random value. |
| `CLIENT_URL` | Frontend origin allowed by CORS |

### 4. Start MongoDB

Make sure MongoDB is running before starting the API.

```bash
# Linux (systemd)
sudo systemctl start mongod

# macOS (Homebrew)
brew services start mongodb-community

# Windows: start the "MongoDB" service, or run mongod manually
```

If you use MongoDB Atlas, set `MONGO_URI` to your Atlas connection string instead.

### 5. Run the server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API runs at:

```
http://localhost:5000
```

### 6. Verify it works

```
GET http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "API is running"
}
```

### 7. Connect the frontend

In the frontend project's `.env`, set:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## Project Structure

```text
tasks_backend/
├── src/
│   ├── config/         # db.js (MongoDB connection)
│   ├── controllers/    # authcontrollers, taskcontrollers
│   ├── middleware/     # auth, error, ratelimiter
│   ├── models/         # User, Task
│   ├── routes/         # authroutes, taskroutes
│   ├── services/       # authservices, taskservices
│   ├── utils/          # generateToken
│   ├── validators/     # authvalidator, taskValidator, validate
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
└── package.json
```

---

## API Reference

Base URL: `http://localhost:5000/api`

Protected endpoints require the header:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Authentication

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| GET | `/health` | No | Health check |
| POST | `/auth/register` | No | Create a new user |
| POST | `/auth/login` | No | Log in and receive a JWT |
| GET | `/auth/users` | Yes | List users (for the assignment dropdown) |

Register request:

```json
{
  "name": "Abhishek",
  "email": "abhishek@test.com",
  "password": "123456"
}
```

Login request:

```json
{
  "email": "abhishek@test.com",
  "password": "123456"
}
```

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/tasks` | Get all tasks, newest first |
| POST | `/tasks` | Create a task (rate limited) |
| PATCH | `/tasks/:id/status` | Update task status |
| PATCH | `/tasks/:id/assign` | Assign or reassign a task |
| DELETE | `/tasks/:id` | Delete a task |
| GET | `/tasks/metrics` | Status breakdown and average completion time per user |

Create task:

```json
{
  "title": "Build React frontend",
  "description": "Create collaborative task dashboard",
  "assignedTo": "USER_ID"
}
```

Update status:

```json
{
  "status": "In Progress",
  "version": 0
}
```

Assign task:

```json
{
  "assignedTo": "USER_ID"
}
```

Allowed status transitions:

```text
Pending → In Progress → Completed
```

Anything else is rejected by the server.

---

## Key Behaviours

### Concurrency control

Status updates match on `_id`, `__v` and current `status`, then atomically set the new status and increment `__v`. If two clients send the same update with the same `version`, the first succeeds and the second gets:

```http
409 Conflict
```

### Rate limiting

Each authenticated user can create at most **5 tasks per minute** (keyed by user ID). The 6th request in the window returns `429 Too Many Requests`.

### Error responses

All errors use a consistent shape:

```json
{
  "success": false,
  "message": "Error message"
}
```

| Code | Meaning |
| --- | --- |
| 400 | Validation failed |
| 401 | Missing or invalid token |
| 404 | Resource not found |
| 409 | Stale update (version conflict) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Quick Test with curl

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Evaluator","email":"evaluator@test.com","password":"Test123456"}'

# Login (copy the token from the response)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"evaluator@test.com","password":"Test123456"}'

# List tasks
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Testing concurrency

1. Log in as two users (or use two API clients).
2. Fetch the same task from both, so both see the same `__v`.
3. Send the same status transition from both with that `version`.
4. First request returns `200 OK`, the second returns `409 Conflict`.

### Testing the rate limit

Send 6 `POST /api/tasks` requests within one minute. The 6th returns `429`.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `MongoNetworkError` / connection refused | Start MongoDB, or check `MONGO_URI` |
| CORS errors from the frontend | Set `CLIENT_URL` to the exact frontend origin and restart |
| `401 Unauthorized` | Send `Authorization: Bearer <token>` and check `JWT_SECRET` hasn't changed since the token was issued |
| `EADDRINUSE` (port in use) | Change `PORT` in `.env` or stop the other process |
| Env changes not applied | Restart the server |

---

## Notes

- `.gitignore` already lists `.env` and `node_modules/`, but both were committed before it was added, so git still tracks them. Stop tracking them with:
  ```bash
  git rm -r --cached node_modules .env
  git commit -m "Stop tracking node_modules and .env"
  ```
  Then rotate `JWT_SECRET`, since the old value is in the git history.
- The rate limiter is in-memory, fine for a single instance. Use a shared store like Redis when scaling horizontally.

## License

Created as a take-home coding challenge.
