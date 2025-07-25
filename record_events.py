# record_events.py
import os, sys, asyncio, json
# add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(__file__, os.pardir)))
from backend.observer import observe
from backend.metrics  import collect_metrics

async def record(duration_secs=30):
    queue = asyncio.Queue()
    # start watching and metrics
    asyncio.create_task(observe(["./"], queue))
    asyncio.create_task(collect_metrics(queue, interval=1))
    events = []
    start = asyncio.get_event_loop().time()

    while True:
        ev = await queue.get()
        ev["_time"] = asyncio.get_event_loop().time() - start
        events.append(ev)
        if asyncio.get_event_loop().time() - start > duration_secs:
            break

    # ensure frontend folder exists
    os.makedirs("frontend", exist_ok=True)
    with open("frontend/events.json","w") as f:
        json.dump(events, f)

if __name__ == "__main__":
    asyncio.run(record(30))  # record 30 seconds