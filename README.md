# 🧠 Cognitive Load Estimator for Students Using Typing and Mouse Patterns

A real-time web application that estimates a student's cognitive load (mental effort) by analyzing their typing dynamics and mouse movement patterns. The system uses a PyTorch LSTM model with a rule-based fallback to classify cognitive load into **Low**, **Medium**, or **High** levels — and streams predictions to the browser over WebSockets.

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      React Frontend                     │
│  ┌───────────┐  ┌────────────┐  ┌────────────────────┐ │
│  │  Tracker   │  │  Dashboard │  │  Auth (Login/      │ │
│  │  Hooks     │──▶  Gauges,   │  │  Signup pages)     │ │
│  │  (typing & │  │  Charts,   │  └────────┬───────────┘ │
│  │   mouse)   │  │  Alerts    │           │             │
│  └─────┬──────┘  └─────▲──────┘           │             │
│        │ WS            │ state            │ REST        │
│        ▼               │                  ▼             │
│  ┌─────────────────────┴──────────────────────────────┐ │
│  │              WebSocket + Axios HTTP                 │ │
│  └──────────────────────┬─────────────────────────────┘ │
└─────────────────────────┼───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Backend                       │
│  ┌──────────┐  ┌───────────┐  ┌───────────────────────┐│
│  │ Auth     │  │ Data      │  │ WebSocket             ││
│  │ Routes   │  │ Routes    │  │ Route                 ││
│  │ (JWT)    │  │ (CRUD)    │  │ (real-time predict)   ││
│  └────┬─────┘  └─────┬─────┘  └──────────┬────────────┘│
│       │              │                    │             │
│       ▼              ▼                    ▼             │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐│
│  │ SQLite   │  │ SQLAlchemy│  │  ML Module            ││
│  │ Database │◀─│ ORM      │  │  (LSTM + Rule-Based)  ││
│  └──────────┘  └──────────┘  └────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

- **Real-Time Tracking** — captures keystroke timing (dwell time, flight time) and mouse metrics (speed, click frequency, idle time) directly in the browser.
- **Live Cognitive Load Prediction** — streams behavioral features to the backend over WebSockets; returns instant Low / Medium / High classification.
- **LSTM Deep Learning Model** — a PyTorch sequence model trained on temporal patterns for nuanced prediction.
- **Rule-Based Fallback** — if the LSTM model is unavailable, a deterministic heuristic ensures the system always returns a prediction.
- **Interactive Dashboard** — gauge chart, historical line chart, status cards, and alert banners powered by Chart.js and react-gauge-chart.
- **JWT Authentication** — secure signup / login flow with hashed passwords (bcrypt) and bearer tokens.
- **Session History & Summary** — REST endpoints for querying past sessions and per-user aggregated statistics.
- **Responsive UI** — Tailwind CSS utility-first styling that works across desktop and tablet screens.

---

## 🛠️ Tech Stack

| Layer        | Technology                                                      |
| ------------ | --------------------------------------------------------------- |
| **Frontend** | React 18, Vite, Tailwind CSS, Chart.js, react-gauge-chart      |
| **Backend**  | Python 3.10+, FastAPI, Uvicorn                                  |
| **Database** | SQLite (via SQLAlchemy ORM)                                     |
| **Auth**     | JWT (python-jose), Passlib (bcrypt)                             |
| **ML**       | PyTorch (LSTM), NumPy                                           |
| **Realtime** | WebSockets (FastAPI native)                                     |

---

## 📁 Folder Structure

```
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Configuration (SECRET_KEY, DATABASE_URL)
│   │   ├── database.py          # SQLAlchemy engine + session setup
│   │   ├── models.py            # User and CognitiveData ORM models
│   │   ├── schemas.py           # Pydantic request / response schemas
│   │   ├── auth.py              # JWT token creation & verification
│   │   ├── routes/
│   │   │   ├── auth_routes.py   # POST /signup, POST /login
│   │   │   ├── data_routes.py   # POST /log, GET /history, GET /summary
│   │   │   └── ws_routes.py     # WS /ws/predict — real-time prediction
│   │   └── ml/
│   │       ├── model.py         # LSTM model class definition (PyTorch)
│   │       ├── train.py         # Synthetic data generation + training loop
│   │       └── predict.py       # Inference engine + rule-based fallback
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # React DOM entry point
│   │   ├── App.jsx              # Router and layout
│   │   ├── index.css            # Tailwind directives + global styles
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login form page
│   │   │   ├── Signup.jsx       # Signup form page
│   │   │   └── Dashboard.jsx    # Main dashboard with tracker + visuals
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Top navigation bar
│   │   │   ├── GaugeDisplay.jsx # Gauge chart for current load level
│   │   │   ├── LineChartCard.jsx# Historical trend line chart
│   │   │   ├── StatusCard.jsx   # Metric summary cards
│   │   │   └── AlertBanner.jsx  # High-load warning banner
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js  # WebSocket connection hook
│   │   │   └── useTracker.js    # Keystroke & mouse event collector
│   │   └── utils/
│   │       ├── api.js           # Axios instance & REST helpers
│   │       └── auth.js          # Token storage & auth header helpers
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── README.md
```

