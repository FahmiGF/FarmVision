import os
import sys
import socket
import webbrowser
import threading
import time
import uvicorn

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def open_browser_delayed(url: str, delay: float = 1.2):
    def _open():
        time.sleep(delay)
        print(f"\n🚀 Membuka FarmVision di peramban: {url}")
        webbrowser.open(url)
    threading.Thread(target=_open, daemon=True).start()

if __name__ == "__main__":
    port = 8081
    if is_port_in_use(port):
        for alt_port in [8082, 8083, 8000, 8090]:
            if not is_port_in_use(alt_port):
                port = alt_port
                break

    url = f"http://127.0.0.1:{port}"
    print(f"🌾 FarmVision Intelligent Agriculture Platform starting on {url}")
    open_browser_delayed(url)
    uvicorn.run("app.main:app", host="127.0.0.1", port=port, reload=False)
