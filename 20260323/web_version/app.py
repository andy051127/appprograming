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
    from PIL import Image
    from flask import Flask, request, jsonify, render_template
except ImportError:
    install_requirements()
    import torch
    import torch.nn as nn
    import numpy as np
    from PIL import Image
    from flask import Flask, request, jsonify, render_template

import base64
import io

_ROOT      = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(_ROOT, "digit_model.pth")
MODEL_SIZE = 28
DEVICE     = torch.device("cpu")


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


# ── Flask 앱 ──────────────────────────────────────────────────────────────────
app   = Flask(__name__)
model = None  # 서버 시작 시 로드


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data or "image" not in data:
        return jsonify({"error": "No image data"}), 400

    # base64 PNG → PIL 이미지 (흑백)
    img_data = base64.b64decode(data["image"].split(",")[1])
    img = Image.open(io.BytesIO(img_data)).convert("L")
    img = img.resize((MODEL_SIZE, MODEL_SIZE), Image.LANCZOS)

    arr = (np.array(img, dtype="float32") / 255.0 - 0.1307) / 0.3081
    x   = torch.tensor(arr, dtype=torch.float32).unsqueeze(0).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        probs = torch.softmax(model(x), dim=1)[0].numpy()

    digit = int(probs.argmax())
    return jsonify({
        "digit":       digit,
        "confidence":  round(float(probs[digit]) * 100, 1),
        "probabilities": [round(float(p) * 100, 1) for p in probs],
    })


if __name__ == "__main__":
    print("모델을 준비합니다...")
    model = get_model()
    print("서버를 시작합니다 → http://127.0.0.1:5000\n")
    app.run(debug=False, port=5000)
