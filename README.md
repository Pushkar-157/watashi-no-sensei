# Watashi No Sensei (私の先生)

A friendly Japanese-learning chatbot. Sensei is a polite, encouraging teacher who explains Japanese vocabulary, grammar, pronunciation, and writing in simple language.

- **Frontend:** React and Vite
- **Backend:** Python, Flask, and the Ollama Python SDK
- **AI:** Ollama Cloud
- Chat history is stored in your browser.

## Deploy to Vercel

### 1. Push the project to GitHub

Upload the project files while preserving their folder structure. The repository root should contain:

```text
api/
  index.py
backend/
  app.py
  config.py
  ollama_service.py
  prompts.py
  requirements.txt
frontend/
  package.json
  src/
requirements.txt
vercel.json
```

### 2. Import the repository into Vercel

In Vercel, choose **Add New → Project**, import your GitHub repository, and keep the **Root Directory** set to the repository root.

The included `vercel.json` builds the frontend and routes `/api/*` requests to the Python backend. You should not need to change the frontend code.

### 3. Set environment variables

In Vercel, open **Project → Settings → Environment Variables** and add:

| Name | Value |
|---|---|
| `OLLAMA_API_KEY` | Your Ollama Cloud API key |
| `OLLAMA_HOST` | `https://ollama.com` |
| `OLLAMA_MODEL` | `gemma4:31b` |

Set the variables for the environments where you plan to deploy, such as **Production** and **Preview**. Save them, then redeploy so the deployment picks them up.

Keep `OLLAMA_API_KEY` in Vercel’s backend environment. Never add it to frontend environment variables, source code, or GitHub.

### 4. Check the deployment

Once deployment finishes, open your Vercel site. The status indicator should show that the backend is available. If chat requests fail, check the Vercel deployment’s function logs and confirm that the environment variables are set.

## Run locally

You can run the frontend and backend separately for local development.

### Backend

Use Python 3.10 or later:

```bash
cd backend
python -m venv .venv
```

Activate the environment:

```powershell
# Windows PowerShell
.venv\Scripts\Activate.ps1
```

```bash
# macOS or Linux
source .venv/bin/activate
```

Install dependencies and set your Ollama Cloud credentials:

```bash
pip install -r requirements.txt
```

Set the environment variables in your terminal before starting the backend:

```powershell
# Windows PowerShell
$env:OLLAMA_API_KEY = "your_ollama_api_key"
$env:OLLAMA_HOST = "https://ollama.com"
$env:OLLAMA_MODEL = "gemma4:31b"
python app.py
```

```bash
# macOS or Linux
export OLLAMA_API_KEY="your_ollama_api_key"
export OLLAMA_HOST="https://ollama.com"
export OLLAMA_MODEL="gemma4:31b"
python app.py
```

The backend listens on `http://127.0.0.1:5001` by default.

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Configuration

Backend settings can be supplied as environment variables:

| Variable | Purpose | Default |
|---|---|---|
| `OLLAMA_API_KEY` | Ollama Cloud API key | Required for cloud access |
| `OLLAMA_HOST` | Ollama API host | `https://ollama.com` |
| `OLLAMA_MODEL` | Default cloud model | `gemma4:31b` |
| `OLLAMA_TIMEOUT` | Request timeout in seconds | `120` |
| `OLLAMA_TEMPERATURE` | Response variation | `0.7` |
| `OLLAMA_NUM_CTX` | Context size | `4096` |
| `MAX_HISTORY_MESSAGES` | Number of recent messages sent per turn | `20` |

To choose another model, set `OLLAMA_MODEL` to a model available to your Ollama Cloud account.

## Project structure

```text
watashi-no-sensei/
├── api/
│   └── index.py              Vercel Python function entry point
├── backend/
│   ├── app.py                Flask application
│   ├── config.py             Backend configuration
│   ├── ollama_service.py     Ollama Cloud client and error handling
│   ├── prompts.py            Teacher personality and instructions
│   ├── routes.py             Chat and status API endpoints
│   ├── validation.py         Request validation
│   └── requirements.txt      Backend dependencies
├── frontend/
│   ├── src/                  React application
│   └── package.json
├── requirements.txt          Vercel Python dependencies
└── vercel.json               Vercel build and API routing
```

## Troubleshooting

- **Authentication error:** Check that `OLLAMA_API_KEY` is correct and set in Vercel’s environment variables. Redeploy after changing it.
- **Model not found:** Set `OLLAMA_MODEL` to a model available to your Ollama Cloud account.
- **Backend unavailable:** Check the Vercel function logs and make sure the root `api/index.py`, `requirements.txt`, and `vercel.json` are present.
- **Local requests fail:** Confirm the backend is running and that the terminal has `OLLAMA_API_KEY` set.

## Privacy

The Ollama API key is used by the Python backend and must remain secret. Chat conversations are stored in the browser; the backend does not save them.
