# Auth App (HTML/CSS/JS + Node/Express + JSON/MySQL)

Simple, modern, responsive Login & Register app.

- Frontend: HTML, CSS, Vanilla JS
- Backend: Node.js + Express
- Storage: `db.json` (default) or MySQL (`mysql2`)

## Quick start

1) Install dependencies
```bash
npm install
```

2) Configure environment
```bash
cp .env.example .env
```
By default `USE_MYSQL=false`, so the app uses `db.json` and works without a DB.

3) Run in dev
```bash
npm run dev
```
Open `http://localhost:3000`.

Seeded user:
```json
{ "username": "admin", "email": "admin@example.com", "password": "123456" }
```

## MySQL setup (Workbench)

1) Open `schema.sql` in MySQL Workbench and execute it to create `users_db` and table `users`.
2) Update `.env` and enable MySQL mode:
```bash
USE_MYSQL=true
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=users_db
```
3) Restart server: `npm run dev`

## API

- POST `/api/register` body: `{ username, email, password }`
  - 201 Created on success
- POST `/api/login` body: `{ email, password }`
  - 200 OK when credentials match; 401 otherwise

## Notes

- Passwords are plain text for demo only. Use hashing (e.g., bcrypt) in real apps.
- Client-side validation is mirrored on the server.