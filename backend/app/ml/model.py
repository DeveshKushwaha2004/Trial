import torch
import torch.nn as nn


class CognitiveLoadLSTM(nn.Module):
    """LSTM model for cognitive load classification.

    Input: 6 features (typing_speed, speed_variance, backspace_rate,
           mouse_distance, mouse_jitter, tab_switch_count)
    Output: 3 classes (Low, Medium, High)
    """

    def __init__(self, input_size=6, hidden_size=64, num_layers=2, num_classes=3):
        super(CognitiveLoadLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.3,
        )
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, num_classes),
        )

    def forward(self, x):
        # x shape: (batch, seq_len, input_size)
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)

        out, _ = self.lstm(x, (h0, c0))
        out = out[:, -1, :]  # Take last time step
        out = self.fc(out)
        return out
