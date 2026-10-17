#!/usr/bin/env python3
"""
智航罗盘 AI Compass - 本地极速启动服务器
使用 Python 标准库，零第三方依赖，一键在浏览器打开测试。
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 允许跨域与无缓存开发体验
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

def run():
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    
    # 尝试绑定端口，若被占用顺延
    port = PORT
    for attempt in range(5):
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                url = f"http://localhost:{port}"
                print("=" * 60)
                print("🚀 智航罗盘 AI Compass 已成功启动！")
                print(f"👉 本地访问地址: {url}")
                print(f"👉 移动端调试: 请确保手机与电脑在同一局域网内")
                print("=" * 60)
                print("按 Ctrl + C 可终止本地服务器\n")
                
                # 自动尝试唤起默认浏览器
                try:
                    webbrowser.open(url)
                except Exception:
                    pass
                    
                httpd.serve_forever()
                break
        except OSError:
            port += 1

if __name__ == '__main__':
    try:
        run()
    except KeyboardInterrupt:
        print("\n服务器已正常关闭。")
        sys.exit(0)
