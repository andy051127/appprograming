# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Program

```bash
# GUI 실행
python digit_recognition.py

# 또는 배치 파일로 실행 (Windows 탐색기 더블클릭)
손글씨_숫자인식.bat
```

## Installing Dependencies

```bash
pip install -r requirements.txt
```

Dependencies: `torch`, `torchvision`, `numpy`, `Pillow`. TensorFlow is **not used** — Python 3.14 is not supported by TensorFlow, so PyTorch is used instead.

## Architecture

Single-file app (`digit_recognition.py`) with three layers:

**Model (`DigitCNN`)** — 2-block CNN (Conv→ReLU→MaxPool ×2) + FC(128) + Dropout + FC(10). Trained on MNIST, saved to `digit_model.pth`.

**Model lifecycle (`get_model` / `train_model`)** — On first run, downloads MNIST into `./MNIST/` and trains for 5 epochs (~99% accuracy), then saves weights. Subsequent runs load from `digit_model.pth` directly.

**GUI (`App`)** — tkinter canvas (280×280, black background). User draws with white brush; on mouse release, the PIL image is resized to 28×28, normalized with MNIST stats (mean=0.1307, std=0.3081), and passed to the model. Results show predicted digit + confidence bars for all 10 classes.

## Key Implementation Notes

- The internal PIL image (`self.pil_img`) is kept in sync with the tkinter canvas on every stroke — both are updated simultaneously in `_paint()`.
- Preprocessing applies MNIST normalization; skipping this degrades accuracy significantly.
- `digit_model.pth` is a saved `state_dict`, not a full model — load with `model.load_state_dict(torch.load(..., weights_only=True))`.
- Batch file (`손글씨_숫자인식.bat`) must not contain `chcp 65001` — it causes cmd to misparse the file when saved as UTF-8.
