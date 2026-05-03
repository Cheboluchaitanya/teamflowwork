const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { db } = require('./firebase');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ─── Users ────────────────────────────────────────────────

app.get('/api/users', async (req, res) => {
  try {
    const snapshot = await db.collection('users').get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = req.body;
    const docRef = await db.collection('users').add({ ...user, createdAt: Date.now() });
    res.json({ id: docRef.id, ...user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('users').doc(id).update(req.body);
    res.json({ id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Teams ────────────────────────────────────────────────

app.get('/api/teams', async (req, res) => {
  try {
    const snapshot = await db.collection('teams').get();
    const teams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teams', async (req, res) => {
  try {
    console.log("POST /api/teams called with:", req.body);
    const { teamName, leaderId, memberNames = [] } = req.body;
    
    if (!teamName || !leaderId) {
      return res.status(400).json({ error: "Team name and leaderId are required." });
    }

    const now = Date.now();
    const batch = db.batch();

    // Create team
    const teamRef = db.collection('teams').doc();
    const memberIds = [];

    // Create accounts for each member name provided
    for (const name of memberNames) {
      if (!name.trim()) continue;
      const userRef = db.collection('users').doc();
      const email = `${name.trim().toLowerCase().replace(/\s+/g, '.')}@team.com`;
      batch.set(userRef, {
        name: name.trim(),
        email: email,
        password: 'password123', // Default password
        role: 'member',
        teamId: teamRef.id,
        createdAt: now,
      });
      memberIds.push(userRef.id);
    }

    batch.set(teamRef, {
      name: teamName,
      leaderId,
      members: memberIds,
      createdAt: now,
    });

    // Update the existing leader with the teamId
    batch.update(db.collection('users').doc(leaderId), { teamId: teamRef.id });

    await batch.commit();
    res.json({ id: teamRef.id, name: teamName, leaderId, members: memberIds });
  } catch (error) {
    console.error("Error creating team:", error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/teams/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const teamSnap = await db.collection('teams').doc(id).get();
    if (teamSnap.exists) {
      const { leaderId, members = [] } = teamSnap.data();
      const batch = db.batch();
      if (leaderId) batch.update(db.collection('users').doc(leaderId), { teamId: '' });
      members.forEach(memberId => batch.update(db.collection('users').doc(memberId), { teamId: '' }));
      batch.delete(db.collection('teams').doc(id));
      await batch.commit();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Projects ─────────────────────────────────────────────

app.get('/api/projects', async (req, res) => {
  try {
    const snapshot = await db.collection('projects').get();
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = req.body;
    const docRef = await db.collection('projects').add({
      ...project, status: 'pending', progress: 0, createdAt: Date.now()
    });
    res.json({ id: docRef.id, ...project, status: 'pending', progress: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects/:id/accept', async (req, res) => {
  try {
    await db.collection('projects').doc(req.params.id).update({ status: 'accepted', acceptedAt: Date.now() });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/projects/:id/progress', async (req, res) => {
  try {
    const { progress } = req.body;
    const newStatus = progress === 100 ? 'completed' : 'in-progress';
    await db.collection('projects').doc(req.params.id).update({ progress, status: newStatus });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Tasks ────────────────────────────────────────────────

app.get('/api/tasks', async (req, res) => {
  try {
    const snapshot = await db.collection('tasks').get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = req.body;
    const docRef = await db.collection('tasks').add({
      ...task, status: 'pending', createdAt: Date.now()
    });
    res.json({ id: docRef.id, ...task, status: 'pending' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:id/submit', async (req, res) => {
  try {
    const { submission } = req.body;
    await db.collection('tasks').doc(req.params.id).update({
      status: 'completed', submission, submittedAt: Date.now()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks/:id/review', async (req, res) => {
  try {
    const { approved } = req.body;
    await db.collection('tasks').doc(req.params.id).update({
      approved, status: approved ? 'completed' : 'in-progress', reviewedAt: Date.now()
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Server ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
