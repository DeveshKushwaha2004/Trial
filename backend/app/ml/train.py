"""Training script for the Cognitive Load LSTM model.

Generates synthetic training data and trains the model.
Run: python -m app.ml.train (from the backend directory)
"""

import torch
import torch.nn as nn
import numpy as np
from sklearn.preprocessing import StandardScaler
import pickle
import os
from app.ml.model import CognitiveLoadLSTM

FEATURES = [
    "typing_speed",
    "speed_variance",
    "backspace_rate",
    "mouse_distance",
    "mouse_jitter",
    "tab_switch_count",
]
LABELS = ["Low", "Medium", "High"]
SEQ_LENGTH = 12  # 12 x 5 seconds = 60 seconds window
MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")


def generate_synthetic_data(n_samples=3000):
    """Generate synthetic training data with realistic patterns."""
    np.random.seed(42)
    data = []
    labels = []

    for _ in range(n_samples):
        label = np.random.choice([0, 1, 2])

        if label == 0:  # Low load
            seq = np.column_stack([
                np.random.normal(3.0, 0.5, SEQ_LENGTH),   # typing_speed
                np.random.normal(0.2, 0.1, SEQ_LENGTH),   # speed_variance
                np.random.normal(0.05, 0.02, SEQ_LENGTH),  # backspace_rate
                np.random.normal(200, 50, SEQ_LENGTH),     # mouse_distance
                np.random.normal(5, 2, SEQ_LENGTH),        # mouse_jitter
                np.random.normal(0.5, 0.3, SEQ_LENGTH),   # tab_switch_count
            ])
        elif label == 1:  # Medium load
            seq = np.column_stack([
                np.random.normal(5.0, 1.0, SEQ_LENGTH),
                np.random.normal(0.8, 0.3, SEQ_LENGTH),
                np.random.normal(0.15, 0.05, SEQ_LENGTH),
                np.random.normal(400, 100, SEQ_LENGTH),
                np.random.normal(15, 5, SEQ_LENGTH),
                np.random.normal(2.0, 1.0, SEQ_LENGTH),
            ])
        else:  # High load
            seq = np.column_stack([
                np.random.normal(7.0, 2.0, SEQ_LENGTH),
                np.random.normal(2.0, 0.5, SEQ_LENGTH),
                np.random.normal(0.3, 0.1, SEQ_LENGTH),
                np.random.normal(600, 150, SEQ_LENGTH),
                np.random.normal(30, 10, SEQ_LENGTH),
                np.random.normal(5.0, 2.0, SEQ_LENGTH),
            ])

        data.append(seq)
        labels.append(label)

    return np.array(data, dtype=np.float32), np.array(labels, dtype=np.int64)


def train_model():
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("Generating synthetic training data...")
    X, y = generate_synthetic_data()

    # Normalize
    scaler = StandardScaler()
    X_flat = X.reshape(-1, 6)
    X_flat = scaler.fit_transform(X_flat)
    X = X_flat.reshape(-1, SEQ_LENGTH, 6)

    # Save scaler
    with open(os.path.join(MODEL_DIR, "scaler.pkl"), "wb") as f:
        pickle.dump(scaler, f)

    # Split
    split = int(0.8 * len(X))
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    X_train = torch.FloatTensor(X_train)
    y_train = torch.LongTensor(y_train)
    X_val = torch.FloatTensor(X_val)
    y_val = torch.LongTensor(y_val)

    # Model
    model = CognitiveLoadLSTM()
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    # Training
    print("Training LSTM model...")
    epochs = 50
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()

        if (epoch + 1) % 10 == 0:
            model.eval()
            with torch.no_grad():
                val_out = model(X_val)
                val_loss = criterion(val_out, y_val)
                preds = torch.argmax(val_out, dim=1)
                acc = (preds == y_val).float().mean()
            print(
                f"Epoch [{epoch+1}/{epochs}] "
                f"Loss: {loss.item():.4f} "
                f"Val Loss: {val_loss.item():.4f} "
                f"Val Acc: {acc.item():.4f}"
            )

    # Save model
    model_path = os.path.join(MODEL_DIR, "saved_model.pth")
    torch.save(model.state_dict(), model_path)
    print(f"Model saved to {model_path}")


if __name__ == "__main__":
    train_model()
