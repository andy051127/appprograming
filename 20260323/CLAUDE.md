# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

```
20260323/
├── digit_model.pth          # 공유 학습 모델 (최초 실행 시 자동 생성)
├── MNIST/                   # MNIST 데이터셋 (최초 실행 시 자동 다운로드)
├── desktop_version/         # tkinter GUI 버전
│   ├── app.py
│   ├── requirements.txt
│   ├── run.bat
│   └── CLAUDE.md
└── web_version/             # Flask 웹 서버 버전
    ├── app.py
    ├── templates/index.html
    ├── requirements.txt
    ├── run.bat
    └── CLAUDE.md
```

## Running Each Version

```bash
# 데스크톱 버전 (tkinter GUI)
cd desktop_version && python app.py

# 웹 버전 (브라우저: http://127.0.0.1:5000)
cd web_version && python app.py
```

## Shared Resources

- **`digit_model.pth`** — 두 버전이 공유하는 PyTorch state_dict. 처음 실행하는 버전에서 MNIST 5 epoch 학습 후 루트에 저장. 이후 버전은 재학습 없이 로드.
- **`MNIST/`** — 학습용 데이터셋. 마찬가지로 처음 실행하는 버전이 다운로드.

## Architecture Overview

두 버전 모두 동일한 `DigitCNN` 모델(Conv×2 + FC)을 사용하며, 전처리도 동일하다 (28×28 리사이즈 + MNIST 정규화 mean=0.1307, std=0.3081).

- **Desktop** — 브러시 스트로크를 tkinter 캔버스와 PIL 이미지에 동시 반영, 마우스 버튼을 놓으면 즉시 추론.
- **Web** — 브라우저 canvas를 base64 PNG로 직렬화해 Flask `/predict` 엔드포인트에 POST, 서버에서 추론 후 JSON 반환.

## Key Notes

- TensorFlow 미지원(Python 3.14) → PyTorch 사용.
- `.bat` 파일에 `chcp 65001` 사용 금지 — UTF-8로 저장된 배치 파일에서 명령어가 깨짐.
- 모델은 `state_dict`로만 저장/로드 (`weights_only=True` 필수).
