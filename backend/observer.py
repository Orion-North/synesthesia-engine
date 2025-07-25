import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from pynput.keyboard import Listener

class WatchHandler(FileSystemEventHandler):
    def __init__(self, queue):
        super().__init__()
        self.queue = queue

    def on_any_event(self, event):
        payload = {
            "type": "fs_event",
            "event_type": event.event_type,
            "src_path": event.src_path,
            "is_directory": event.is_directory,
        }
        asyncio.create_task(self.queue.put(payload))

async def observe(paths, queue):
    handler = WatchHandler(queue)
    observer = Observer()
    for p in paths:
        observer.schedule(handler, path=p, recursive=True)
    observer.start()

    def on_press(key):
        try:
            # Count only real character keypresses
            _ = key.char
            payload = {"type": "typing"}
            asyncio.create_task(queue.put(payload))
        except AttributeError:
            pass

    listener = Listener(on_press=on_press)
    listener.start()

    try:
        while True:
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        observer.stop()
        observer.join()
        listener.stop()