---

## 🗄️ Database Schema

The application uses **SQLite** with two tables managed by SQLAlchemy:

### `users`

| Column             | Type    | Constraints            |
| ------------------ | ------- | ---------------------- |
| `id`               | Integer | Primary Key, Auto-Inc  |
| `name`             | String  | Not Null               |
| `email`            | String  | Unique, Indexed, Not Null |
| `hashed_password`  | String  | Not Null               |

### `cognitive_data`

| Column             | Type     | Constraints                      |
| ------------------ | -------- | -------------------------------- |
| `id`               | Integer  | Primary Key, Auto-Inc            |
| `user_id`          | Integer  | Foreign Key → `users.id`         |
| `timestamp`        | DateTime | Default: `utcnow`                |
| `typing_speed`     | Float    | Keys per second                  |
| `speed_variance`   | Float    | Variance of inter-key speed      |
| `backspace_rate`   | Float    | Backspace presses ÷ total keys   |
| `mouse_distance`   | Float    | Total cursor travel (px)         |
| `mouse_jitter`     | Float    | Direction changes in cursor path |
| `tab_switch_count` | Float    | Number of tab-away events        |
| `predicted_load`   | String   | `Low` / `Medium` / `High`        |

---

## 🤖 AI Model Details

### LSTM Architecture

```
Input (6 features × sequence_length) 
        │
        ▼
   LSTM Layer (hidden_size=64, num_layers=2, dropout=0.3)
        │
        ▼
   Fully Connected (64 → 32) + ReLU + Dropout(0.2)
        │
        ▼
   Fully Connected (32 → 3)
        │
        ▼
   Softmax → [Low, Medium, High]
```

| Parameter       | Value            |
| --------------- | ---------------- |
| Input features  | 6                |
| Hidden size     | 64               |
| LSTM layers     | 2                |
| FC layers       | 64→32→3          |
| Output classes  | 3                |
| Optimizer       | Adam             |
| Loss function   | CrossEntropyLoss |

### Rule-Based Fallback

When the LSTM model file is not present, the system falls back to a **weighted scoring heuristic**. Each feature contributes a weighted score (out of 100):

| Feature           | Max Weight | Normalization Threshold |
| ----------------- | ---------- | ----------------------- |
| `typing_speed`    | 20         | 10.0 keys/s             |
| `speed_variance`  | 15         | 3.0                     |
| `backspace_rate`  | 20         | 0.5                     |
| `mouse_jitter`    | 25         | 40 direction changes    |
| `tab_switch_count`| 20         | 8 switches              |

| Composite Score | Predicted Load |
| --------------- | -------------- |
| < 30            | **Low**        |
| 30 – 59         | **Medium**     |
| ≥ 60            | **High**       |

---

## 🔬 Feature Engineering

The frontend tracker hook (`useTracker.js`) collects raw browser events every **5 seconds** and computes the following features before sending them to the backend:

| Feature             | How It Is Computed                                                    |
| ------------------- | --------------------------------------------------------------------- |
| `typing_speed`      | Total `keydown` count in the window ÷ 5 seconds                      |
| `speed_variance`    | Variance of instantaneous inter-key speeds (1 / gap between keys)    |
| `backspace_rate`    | Backspace key presses ÷ total key presses (0–1 ratio)                |
| `mouse_distance`    | Sum of Euclidean distances between consecutive `mousemove` positions  |
| `mouse_jitter`      | Count of horizontal and vertical direction reversals in cursor path   |
| `tab_switch_count`  | Number of `visibilitychange` events where the page became hidden      |

All six features are sent as a JSON payload over the WebSocket connection every few seconds.

---

## 🚀 Step-by-Step Run Instructions

### Prerequisites

- **Python 3.10+** and `pip`
- **Node.js 18+** and `npm`
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

### 2. Start the Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The API is now live at **http://localhost:8000** and docs at **http://localhost:8000/docs**.

### 3. Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

