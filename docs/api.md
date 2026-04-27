# API

Base URL in local development:

```text
http://localhost:4000/api
```

The frontend can override this with:

```text
VITE_API_BASE_URL
```

## Endpoints

### Health

```http
GET /api/health
```

Returns:

```json
{ "status": "ok" }
```

### List Saved People

```http
GET /api/people
```

Returns all saved profiles from SQLite.

### Save Person

```http
POST /api/people
```

Saves a normalized profile. The backend stores it as a saved profile even if the client sends it with `source: "random"`.

### Update Saved Person Name

```http
PATCH /api/people/:id
```

Request body:

```json
{
  "name": {
    "title": "Ms",
    "first": "Ada",
    "last": "Lovelace"
  }
}
```

Returns the updated saved profile.

### Delete Saved Person

```http
DELETE /api/people/:id
```

Deletes a saved profile. Returns `204 No Content` on success.

## Error Handling

- `400`: invalid request body.
- `404`: saved profile was not found.
- `500`: unexpected server error.

Validation errors are intentionally summarized for the client instead of exposing internal validation details.
