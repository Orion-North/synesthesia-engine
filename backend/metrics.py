# backend/metrics.py

import asyncio
import psutil

async def collect_metrics(queue, interval=1):
    # Prime initial CPU reading
    psutil.cpu_percent(None)

    while True:
        cpu = psutil.cpu_percent(None)
        mem = psutil.virtual_memory().percent

        # Try to read a temperature sensor if available
        temp = 0.0
        try:
            temps = psutil.sensors_temperatures()
            if temps:
                # Take the first sensor entry we find
                for sensor_list in temps.values():
                    if sensor_list:
                        temp = sensor_list[0].current
                        break
        except (AttributeError, KeyError):
            temp = 0.0

        data = {
            "type": "metric",
            "cpu_percent": cpu,
            "memory_percent": mem,
            "temperature": temp,
        }
        await queue.put(data)
        await asyncio.sleep(interval)
