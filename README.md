# MVP Interview Project

This repository contains both frontend and backend parts of the MVP Interview application.

## Project Structure

- `frontend/` - Next.js frontend application deployed on Vercel
- `backend/` - Backend application deployed on Render

## Frontend

The frontend is a Next.js application that provides the interview interface. It's deployed on Vercel.

### Setup
```bash
cd frontend
npm install
npm run dev
```

## Backend

The backend is a Python application that handles interview logic and AI processing. It's deployed on Render.

### Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

## Development

Each project can be developed independently. The frontend and backend communicate through API endpoints.

## Deployment

- Frontend: Deployed on Vercel
- Backend: Deployed on Render

## Environment Variables

Each project has its own `.env` file with specific configuration. Make sure to set up the appropriate environment variables for both projects. 