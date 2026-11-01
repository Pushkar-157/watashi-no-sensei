# Watashi No Sensei (私の先生)

A friendly Japanese-learning chatbot. **Sensei** is a polite, encouraging teacher who explains
vocabulary, grammar, pronunciation and writing in simple language a 10-year-old can follow,
and shows Japanese text, romaji and English together. The AI runs **locally on your computer**
through [Ollama](https://ollama.com), so there are no API keys and no usage fees.

- **Backend:** Python, Flask and the Ollama Python SDK
- **Frontend:** React (Vite)
- Streaming replies, chat history, new chats, model picker, stop button, copy button
- Friendly messages for empty input, a missing model, and Ollama not running

## Project structure

```
watashi-no-sensei/
├── backend/
│   ├── app.py              Starts the Flask server
│   ├── config.py           All settings, read from .env (host, model, limits)
│   ├── prompts.py          Sensei's personality (the system prompt): edit me!
│   ├── ollama_service.py   Everything that talks to Ollama + friendly error messages
│   ├── routes.py           The two API endpoints: /api/status and /api/chat
│   ├── validation.py       Checks the messages the browser sends
│   ├── requirements.txt
│   └── .env.example        Copy to .env to change settings
└── frontend/
    ├── index.html
    ├── vite.config.js      Dev server + proxy to the backend
    ├── .env.example        Copy to .env.local to change addresses
    └── src/
        ├── App.jsx         Puts everything together
        ├── config.js       App name, suggestions, message limit
        ├── api/chatApi.js  The only file that calls the backend
        ├── hooks/          Chat logic: useChat, useConversations, useBackendStatus
        ├── components/     Sidebar, Header, ChatWindow, Message, Composer, ...
        └── styles/         theme.css (colours/fonts), layout.css, chat.css
```

## What you need first

| Tool | Version | Check with |
|------|---------|-----------|
| Python | 3.10 or newer | `python --version` |
| Node.js | 18 or newer | `node --version` |
| Ollama | latest | `ollama --version` |

## 1. Set up Ollama

1. Install Ollama from <https://ollama.com/download> and open it (on macOS and Windows it
   runs in the background; on Linux run `ollama serve`).
2. Download a model. This is the default:

   ```bash
   ollama pull llama3.2
   ```

   Any chat model works. If Japanese answers are weak, try a larger or multilingual one, for
   example `ollama pull qwen2.5:7b` or `ollama pull gemma3`. Run `ollama list` to see what
   you have installed.

## 2. Run the backend

Open a terminal in the project folder:

```bash
cd backend

# Create a private Python environment (once)
python -m venv .venv

# Activate it
#   macOS / Linux:
source .venv/bin/activate
#   Windows (PowerShell):
#   .venv\Scripts\Activate.ps1

# Install the dependencies (once)
pip install -r requirements.txt

# Optional: create your settings file, then edit it (see "Choose a model" below)
cp .env.example .env        # Windows: copy .env.example .env

# Start the server
python app.py
```

You should see Flask listening on `http://127.0.0.1:5001`. Leave this terminal open.

## 3. Run the frontend

Open a **second** terminal:

```bash
cd frontend
npm install        # once
npm run dev
```

Open <http://localhost:5173> in your browser. The status light in the top bar turns green
when the backend and Ollama are both running.

## Choose a model

You can change the model **without touching any code**:

- **Default for everyone:** set `OLLAMA_MODEL` in `backend/.env` (for example
  `OLLAMA_MODEL=qwen2.5:7b`) and restart the backend.
- **Per person, in the app:** use the model menu in the top bar. It lists every model
  installed in Ollama, and your choice is remembered in your browser.

The model must be installed first with `ollama pull <name>`. If it isn't, the app tells you
the exact command to run.

## Settings you can change

All backend settings live in `backend/.env` (every one is optional; see `.env.example`):

| Setting | What it does | Default |
|---------|--------------|---------|
| `OLLAMA_HOST` | Where Ollama runs. Change only if it is on another machine or in Docker | `http://localhost:11434` |
| `OLLAMA_MODEL` | Default model | `llama3.2` |
| `OLLAMA_TEMPERATURE` | Creativity from 0 to 1 | `0.7` |
| `OLLAMA_NUM_CTX` | How much conversation the model can read | `4096` |
| `OLLAMA_TIMEOUT` | Seconds to wait for Ollama | `120` |
| `MAX_HISTORY_MESSAGES` | Recent messages sent to the model each turn | `20` |
| `PORT` | Backend port | `5001` |
| `CORS_ORIGINS` | Websites allowed to call the API | the Vite dev addresses |

Other places to customise:

- **Teacher's personality and rules:** `backend/prompts.py`
- **App name, starter suggestions, message length limit:** `frontend/src/config.js`
- **Colours and fonts:** the variables at the top of `frontend/src/styles/theme.css`
- **Backend address for the dev server:** `VITE_BACKEND_URL` in `frontend/.env.local`
  (see `frontend/.env.example`)

If you change `MAX_MESSAGE_CHARS`, change it in both `backend/config.py` and
`frontend/src/config.js`.

## Troubleshooting

| What you see | What to do |
|--------------|-----------|
| "I can't reach Ollama" | Open the Ollama app, or run `ollama serve`. If Ollama is on another machine, set `OLLAMA_HOST` in `backend/.env`. |
| "The model … isn't installed yet" | Run `ollama pull <model>` (the message shows the exact command), or pick another model in the top bar. |
| "I can't reach the Sensei server" | Start the backend (step 2). Make sure `VITE_BACKEND_URL` matches the backend port. |
| First reply is very slow | Normal: the model is loading into memory. Later replies are faster. Raise `OLLAMA_TIMEOUT` if it times out. |
| Port 5001 already in use | Change `PORT` in `backend/.env` and set the same port in `VITE_BACKEND_URL`. |
| Japanese looks wrong or odd | Try a stronger model (see step 1). Small models make more mistakes, so double-check important facts. |

## Production build (optional)

```bash
cd frontend
npm run build      # creates frontend/dist
```

Serve `frontend/dist` with any static web server. If it is hosted at a different address
than the backend, set `VITE_API_BASE_URL` (frontend) **before building**, and add the
frontend's address to `CORS_ORIGINS` (backend). For the backend, use a production server
such as `pip install gunicorn` then `gunicorn -w 1 --threads 8 app:app` (run from `backend/`).

## Privacy and security

- No API keys or secrets are used. `.env` files are listed in `.gitignore` and must never be
  committed.
- Conversations are stored only in your browser (`localStorage`). The backend keeps nothing.
- The teacher's instructions are added by the server, so a browser can't replace them.
- By default the backend only listens on your own computer (`127.0.0.1`). Don't expose it to
  the internet without adding authentication and rate limiting.
