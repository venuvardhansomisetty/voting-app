# 🗳️ VotePulse - Live Voting & Poll App

A full-stack polling application where users can create polls, 
vote, and see live results instantly.

## 🚀 Features
- Create polls with 2-4 options
- Vote on polls instantly
- Live results with progress bars
- Prevents duplicate voting
- Delete polls
- Data saved permanently in JSON database
- Clean and responsive UI

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Frontend:** HTML, CSS, JavaScript
- **Database:** JSON File Storage

- **Live demo:**  https://voting-app-21tx.onrender.com

## ⚙️ Setup Instructions

### Step 1 - Install dependencies
cd backend
npm install

### Step 2 - Start server
node server.js

### Step 3 - Open browser
Go to http://localhost:3000

## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /polls | Get all polls |
| POST | /polls | Create a poll |
| POST | /polls/:id/vote | Vote on a poll |
| DELETE | /polls/:id | Delete a poll |
| GET | /polls/:id/results | Get results |

## 👨‍💻 Developer
Venuvardhan Somisetty
