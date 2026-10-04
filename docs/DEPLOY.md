# Putting Satark online

Satark is one container that listens on port 3000. Any host that runs Docker will do.

## What it needs

| Need | Why |
|---|---|
| Node 22.13 or newer (the Docker image has it) | The radar uses the SQLite that ships inside Node |
| A small writable folder at `/app/data` | Where the anonymous counts live. If it is not writable, counts are kept in memory and nothing breaks |
| `GEMINI_API_KEY` (optional) | Switches on the AI helper and the screenshot reader. Leave it out and everything else works |

## Option 1: Render (free web service)

1. Push this repo to GitHub (done).
2. On Render, choose **New, Blueprint** and pick the repo. It reads [`render.yaml`](../render.yaml).
3. Wait for the build. Open the link it gives you.
4. Optional: add `GEMINI_API_KEY` in the service's environment settings.

A free Render service sleeps when nobody visits, so open it a few minutes before a demo.
Its disk is not kept between deploys, so radar counts reset. For the hackathon the Radar
page shows clearly labelled sample numbers until there are enough real counts.

## Option 2: any server with Docker

```bash
git clone https://github.com/Cray749/Sangyan-Hackathon_Satark.git
cd Sangyan-Hackathon_Satark
docker compose up -d --build
```

The `satark-data` volume keeps the counts between restarts.

## After it is online

- Open the site on a phone. Check Hindi, Marathi and English, voice input, and "Add to home screen".
- Open `/api/ai`. It should say `{"enabled":false}` unless you added a key.
- Open `/trust` and `/radar`.
- Turn on airplane mode after one visit. The check should still work.

## Before the final submission

Everything in the "Open checks" list in [RULEBOOK.md](RULEBOOK.md), and a native-speaker read
of the Hindi and Marathi text.
