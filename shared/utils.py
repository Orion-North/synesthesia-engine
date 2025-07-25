import yaml
import logging

def load_config(path="config.yml"):
    with open(path) as f:
        return yaml.safe_load(f)

def setup_logging(level="INFO"):
    lvl = getattr(logging, level.upper(), logging.INFO)
    logging.basicConfig(level=lvl, format="%(asctime)s %(levelname)s %(message)s")
