# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running

```bash
python app.py
# Server starts at http://127.0.0.1:5000
# or double-click run.bat on Windows (also installs dependencies)
```

## Installing Dependencies

```bash
pip install -r requirements.txt
```

## Architecture

**Backend (`app.py`)** — Flask server with two routes:
- `GET /` — serves `templates/index.html`
- `POST /predict` — receives a base64-encoded PNG, decodes it to a grayscale PIL image, resizes to 28×28, applies MNIST normalization, runs inference, and returns `{ digit, confidence, probabilities[] }` as JSON.

The `DigitCNN` model and weights are identical to the desktop version. Shared weights are loaded from `../digit_model.pth` (project root). If missing, MNIST is downloaded to the root and training runs for 5 epochs.

**Frontend (`templates/index.html`)** — Single HTML file with no external dependencies. The `<canvas>` element captures mouse and touch events. On `mouseup`/`touchend`, the canvas is serialized with `canvas.toDataURL("image/png")` and POSTed to `/predict`. The response updates the result text and 10 confidence bars.

## Key Notes

- The canvas sends the full 380×380 PNG to the server; downscaling to 28×28 happens server-side in `predict()`.
- MNIST normalization (mean=0.1307, std=0.3081) is applied server-side — the frontend sends raw pixel data.
- MNIST data downloads to `../MNIST/` (project root), shared with the desktop version.
- `run.bat` must not use `chcp 65001` — it causes cmd to misparse the file when saved as UTF-8.
- The global `model` variable is loaded once at startup before `app.run()` and reused across all requests.
