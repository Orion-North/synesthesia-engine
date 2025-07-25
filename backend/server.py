import os
import sys
import asyncio
import importlib
from aiohttp import web
from shared.utils import load_config, setup_logging
from backend.observer import observe
from backend.metrics import collect_metrics

# Ensure project root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(__file__, "..", "..")))

class SynesthesiaServer:
    def __init__(self, cfg):
        setup_logging(cfg.get("log_level", "INFO"))
        self.host = cfg["server"]["host"]
        self.port = cfg["server"]["port"]
        self.static_dir = cfg["frontend"]["static_dir"]
        self.plugin_names = cfg.get("plugins", [])
        self.obs_paths = cfg["observer"]["watch_paths"]
        self.metrics_interval = cfg["metrics"]["interval"]
        self.app = web.Application()
        self.app.router.add_static("/", os.path.abspath(self.static_dir), show_index=True)
        self.app.router.add_get("/ws", self.websocket_handler)
        self.clients = set()
        self.queue = asyncio.Queue()
        self.plugins = self.load_plugins()

    def load_plugins(self):
        plugins = []
        for name in self.plugin_names:
            try:
                mod = importlib.import_module(f"backend.plugins.{name}")
                if hasattr(mod, "process_event"):
                    plugins.append(mod)
            except Exception as e:
                print(f"[WARN] Failed loading plugin {name}: {e}")
        return plugins

    async def websocket_handler(self, request):
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        self.clients.add(ws)
        try:
            async for _ in ws:
                pass
        finally:
            self.clients.remove(ws)
        return ws

    async def broadcaster(self):
        while True:
            event = await self.queue.get()
            for plugin in self.plugins:
                try:
                    event = plugin.process_event(event)
                    if event is None:
                        break
                except:
                    pass
            if not event:
                continue
            for ws in list(self.clients):
                try:
                    await ws.send_json(event)
                except:
                    pass

    async def start_services(self, app):
        asyncio.create_task(observe(self.obs_paths, self.queue))
        asyncio.create_task(collect_metrics(self.queue, self.metrics_interval))
        asyncio.create_task(self.broadcaster())

    def run(self):
        cfg = load_config("config.yml")
        self.app.on_startup.append(self.start_services)
        web.run_app(self.app, host=self.host, port=self.port)

if __name__ == "__main__":
    cfg = load_config("config.yml")
    SynesthesiaServer(cfg).run()
