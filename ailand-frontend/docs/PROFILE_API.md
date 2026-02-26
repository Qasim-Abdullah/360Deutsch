# Profile API – Backend contract for frontend

The profile UI is ready to consume these endpoints. No frontend changes are needed once the backend implements them.

---

## 1. GET /auth/me (already in use)

**Purpose:** Return the current authenticated user’s profile.

**Auth:** Required (Bearer token).

**Response (e.g. `UserResponse`):**

| Field          | Type    | Required | Notes                          |
|----------------|---------|----------|--------------------------------|
| `id`           | number  | yes      |                                |
| `username`     | string  | yes      |                                |
| `email`        | string  | yes      |                                |
| `display_name` | string? | no       | Shown as main name in UI        |
| `bio`          | string? | no       |                                |
| `avatar_url`   | string? | no       | URL of profile image           |

**Optional fields the frontend already supports** (can be added later without front changes):

| Field          | Type    | Notes                                  |
|----------------|---------|----------------------------------------|
| `member_since` | string? | e.g. ISO date or "Jan 2025"            |
| `level`        | string? | e.g. "A1"                              |
| `status`       | string? | e.g. "Active"                          |
| `role`         | string? | e.g. "free"                             |
| `plan_id`      | number? |                                        |

**Example response:**

```json
{
  "id": 1,
  "username": "jane",
  "email": "jane@example.com",
  "display_name": "Jane Doe",
  "bio": "Learning German.",
  "avatar_url": "https://..."
}
```

---

## 2. PATCH /auth/me (frontend is ready, backend to implement)

**Purpose:** Update the current user’s profile. The frontend calls this when the user saves changes (e.g. from an “Edit profile” form).

**Auth:** Required (Bearer token).

**Request body (all fields optional, e.g. `UserUpdate`):**

| Field          | Type   | Notes                |
|----------------|--------|----------------------|
| `username`     | string | 3–50 chars if sent   |
| `display_name` | string |                      |
| `bio`          | string |                      |
| `avatar_url`   | string | URL of new avatar   |

**Example request:**

```json
{
  "display_name": "Jane Doe",
  "bio": "Learning German."
}
```

**Response:** Same shape as GET /auth/me (updated user). Status 200.

**Errors:**

- 400: validation error (e.g. invalid username length).
- 401: not authenticated.

---

## 3. POST /auth/me/avatar (frontend is ready, backend to implement)

**Purpose:** Upload an avatar image from the user’s device. The frontend sends the file here, then passes the returned URL to PATCH /auth/me (or the backend can update the user’s avatar_url automatically).

**Auth:** Required (Bearer token).

**Request:** `multipart/form-data` with one field:

| Field   | Type | Notes                          |
|---------|------|--------------------------------|
| `avatar` | file | Image file (e.g. JPG, PNG, WebP, GIF). Frontend suggests max 5 MB. |

**Response:** JSON with the URL of the stored image. Status 200.

| Field        | Type   | Notes                    |
|-------------|--------|--------------------------|
| `avatar_url` | string | Public URL of the image  |

**Example response:**

```json
{
  "avatar_url": "https://your-cdn.com/avatars/user-123.jpg"
}
```

**Errors:**

- 400: missing file, or not an image, or too large.
- 401: not authenticated.

---

## Frontend usage

- **GET /auth/me** – used by `getProfileAction()` for the profile page and any place that needs the current user. Response is mapped to the UI (e.g. `display_name` → name, `avatar_url` → avatarUrl).
- **PATCH /auth/me** – used by `updateProfileAction(payload)` when the user saves profile edits. Payload is built from the edit form; backend can accept a subset of fields.
- **POST /auth/me/avatar** – used by `uploadAvatarAction(formData)` when the user selects an image in the “Edit profile” form. The frontend uploads the file, then sends the returned `avatar_url` in the subsequent PATCH /auth/me (or the backend can update the user’s avatar in this endpoint and return the new URL).

Once GET returns the optional fields, PATCH and POST /auth/me/avatar are implemented, the existing profile UI will use them without further frontend changes.
