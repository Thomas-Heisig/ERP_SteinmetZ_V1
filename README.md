ERP SteinmetZ - AI-gestütztes ERP-System
Ein modernes, KI-gestütztes ERP-System mit monolithischer Architektur und React-Frontend.

🚀 Schnellstart
bash

# Installation

npm install

# Entwicklung starten (Frontend + Backend)

npm run dev

# Nur Frontend

npm run frontend

# Nur Backend

npm run backend

# Build

npm run build
📁 Projektstruktur
text
├── apps/
│ ├── frontend/ # React Frontend (Vite + TypeScript)
│ └── backend/ # Express Backend (TypeScript)
├── data/ # Datenbanken und Funktionen
├── docs/ # Dokumentation und Konzepte
├── models/ # AI-Modelle (GGUF)
└── scripts/ # Hilfsskripte
🛠️ Technologien
Frontend: React 19, Vite, TypeScript, React Router

Backend: Express, TypeScript, SQLite

AI: Gemma-2-2b-it (lokal), OpenAI Integration

Datenbank: SQLite mit Migrationssystem

🔧 Konfiguration
Backend (.env)
env
PORT=3000
OPENAI_API_KEY=sk-... # Optional
AI_MODEL=gpt-4.1-mini # Optional  
CORS_ORIGIN=http://localhost:5173
Frontend (.env)
env
VITE_BACKEND_URL=http://localhost:3000
📊 Features
Dashboard: Übersicht mit Kennzahlen und Zeitreihen

KI-Integration: Lokale (Gemma) und Cloud-Modelle (OpenAI)

Funktionskatalog: Dynamische ERP-Funktionen

Theme-System: Light, Dark, LCARS Themes

Responsive Design: Mobile und Desktop optimiert

🔍 API Endpoints
GET /health - Systemstatus

GET /api/dashboard - Dashboard-Daten

POST /api/ai/chat - KI-Chat (mit API Key)

GET /api/functions - Funktionskatalog

🎯 Entwicklung
bash

# TypeScript Prüfung

npm run typecheck

# Linting

npm run lint

# Production Build

npm run build
📝 Dokumentation
Detaillierte Konzepte und Spezifikationen finden Sie im docs/ Verzeichnis.

🤝 Beitragen
Fork das Repository

Feature-Branch erstellen (git checkout -b feature/AmazingFeature)

Commit (git commit -m 'Add AmazingFeature')

Push (git push origin feature/AmazingFeature)

Pull Request öffnen

📄 Lizenz
Dieses Projekt ist unter der Gemma-Lizenz lizenziert - siehe LICENSE Datei für Details.

Version: v0.1.0-alpha
Letztes Update: 2025-11-30
