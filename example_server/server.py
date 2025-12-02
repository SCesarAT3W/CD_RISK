import http.server
import socketserver

class FallbackHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.path = '/index.html'
            return http.server.SimpleHTTPRequestHandler.do_GET(self)
        return super().send_error(code, message, explain)

PORT = 8000
Handler = FallbackHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
