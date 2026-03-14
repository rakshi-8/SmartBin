import http.server
import socketserver
import json
import os

PORT = 8000
DB_FILE = 'db.json'

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/bins':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            if os.path.exists(DB_FILE):
                with open(DB_FILE, 'r') as f:
                    self.wfile.write(f.read().encode())
            else:
                self.wfile.write(b'[]')
        else:
            return super().do_GET()

    def do_POST(self):
        if self.path == '/api/bins':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            with open(DB_FILE, 'w') as f:
                f.write(post_data.decode('utf-8'))
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success"}).encode())
            
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"API Server & Dashboard running on port {PORT}...")
    httpd.serve_forever()
