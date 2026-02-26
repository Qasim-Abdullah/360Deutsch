# AILand API – Postman Testing Guide

This guide explains how to test all API routes in Postman, starting with login and then using the token for protected routes.

---

## 1. Base URL and setup

- **Base URL:** `http://localhost:8000` (or the host/port where you run the FastAPI app, e.g. with `uvicorn app.main:app --reload`)
- **Docs:** `http://localhost:8000/docs` (Swagger UI)

In Postman:

1. Create an **Environment** (e.g. "AILand Local").
2. Add variable: **base_url** = `http://localhost:8000`.
3. In requests, use `{{base_url}}` as the URL prefix.

---

## 2. Authentication flow (login first)

The API uses **OAuth2 password flow**. Login returns an **access_token** you must send as **Bearer** on all protected routes.

### 2.1 Register (optional – create a user first)

| Field   | Value |
|--------|--------|
| **Method** | `POST` |
| **URL**    | `{{base_url}}/auth/register` |
| **Auth**   | No Auth |

**Body:** raw **JSON**

```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "password123"
}
```

**Rules:**

- `username`: 3–50 characters  
- `email`: valid email  
- `password`: 8–100 characters  

**Example success (201):**

```json
{
  "id": 1,
  "username": "testuser",
  "email": "testuser@example.com"
}
```

---

### 2.2 Login (get access token)

| Field   | Value |
|--------|--------|
| **Method** | `POST` |
| **URL**    | `{{base_url}}/auth/login` |
| **Auth**   | No Auth |

**Important:** Login expects **form-urlencoded** body, not JSON (OAuth2 password flow).

1. Open **Body** tab.
2. Select **x-www-form-urlencoded**.
3. Add:

| Key        | Value              |
|-----------|--------------------|
| username  | testuser           |
| password  | password123        |

You can use **email** instead of **username** in the `username` field; both work.

**Swagger / OpenAPI extra fields:**  
In Swagger UI (`/docs`), the login form may show extra OAuth2 fields: **client_id**, **client_secret**, **grant_type**, **scope**. These come from the standard OAuth2 token request schema. **For this API they are not used** — you can leave them empty. Only **username** and **password** are required and read by the backend.

