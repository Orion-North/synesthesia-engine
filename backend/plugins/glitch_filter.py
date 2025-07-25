import random

def process_event(event):
    # Randomly drop 10% of file‑system events
    if event.get("type") == "fs_event" and random.random() < 0.1:
        return None
    return event
