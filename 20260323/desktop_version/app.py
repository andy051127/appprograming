import subprocess
import sys
import os

def install_requirements():
    req_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "requirements.txt")
    if os.path.exists(req_file):
        print("필요한 패키지를 설치 중...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", req_file])
        print("패키지 설치 완료!\n")

try:
    import torch
    import torch.nn as nn
    import numpy as np
    from PIL import Image, ImageDraw
except ImportError:
    install_requirements()
    import torch
    import torch.nn as nn
    import numpy as np
    from PIL import Image, ImageDraw

import tkinter as tk
from tkinter import ttk

# 루트 폴더의 공유 모델 사용, 없으면 현재 폴더에 저장
_ROOT        = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH   = os.path.join(_ROOT, "digit_model.pth")
CANVAS_SIZE  = 280
MODEL_SIZE   = 28
BRUSH_RADIUS = 12
DEVICE       = torch.device("cpu")


# ── CNN 모델 ──────────────────────────────────────────────────────────────────
class DigitCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64 * 7 * 7, 128), nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(128, 10),
        )

    def forward(self, x):
        return self.classifier(self.features(x))


def train_model():
    print("MNIST 데이터셋으로 모델을 학습합니다 (최초 1회, 수 분 소요)...")
    from torchvision import datasets, transforms
    from torch.utils.data import DataLoader

    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,)),
    ])
    train_ds = datasets.MNIST(root=_ROOT, train=True,  download=True, transform=transform)
    test_ds  = datasets.MNIST(root=_ROOT, train=False, download=True, transform=transform)
    train_dl = DataLoader(train_ds, batch_size=128, shuffle=True)
    test_dl  = DataLoader(test_ds,  batch_size=256, shuffle=False)

    model     = DigitCNN().to(DEVICE)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(5):
        model.train()
        total_loss = 0
        for imgs, labels in train_dl:
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
            optimizer.zero_grad()
            loss = criterion(model(imgs), labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        model.eval()
        correct = 0
        with torch.no_grad():
            for imgs, labels in test_dl:
                imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
                correct += (model(imgs).argmax(1) == labels).sum().item()
        acc = correct / len(test_ds) * 100
        print(f"  Epoch {epoch+1}/5  loss={total_loss/len(train_dl):.4f}  test_acc={acc:.2f}%")

    torch.save(model.state_dict(), MODEL_PATH)
    print(f"모델 저장 완료 → {MODEL_PATH}\n")
    return model


def get_model():
    model = DigitCNN().to(DEVICE)
    if os.path.exists(MODEL_PATH):
        print("저장된 모델을 로드합니다...")
        model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True))
    else:
        model = train_model()
    model.eval()
    return model


def preprocess(pil_img: Image.Image) -> torch.Tensor:
    img = pil_img.resize((MODEL_SIZE, MODEL_SIZE), Image.LANCZOS)
    arr = (np.array(img, dtype="float32") / 255.0 - 0.1307) / 0.3081
    return torch.tensor(arr, dtype=torch.float32).unsqueeze(0).unsqueeze(0)