**Example success (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "testuser",
    "email": "testuser@example.com",
    "role": "free",
    "plan_id": 1
  }
}
```

**Save the token in Postman:**

1. In the Login request, go to **Tests** tab.
2. Add:

```javascript
var json = pm.response.json();
if (json.access_token) {
  pm.environment.set("access_token", json.access_token);
}
```

3. Send the request; after a successful login, `access_token` will be stored in your environment.

---

### 2.3 Use the token on protected routes

For every route that requires login:

1. In the request, open **Authorization**.
2. Type: **Bearer Token**.
3. Token: `{{access_token}}` (or paste the token once manually).

So: **Authorization → Bearer Token → `{{access_token}}`**.

---

## 3. Auth routes (no token except change-password)

| Method | URL | Auth | Body / Params |
|--------|-----|------|----------------|
| POST   | `{{base_url}}/auth/register`       | No   | JSON: `username`, `email`, `password` |
| POST   | `{{base_url}}/auth/login`         | No   | **x-www-form-urlencoded:** `username`, `password` |
| POST   | `{{base_url}}/auth/forgot-password` | No | JSON: `email` |
| POST   | `{{base_url}}/auth/reset-password`  | No | JSON: `token`, `new_password` |
| POST   | `{{base_url}}/auth/change-password` | **Bearer** | JSON: `current_password`, `new_password` |

**Forgot password – body (JSON):**

```json
{
  "email": "testuser@example.com"
}
```

**Reset password – body (JSON):**  
Use the token from the reset email.

```json
{
  "token": "reset-token-from-email",
  "new_password": "newpassword123"
}
```

**Change password – body (JSON):**  
Requires **Authorization: Bearer {{access_token}}**.

```json
{
  "current_password": "password123",
  "new_password": "newpassword123"
}
```

---

## 4. User routes (require Bearer token)

| Method | URL | Description |
|--------|-----|-------------|
| GET | `{{base_url}}/auth/me` | Current user (id, username, email). |
| GET | `{{base_url}}/auth/{username}` | Get user by username (e.g. `auth/testuser`). |

Both need **Authorization: Bearer {{access_token}}**.

---

## 5. Knowledge Graph (KG) routes

### Public (no auth)

| Method | URL | Params |
|--------|-----|--------|
| GET | `{{base_url}}/kg/rooms` | None |
| GET | `{{base_url}}/kg/rooms/{level}/subjects` | `level`: A1, A2, B1. Optional: `limit` (1–100), `offset` |
| GET | `{{base_url}}/kg/word/{word_id}` | Path: `word_id` |
| GET | `{{base_url}}/kg/word/{word_id}/graph` | Path: `word_id` |
| GET | `{{base_url}}/kg/search` | Query: `q` (required), optional `level`, `limit` |

**Examples:**

- List rooms: `GET {{base_url}}/kg/rooms`
- Subjects for A1: `GET {{base_url}}/kg/rooms/A1/subjects?limit=20&offset=0`
- Word details: `GET {{base_url}}/kg/word/<word_id>`
- Search: `GET {{base_url}}/kg/search?q=haus&limit=10`

### Protected (Bearer token required)

| Method | URL | Description |
|--------|-----|-------------|
| GET  | `{{base_url}}/kg/rooms/progress` | User’s progress for all rooms. |
| GET  | `{{base_url}}/kg/rooms/{room_id}` | Room detail + user progress; `room_id`: A1, A2, B1. |
| POST | `{{base_url}}/kg/rooms/{room_id}/start` | Start a room. |
| POST | `{{base_url}}/kg/rooms/{room_id}/complete` | Complete a room. |

**Examples:**

- My progress: `GET {{base_url}}/kg/rooms/progress`
- Room A1: `GET {{base_url}}/kg/rooms/A1`
- Start A1: `POST {{base_url}}/kg/rooms/A1/start` (no body)
- Complete A1: `POST {{base_url}}/kg/rooms/A1/complete` (no body)

---

## 6. Learning routes (all require Bearer token)

| Method | URL | Body / Params |
|--------|-----|----------------|
| GET  | `{{base_url}}/learning/words/learned` | Query: optional `room_id` (A1/A2/B1), `limit`, `offset` |
| GET  | `{{base_url}}/learning/words/in-progress` | Query: optional `room_id`, `limit`, `offset` |
| GET  | `{{base_url}}/learning/words/stats` | None |
| POST | `{{base_url}}/learning/words/start` | JSON: `word_id`, `room_id` (e.g. "A1") |
| POST | `{{base_url}}/learning/words/complete` | JSON: `word_id` |

**Start word – body (JSON):**

```json
{
  "word_id": "some-word-id-from-kg",
  "room_id": "A1"
}
```

**Complete word – body (JSON):**

```json
{
  "word_id": "some-word-id-from-kg"
}
```

**Example URLs:**

- Learned: `GET {{base_url}}/learning/words/learned?room_id=A1&limit=50`
- In progress: `GET {{base_url}}/learning/words/in-progress`
- Stats: `GET {{base_url}}/learning/words/stats`

---

## 7. Progress routes (all require Bearer token)

| Method | URL | Description |
|--------|-----|-------------|
| GET | `{{base_url}}/progress/points` | Total points, points today, points this week. |
| GET | `{{base_url}}/progress/points/history` | Points history. Params: `limit`, `offset`. |
| GET | `{{base_url}}/progress/level` | Level from points (Beginner → Grandmaster). |
| GET | `{{base_url}}/progress/streak` | Current and longest streak, last activity. |

**Examples:**

- Points: `GET {{base_url}}/progress/points`
- History: `GET {{base_url}}/progress/points/history?limit=20&offset=0`
- Level: `GET {{base_url}}/progress/level`
- Streak: `GET {{base_url}}/progress/streak`

---

## 8. Suggested Postman order

1. **Register** – `POST /auth/register` (JSON body).  
2. **Login** – `POST /auth/login` (form-urlencoded: username, password).  
   - Use the **Tests** script above to set `access_token` in the environment.  
3. **Current user** – `GET /auth/me` with Bearer `{{access_token}}`.  
4. **Rooms list** – `GET /kg/rooms`.  
5. **Room progress** – `GET /kg/rooms/progress` (Bearer).  
6. **Room detail** – `GET /kg/rooms/A1` (Bearer).  
7. **Start room** – `POST /kg/rooms/A1/start` (Bearer).  
8. **Learning stats** – `GET /learning/words/stats` (Bearer).  
9. **Points** – `GET /progress/points` (Bearer).  
10. **Level & streak** – `GET /progress/level`, `GET /progress/streak` (Bearer).

---

## 9. Common issues

| Issue | Fix |
|-------|-----|
| 401 on protected routes | Login again and ensure **Authorization → Bearer Token → `{{access_token}}`** is set. |
| Login returns 422 | Use **Body → x-www-form-urlencoded** with `username` and `password`, not JSON. |
| Register 422 | Send **raw JSON** with `username`, `email`, `password`; check length and email format. |
| Connection refused | Start the backend (e.g. `uvicorn app.main:app --reload`) and confirm port (default 8000). |

---

## 10. Quick reference – all endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/auth/register` | No |
| POST | `/auth/login` | No (form body) |
| POST | `/auth/forgot-password` | No |
| POST | `/auth/reset-password` | No |
| POST | `/auth/change-password` | Bearer |
| GET  | `/auth/me` | Bearer |
| GET  | `/auth/{username}` | Bearer |
| GET  | `/kg/rooms` | No |
| GET  | `/kg/rooms/progress` | Bearer |
| GET  | `/kg/rooms/{room_id}` | Bearer |
| POST | `/kg/rooms/{room_id}/start` | Bearer |
| POST | `/kg/rooms/{room_id}/complete` | Bearer |
| GET  | `/kg/rooms/{level}/subjects` | No |
| GET  | `/kg/word/{word_id}` | No |
| GET  | `/kg/word/{word_id}/graph` | No |
| GET  | `/kg/search` | No |
| GET  | `/learning/words/learned` | Bearer |
| GET  | `/learning/words/in-progress` | Bearer |
| GET  | `/learning/words/stats` | Bearer |
| POST | `/learning/words/start` | Bearer |
| POST | `/learning/words/complete` | Bearer |
| GET  | `/progress/points` | Bearer |
| GET  | `/progress/points/history` | Bearer |
| GET  | `/progress/level` | Bearer |
| GET  | `/progress/streak` | Bearer |

Use **Base URL** + endpoint, e.g. `http://localhost:8000/auth/login`.
