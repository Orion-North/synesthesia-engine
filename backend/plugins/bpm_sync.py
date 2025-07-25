def process_event(event):
    # derive a fake bpm from cpu percent
    if event.get("type") == "metric":
        cpu = event.get("cpu_percent", 0)
        # map cpu% [0–100] to bpm [60–180]
        event["bpm"] = int(60 + cpu * 1.2)
    return event
# demo save 
# demo save