# ── GUI ───────────────────────────────────────────────────────────────────────
class App:
    def __init__(self, root: tk.Tk, model: DigitCNN):
        self.root  = root
        self.model = model
        self.root.title("손글씨 숫자 인식 - Desktop")
        self.root.resizable(False, False)
        self._reset_image()
        self._build_ui()

    def _build_ui(self):
        pad = dict(padx=8, pady=4)

        tk.Label(self.root, text="손글씨 숫자 인식",
                 font=("Arial", 17, "bold")).grid(row=0, column=0, columnspan=2, pady=(10, 2))

        self.canvas = tk.Canvas(self.root, width=CANVAS_SIZE, height=CANVAS_SIZE,
                                bg="black", cursor="crosshair",
                                highlightthickness=2, highlightbackground="#444")
        self.canvas.grid(row=1, column=0, columnspan=2, **pad)
        self.canvas.bind("<Button-1>",        self._on_press)
        self.canvas.bind("<B1-Motion>",       self._on_drag)
        self.canvas.bind("<ButtonRelease-1>", self._on_release)

        self.result_var = tk.StringVar(value="숫자를 그리세요")
        tk.Label(self.root, textvariable=self.result_var,
                 font=("Arial", 22, "bold"), fg="#1565C0").grid(
                 row=2, column=0, columnspan=2, pady=4)

        conf_frame = tk.LabelFrame(self.root, text="  각 숫자 신뢰도  ",
                                   font=("Arial", 10), padx=6, pady=4)
        conf_frame.grid(row=3, column=0, columnspan=2, sticky="ew", **pad)

        style = ttk.Style()
        style.theme_use("clam")
        style.configure("bar.Horizontal.TProgressbar",
                        troughcolor="#e0e0e0", background="#1976D2")

        self.bars     = []
        self.pct_vars = []
        for i in range(10):
            tk.Label(conf_frame, text=str(i), width=2,
                     font=("Arial", 11, "bold")).grid(row=i, column=0)
            bar = ttk.Progressbar(conf_frame, length=220, maximum=100,
                                  style="bar.Horizontal.TProgressbar")
            bar.grid(row=i, column=1, padx=4, pady=1)
            pv = tk.StringVar(value=" 0.0%")
            tk.Label(conf_frame, textvariable=pv, width=6,
                     font=("Courier", 10)).grid(row=i, column=2)
            self.bars.append(bar)
            self.pct_vars.append(pv)

        btn_frame = tk.Frame(self.root)
        btn_frame.grid(row=4, column=0, columnspan=2, pady=8)
        tk.Button(btn_frame, text="인   식", width=10, bg="#1976D2", fg="white",
                  font=("Arial", 11, "bold"), relief="flat",
                  command=self._predict).grid(row=0, column=0, padx=10)
        tk.Button(btn_frame, text="지우기", width=10, bg="#e53935", fg="white",
                  font=("Arial", 11, "bold"), relief="flat",
                  command=self._clear).grid(row=0, column=1, padx=10)

        tk.Label(self.root, text="그림을 그린 뒤 손을 떼면 자동으로 인식합니다",
                 fg="gray", font=("Arial", 9)).grid(
                 row=5, column=0, columnspan=2, pady=(0, 8))

    def _reset_image(self):
        self.pil_img  = Image.new("L", (CANVAS_SIZE, CANVAS_SIZE), 0)
        self.pil_draw = ImageDraw.Draw(self.pil_img)
        self._last_xy = None

    def _paint(self, x, y):
        r    = BRUSH_RADIUS
        bbox = [x - r, y - r, x + r, y + r]
        self.canvas.create_oval(*bbox, fill="white", outline="white")
        self.pil_draw.ellipse(bbox, fill=255)
        if self._last_xy:
            lx, ly = self._last_xy
            self.canvas.create_line(lx, ly, x, y, fill="white",
                                    width=r * 2, capstyle=tk.ROUND, joinstyle=tk.ROUND)
            self.pil_draw.line([lx, ly, x, y], fill=255, width=r * 2)
        self._last_xy = (x, y)

    def _on_press(self, e):   self._last_xy = None; self._paint(e.x, e.y)
    def _on_drag(self, e):    self._paint(e.x, e.y)
    def _on_release(self, _): self._last_xy = None; self._predict()

    def _predict(self):
        if np.array(self.pil_img).max() == 0:
            return
        x = preprocess(self.pil_img).to(DEVICE)
        with torch.no_grad():
            probs = torch.softmax(self.model(x), dim=1)[0].numpy()
        digit = int(probs.argmax())
        self.result_var.set(f"예측:  {digit}    ({probs[digit]*100:.1f}%)")
        for i, (bar, pv) in enumerate(zip(self.bars, self.pct_vars)):
            bar["value"] = float(probs[i]) * 100
            pv.set(f"{probs[i]*100:5.1f}%")

    def _clear(self):
        self.canvas.delete("all")
        self._reset_image()
        self.result_var.set("숫자를 그리세요")
        for bar, pv in zip(self.bars, self.pct_vars):
            bar["value"] = 0
            pv.set(" 0.0%")


def main():
    print("모델을 준비합니다...")
    model = get_model()
    print("준비 완료!\n")
    root = tk.Tk()
    App(root, model)
    root.mainloop()


if __name__ == "__main__":
    main()
