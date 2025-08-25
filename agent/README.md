# Scribe Agent

Local Node.js service for Playwright test recording.

## Setup

1. Install dependencies:
```bash
cd agent
npm install
```

2. Install Playwright (if not already installed):
```bash
npx playwright install
```

## Usage

1. Start the agent:
```bash
cd agent
npm start
```

2. The agent will run on `http://localhost:4317`

3. Use the main application's recording feature - it will automatically connect to this local agent.

## Endpoints

- `POST /start` - Start recording session
- `POST /stop` - Stop active recording
- `GET /status` - Check recording status
- `GET /health` - Health check

## Troubleshooting

- Make sure Playwright browsers are installed: `npx playwright install`
- On Windows, ensure you have the latest Node.js version
- Check that port 4317 is available