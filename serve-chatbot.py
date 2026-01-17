#!/usr/bin/env python3
"""
Simple HTTP server to serve the chatbot-test-ui.html file.
This is needed because browsers block CORS requests from file:// protocol.
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

PORT = 8000
HTML_FILE = "chatbot-test-ui.html"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        # Custom log format
        print(f"[{self.log_date_time_string()}] {format % args}")

def main():
    # Check if HTML file exists
    if not Path(HTML_FILE).exists():
        print(f"❌ Error: {HTML_FILE} not found in current directory!")
        print(f"   Current directory: {os.getcwd()}")
        return
    
    # Create server
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        url = f"http://localhost:{PORT}/{HTML_FILE}"
        print("=" * 60)
        print(f"🚀 Chatbot Test Server Started!")
        print("=" * 60)
        print(f"📁 Serving files from: {os.getcwd()}")
        print(f"🌐 Chatbot UI: {url}")
        print(f"🔗 PrivateGPT API: http://localhost:8001/v1/chat/completions")
        print("=" * 60)
        print(f"\n✅ Server is running on port {PORT}")
        print(f"📖 Open your browser to: {url}")
        print(f"\n⚠️  Press Ctrl+C to stop the server\n")
        
        # Try to open browser automatically
        try:
            webbrowser.open(url)
            print(f"🌐 Opened browser automatically\n")
        except:
            print(f"⚠️  Could not open browser automatically. Please open manually: {url}\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped by user")
            print("👋 Goodbye!")

if __name__ == "__main__":
    main()

