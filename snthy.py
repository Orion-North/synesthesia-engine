import os

# Base project directory
base_dir = 'synesthesia-engine'

# Directories to create
dirs = [
    'backend',
    'backend/plugins',
    'frontend',
    'frontend/themes',
    'shared',
]

# Files to create with placeholder content
files = {
    'README.md': """# Synesthesia Engine

A synesthetic coding toolkit that turns live code execution into ambient audio-visual output.
""",
    'config.yml': """# YAML configuration for Synesthesia Engine
pipeline:
  - observer
  - metrics
  - server
""",
    'requirements.txt': """watchdog
psutil
asyncio
websockets
pynput
PyYAML
""",
    'backend/observer.py': """\"\"\"
Observer module: watches file changes, key events.
\"\"\"

import asyncio
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# TODO: Implement observer logic
""",
    'backend/metrics.py': """\"\"\"
Metrics module: CPU/memory tracking.
\"\"\"

import psutil

# TODO: Implement metrics collection
""",
    'backend/server.py': """\"\"\"
Server module: WebSocket server for frontend clients.
\"\"\"

import asyncio
import websockets

# TODO: Implement WebSocket server
""",
    'backend/plugins/glitch_filter.py': """\"\"\"
Glitch filter plugin.
\"\"\"

# TODO: Define plugin behavior
""",
    'backend/plugins/bpm_sync.py': """\"\"\"
BPM sync plugin.
\"\"\"

# TODO: Define plugin behavior
""",
    'frontend/index.html': """<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Synesthesia Engine</title>
  </head>
  <body>
    <script src="visuals.js"></script>
    <script src="audio.js"></script>
  </body>
</html>
""",
    'frontend/visuals.js': """/* Visuals module: Three.js code for rendering */\n// TODO: Implement visuals */""",
    'frontend/audio.js': """/* Audio module: Web Audio API synthesis */\n// TODO: Implement audio synthesis */""",
    'frontend/themes/synthwave.json': """{
  "background": "#2E044C",
  "particleColor": "#FF6EC7",
  "audioSync": true
}""",
    'shared/protocol.py': """\"\"\"
Protocol definitions between backend and frontend.
\"\"\"

# TODO: Define message schemas
""",
    'shared/utils.py': """\"\"\"
Utility functions.
\"\"\"

# TODO: Add utility functions
""",
}

# Create directories
for d in dirs:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

# Create files with placeholder content
for path, content in files.items():
    file_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w') as f:
        f.write(content)

print(f"Project structure for Synesthesia Engine has been created at ./{base_dir}")
