# TeamFlow - Collaborative Project Management

TeamFlow is a modern, full-stack project management application designed to streamline workflows between Administrators, Team Leaders, and Team Members. It features a robust role-based access system, real-time tracking, and a sleek, premium UI.

## 📂 Project Structure (Tree)

```text
TeamFlow/
├── backend/
│   ├── firebase.js             # Firebase Admin SDK configuration
│   ├── index.js                # Express API routes and logic
│   ├── package.json            # Backend dependencies & scripts
│   └── .env.example            # Backend env template
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth and Data Store providers
│   │   ├── pages/              # Admin, Leader, and Member views
│   │   ├── services/           # API fetching logic
│   │   ├── App.jsx             # Main routing logic
│   │   └── main.jsx            # Entry point
│   ├── package.json            # Frontend dependencies & scripts
│   └── .env                    # Frontend environment variables
├── .gitignore                  # Git exclusion rules
└── README.md                   # Project documentation
```

## 🚀 Key Features

- **Role-Based Workflows**: 
  - **Admin**: Create teams, assign leaders, and initiate projects.
  - **Team Leader**: Accept projects, break them into tasks, and assign members.
  - **Team Member**: View tasks, track progress, and submit work.
- **Workflow Audit Log**: Automatic tracking of project milestones (acceptance, task creation, submissions).
- **Instant Onboarding**: Create team members by name; accounts generate automatically.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Shadcn UI.
- **Backend**: Node.js, Express.
- **Database**: Firebase Firestore (via Firebase Admin SDK).

## ⚙️ Setup & Installation

### 1. Backend
1. Go to `/backend` -> `npm install`.
2. Place `serviceAccountKey.json` in the folder.
3. Run `npm run dev`.

### 2. Frontend
1. Go to `/frontend` -> `npm install`.
2. Add `VITE_API_URL=http://localhost:5000/api` to `.env`.
3. Run `npm run dev`.

## 🌐 Railway Deployment Details

The backend is optimized for Railway deployment with a root-directory override and environment-based secret management.

### Deployment Configuration:
1. **Source**: Deploy from GitHub repository.
2. **Root Directory**: Set to `backend` in Railway service settings.
3. **Environment Variables**:
   - `PORT`: `5000`
   - `FIREBASE_SERVICE_ACCOUNT`: **Must use the Base64 format.**

### 🔐 The Base64 Secret Fix
To avoid "Failed to parse JSON" errors on Railway caused by multi-line private keys, the project supports a Base64-encoded service account string.
- **How to generate**: Convert the contents of your `serviceAccountKey.json` to a single Base64 string.
- **Backend logic**: The `firebase.js` automatically detects if the string is JSON or Base64 and decodes it accordingly.

## 📝 License
Developed for the TeamFlow workflow management system.
