# CricInsight Analytics - Execution Guide

This document provides instructions on how to set up and run the CricInsight cricket analytics platform.

## Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

---

## 🚀 Backend Setup (FastAPI)

The backend handles data processing using Pandas and serves the API for the frontend.

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server**:
   ```bash
   uvicorn main:app --reload
   ```
   *The API will be available at `http://localhost:8000`.*

---

## 🎨 Frontend Setup (React + Tailwind CSS v3)

The frontend is built with React, Vite, and Tailwind CSS v3.

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173` (or the port specified in the terminal).*

---

## 🛠 Project Notes

- **Tailwind CSS**: The project uses Tailwind CSS v3 with PostCSS. Configuration can be found in `frontend/tailwind.config.js` and `frontend/postcss.config.js`.
- **Data Source**: The application processes `t20_bbb_ipl.csv` located in the root directory.
