# Diff-Focus Web App

A lightweight tool to generate context cards for code reviews. Paste any git diff and get instant analysis with risk levels, file types, summaries, and flags.

## Features

- 🔍 **Diff Analysis**: Automatically analyzes git diffs for risk factors
- 🎯 **Risk Assessment**: Categorizes changes as Low, Medium, or High risk
- 📋 **Context Cards**: Generates summary cards perfect for code reviews
- 🚩 **Smart Flags**: Detects dangerous operations, auth changes, debug artifacts, and more
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## Run Locally

1. Install dependencies:
```bash
npm run install-all
```

2. Start development server:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend dev server on `http://localhost:3000`

## Production Build

```bash
cd client
npm run build
cd ..
NODE_ENV=production npm start
```

## API

### POST `/api/analyze`

Analyzes a git diff and returns structured analysis.

**Request:**
```json
{
  "diff": "diff --git a/file.js b/file.js\n..."
}
```

**Response:**
```json
{
  "riskLevel": "Medium",
  "fileTypes": ["React Component"],
  "summary": ["Modifies React component logic or hooks."],
  "flags": [
    {
      "type": "warning",
      "msg": "Authentication, privacy, or config change."
    }
  ]
}
```

## Tech Stack

- **Backend**: Express.js
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## License

MIT

