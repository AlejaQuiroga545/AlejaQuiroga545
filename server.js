import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(projectRoot, 'public')));

const PORT = process.env.PORT || 3000;
const USE_MYSQL = String(process.env.USE_MYSQL || 'false').toLowerCase() === 'true' || String(process.env.USE_MYSQL || '0') === '1';

// JSON storage helpers
const dbFilePath = path.join(projectRoot, 'db.json');

async function readUsersFromFile() {
  try {
    const content = await fs.readFile(dbFilePath, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data.users) ? data.users : [];
  } catch (err) {
    // If file does not exist or is invalid, return empty array
    return [];
  }
}

async function writeUsersToFile(users) {
  const data = { users };
  await fs.writeFile(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Optionally import MySQL pool when enabled
let mysqlPool = null;
if (USE_MYSQL) {
  const mod = await import('./db.js');
  mysqlPool = mod.pool;
}

// Health endpoint
app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, mode: USE_MYSQL ? 'mysql' : 'json' });
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body || {};

  // Basic validations on server side as well
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: 'Email format is invalid' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    if (USE_MYSQL) {
      // Insert into MySQL database
      await mysqlPool.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, password]
      );
      return res.status(201).json({ message: 'User registered' });
    } else {
      // Append to JSON db file
      const users = await readUsersFromFile();
      users.push({ username, email, password });
      await writeUsersToFile(users);
      return res.status(201).json({ message: 'User registered' });
    }
  } catch (err) {
    // Handle potential duplicate constraints or other DB errors gracefully
    return res.status(500).json({ message: 'Registration failed', error: String(err.message || err) });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    if (USE_MYSQL) {
      const [rows] = await mysqlPool.execute(
        'SELECT id, username, email FROM users WHERE email = ? AND password = ? LIMIT 1',
        [email, password]
      );
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json({ message: 'Login successful' });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    } else {
      const users = await readUsersFromFile();
      const found = users.find(u => u.email === email && u.password === password);
      if (found) {
        return res.json({ message: 'Login successful' });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: String(err.message || err) });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT} (mode: ${USE_MYSQL ? 'mysql' : 'json'})`);
});