The app opens at **http://localhost:5173** (default Vite port).

---

## 🏋️ How to Train the Model

A training script is included that generates synthetic data and trains the LSTM:

```bash
cd backend

# Activate your virtual environment
source venv/bin/activate

# Run the training script
python -m app.ml.train
```

What the script does:

1. **Generates synthetic samples** — creates randomized feature vectors with labels derived from known distributions for Low, Medium, and High cognitive load.
2. **Trains the LSTM** — runs for a configurable number of epochs, printing loss and accuracy per epoch.
3. **Saves the model** — writes the trained weights to a `.pth` file that `predict.py` loads at inference time.

> **Tip:** To improve accuracy, replace synthetic data with real labeled data (see next section).

---

## 📋 How to Collect Labeled Data

To move beyond synthetic data and train on real student behavior:

1. **Set up a labeling session** — have students perform tasks of known difficulty (e.g., easy reading vs. complex problem-solving).
2. **Record features** — while the student works, the Dashboard tracker automatically logs `typing_speed`, `speed_variance`, `backspace_rate`, `mouse_distance`, `mouse_jitter`, and `tab_switch_count` via the `/api/data/log` endpoint.
3. **Assign ground-truth labels** — after each task, label the recorded data with the expected cognitive load level (`Low`, `Medium`, or `High`) based on the task difficulty and optional self-report questionnaires (e.g., NASA-TLX).
4. **Export from SQLite** — query the `cognitive_data` table, join with your labels, and export to CSV.
5. **Retrain** — feed the labeled CSV into a modified version of `train.py` that reads real data instead of synthetic samples.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint            | Body                              | Response                  |
| ------ | ------------------- | --------------------------------- | ------------------------- |
| POST   | `/api/auth/signup`  | `{ name, email, password }`       | `UserResponse` (201)      |
| POST   | `/api/auth/login`   | `{ email, password }`             | `{ access_token, … }`    |

### Data

| Method | Endpoint            | Auth     | Description                                    |
| ------ | ------------------- | -------- | ---------------------------------------------- |
| POST   | `/api/data/log`     | Bearer   | Log a single cognitive data record + predict   |
| GET    | `/api/data/history` | Bearer   | Retrieve time-filtered history (query: `days`)  |
| GET    | `/api/data/summary` | Bearer   | Aggregated 7-day statistics for current user    |

### WebSocket

| Protocol | Endpoint         | Auth                | Description                                          |
| -------- | ---------------- | ------------------- | ---------------------------------------------------- |
| WS       | `/ws/predict`    | `?token=<jwt>`      | Send feature JSON, receive real-time load prediction  |

**WebSocket Message Format:**

```jsonc
// → Client sends:
{
  "typing_speed": 2.4,
  "speed_variance": 1.82,
  "backspace_rate": 0.15,
  "mouse_distance": 340.0,
  "mouse_jitter": 12,
  "tab_switch_count": 2
}

// ← Server responds:
{
  "predicted_load": "Medium",
  "confidence": 0.82,
  "load_percentage": 45.3
}
```

---

## ☁️ Deployment Guide (Free Tier)

### Backend → Render

1. Push your code to GitHub.
2. Go to [render.com](https://render.com) → **New Web Service**.
3. Connect your GitHub repo and set the **Root Directory** to `backend`.
4. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:**
     - `SECRET_KEY` — a strong random string
     - `DATABASE_URL` — leave as default for SQLite or configure Render's PostgreSQL add-on
5. Deploy. Your backend URL will look like `https://your-app.onrender.com`.

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **Import Project** from GitHub.
2. Set the **Root Directory** to `frontend`.
3. Vercel auto-detects Vite. Confirm:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add an environment variable:
   - `VITE_API_URL` — set to your Render backend URL (e.g., `https://your-app.onrender.com`)
5. Deploy. Your frontend will be live at `https://your-app.vercel.app`.

> **Note:** On Render's free tier the backend spins down after inactivity. The first request after idle may take ~30 seconds.

---

## 📸 Screenshots

> Replace the placeholders below with actual screenshots.

| Screen           | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| **Login**        | ![Login Page](screenshots/login.png) — Clean login form with email and password fields. |
| **Signup**       | ![Signup Page](screenshots/signup.png) — Registration form with username, email, and password. |
| **Dashboard**    | ![Dashboard](screenshots/dashboard.png) — Real-time gauge, historical chart, status cards, and alert banner. |
| **High Load Alert** | ![Alert](screenshots/alert.png) — Red alert banner shown when cognitive load is estimated as High. |

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```