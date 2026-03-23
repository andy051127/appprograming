# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running

```bash
python app.py
# or double-click run.bat on Windows
```

## Installing Dependencies

```bash
pip install -r requirements.txt
```

## Architecture

Single-file app (`app.py`) split into three concerns:

**Model** — `DigitCNN` is a 2-block CNN (Conv→ReLU→MaxPool ×2, FC(128)+Dropout+FC(10)). Shared model weights are loaded from `../digit_model.pth` (the project root). If the file doesn't exist, MNIST is downloaded to the root and training runs for 5 epochs.

**Preprocessing** — `preprocess()` resizes the PIL image to 28×28 and applies MNIST normalization (mean=0.1307, std=0.3081). Skipping normalization significantly degrades accuracy.

**GUI** — tkinter canvas (280×280 black background). The PIL image (`self.pil_img`) and the tkinter canvas are kept in sync on every brush stroke inside `_paint()`. Prediction triggers automatically on `<ButtonRelease-1>`.

## Key Notes

- Model is loaded as `state_dict` via `torch.load(..., weights_only=True)` — do not save or load as a full model object.
- MNIST data downloads to the project root (`../MNIST/`), shared with the web version.
- `run.bat` must not use `chcp 65001` — it causes cmd to misparse the file when saved as UTF-8.
