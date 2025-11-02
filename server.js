// Vino Membership API – Node.js backend
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import { writeFileSync, readFileSync, existsSync } from 'fs';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const USERS_DB = './users.json';

// Utility
function loadUsers() {
  return existsSync(USERS_DB)
    ? JSON.parse(readFileSync(USERS_DB, 'utf8'))
    : [];
}
function saveUsers(users) {
  writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
}

// Register new member
app.post('/register', async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Missing fields' });
  const users = loadUsers();
  if (users.find(u => u.email === email))
    return res.status(409).json({ error: 'User already exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = {
    email,
    name,
    password: hash,
    active: false,
    registered: new Date().toISOString()
  };
  users.push(user);
  saveUsers(users);
  console.log(`[REGISTER] ${email}`);
  res.json({ success: true });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(403).json({ error: 'Invalid password' });
  console.log(`[LOGIN] ${email}`);
  res.json({
    success: true,
    user: { email: user.email, active: user.active, name: user.name }
  });
});

// Activate after payment
app.post('/activate', (req, res) => {
  const { email } = req.body;
  const users = loadUsers();
  const u = users.find(x => x.email === email);
  if (!u) return res.status(404).json({ error: 'User not found' });
  u.active = true;
  saveUsers(users);
  console.log(`[ACTIVATE] ${email}`);
  res.json({ success: true });
});

// Face ID verification demo
app.post('/face', (req, res) => {
  const { email } = req.body;
  console.log(`[FACE AUTH] ${email}`);
  res.json({ success: true });
});

app.listen(8080, () => console.log('✅ Vino Membership API running on port 8080'));