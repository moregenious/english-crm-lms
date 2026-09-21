from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import os
import sys
import json
import uuid
import re
import urllib.parse
import mimetypes
import email
from email import policy

from wma_transcoder import WMATranscoder
from vocab_parser import parse_vocab_document

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
DB_FILE = os.path.join(BASE_DIR, 'db.json')

os.chdir(BASE_DIR)
if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

# Ensure exact MIME types for documents and expanded audio formats
mimetypes.add_type('application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx')
mimetypes.add_type('application/msword', '.doc')
mimetypes.add_type('application/pdf', '.pdf')
mimetypes.add_type('audio/mpeg', '.mp3')
mimetypes.add_type('audio/wav', '.wav')
mimetypes.add_type('audio/x-ms-wma', '.wma')
mimetypes.add_type('audio/wma', '.wma')
mimetypes.add_type('audio/ogg', '.ogg')
mimetypes.add_type('audio/ogg', '.oga')
mimetypes.add_type('audio/mp4', '.m4a')
mimetypes.add_type('audio/aac', '.aac')
mimetypes.add_type('audio/flac', '.flac')
mimetypes.add_type('audio/webm', '.weba')
mimetypes.add_type('audio/webm', '.webm')
mimetypes.add_type('audio/opus', '.opus')
mimetypes.add_type('audio/midi', '.mid')
mimetypes.add_type('audio/midi', '.midi')
mimetypes.add_type('audio/amr', '.amr')
mimetypes.add_type('audio/aiff', '.aiff')
mimetypes.add_type('audio/aiff', '.aif')

AUDIO_EXTENSIONS = ['.mp3', '.wav', '.wma', '.ogg', '.oga', '.m4a', '.aac', '.flac', '.weba', '.webm', '.opus', '.mid', '.midi', '.amr', '.aiff', '.aif']
DOC_EXTENSIONS = ['.doc', '.docx', '.docm', '.dotx', '.rtf', '.txt']
IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']

class Handler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path

        if clean_path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return

        # Database state sync across devices (PC, Phone, Tablet)
        if clean_path == '/api/state':
            if os.path.isfile(DB_FILE):
                with open(DB_FILE, 'rb') as f:
                    data = f.read()
            else:
                data = json.dumps({}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        # Support HTTP Range requests (206 Partial Content) and transparent WMA playback
        if clean_path.startswith('/uploads/'):
            clean_path_rel = urllib.parse.unquote(clean_path.lstrip('/'))
            fpath = os.path.join(BASE_DIR, clean_path_rel)
            
            # If WMA is requested for playback (not explicitly download=1), ensure and serve playable WAV
            is_download = ('download=1' in parsed.query) or ('download=true' in parsed.query)
            target_fpath = fpath
            if clean_path.lower().endswith('.wma') and not is_download:
                wav_fpath = os.path.splitext(fpath)[0] + '.wav'
                if not os.path.isfile(wav_fpath) and os.path.isfile(fpath):
                    try:
                        WMATranscoder.convert_wma_to_wav(fpath, wav_fpath)
                    except Exception as conv_e:
                        print(f"On-demand WMA transcode error: {conv_e}", flush=True)
                if os.path.isfile(wav_fpath):
                    target_fpath = wav_fpath

            if os.path.isfile(target_fpath):
                try:
                    total_size = os.path.getsize(target_fpath)
                    ctype, _ = mimetypes.guess_type(target_fpath)
                    if not ctype:
                        ctype = 'audio/wav' if target_fpath.lower().endswith('.wav') else 'application/octet-stream'

                    range_header = self.headers.get('Range')
                    if range_header and range_header.startswith('bytes='):
                        range_val = range_header.split('=')[1].strip()
                        start_str, _, end_str = range_val.partition('-')
                        start = int(start_str) if start_str else 0
                        end = int(end_str) if end_str else total_size - 1
                        if end >= total_size:
                            end = total_size - 1
                        length = end - start + 1

                        self.send_response(206)
                        self.send_header('Content-Type', ctype)
                        self.send_header('Content-Range', f'bytes {start}-{end}/{total_size}')
                        self.send_header('Content-Length', str(length))
                        self.send_header('Accept-Ranges', 'bytes')
                        self.end_headers()

                        with open(target_fpath, 'rb') as f:
                            f.seek(start)
                            bytes_left = length
                            chunk_size = 64 * 1024
                            while bytes_left > 0:
                                chunk = f.read(min(bytes_left, chunk_size))
                                if not chunk:
                                    break
                                try:
                                    self.wfile.write(chunk)
                                except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
                                    break
                                bytes_left -= len(chunk)
                        return
                    else:
                        # Full file response
                        self.send_response(200)
                        self.send_header('Content-Type', ctype)
                        self.send_header('Content-Length', str(total_size))
                        self.send_header('Accept-Ranges', 'bytes')
                        self.end_headers()
                        with open(target_fpath, 'rb') as f:
                            chunk_size = 64 * 1024
                            while True:
                                chunk = f.read(chunk_size)
                                if not chunk:
                                    break
                                try:
                                    self.wfile.write(chunk)
                                except (ConnectionResetError, BrokenPipeError, ConnectionAbortedError):
                                    break
                        return
                except Exception as e:
                    print(f"Error serving upload file: {e}", flush=True)

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        clean_path = parsed.path

        if clean_path == '/api/state':
            try:
                raw_len = str(self.headers.get('Content-Length', '0')).split(',')[0].strip()
                length = int(raw_len) if raw_len.isdigit() else 0
                body = self.rfile.read(length)
                # Verify JSON integrity before saving
                json.loads(body.decode('utf-8'))
                tmp_file = DB_FILE + '.tmp'
                with open(tmp_file, 'wb') as f:
                    f.write(body)
                os.replace(tmp_file, DB_FILE)
                resp = json.dumps({"success": True}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return
            except Exception as e:
                self.send_error(500, str(e))
                return

        if clean_path == '/api/upload':
            try:
                raw_len = str(self.headers.get('Content-Length', '0')).split(',')[0].strip()
                length = int(raw_len) if raw_len.isdigit() else 0
                ctype = self.headers.get('Content-Type', '')
                body = self.rfile.read(length)
                
                file_info = None
                explicit_target = None
                
                # Primary: Use Python email parser for clean binary multipart extraction
                try:
                    msg = email.message_from_bytes(
                        b'Content-Type: ' + ctype.encode('latin-1', errors='ignore') + b'\r\n\r\n' + body,
                        policy=policy.default
                    )
                    for part in msg.iter_parts():
                        name_attr = part.get_param('name', header='content-disposition')
                        if name_attr == 'target':
                            payload = part.get_payload(decode=True)
                            if payload:
                                explicit_target = payload.decode('utf-8', errors='ignore').strip()
                        
                        filename = part.get_filename()
                        if filename:
                            content = part.get_payload(decode=True)
                            if content is not None:
                                clean_fname = os.path.basename(filename).replace(' ', '_').strip('"\'')
                                if not clean_fname:
                                    clean_fname = "document.docx"
                                unique_name = f"{uuid.uuid4().hex[:8]}_{clean_fname}"
                                fpath = os.path.join(UPLOADS_DIR, unique_name)
                                with open(fpath, 'wb') as f:
                                    f.write(content)
                                    
                                ext = os.path.splitext(clean_fname)[1].lower()
                                ftype = 'document'
                                play_url = f"/uploads/{unique_name}"

                                if ext in AUDIO_EXTENSIONS:
                                    ftype = 'audio'
                                    if ext == '.wma':
                                        wav_unique_name = os.path.splitext(unique_name)[0] + ".wav"
                                        wav_fpath = os.path.join(UPLOADS_DIR, wav_unique_name)
                                        try:
                                            WMATranscoder.convert_wma_to_wav(fpath, wav_fpath)
                                            play_url = f"/uploads/{wav_unique_name}"
                                        except Exception as wma_err:
                                            print(f"Upload WMA transcode error: {wma_err}", flush=True)
                                            play_url = f"/uploads/{unique_name}"
                                elif ext in IMAGE_EXTENSIONS:
                                    ftype = 'image'
                                elif ext in ['.pdf']:
                                    ftype = 'pdf'
                                elif ext in DOC_EXTENSIONS:
                                    ftype = 'document'
                                    
                                target_cat = explicit_target or ('teacher_admin' if ext in DOC_EXTENSIONS else 'student')
                                size_kb = round(len(content) / 1024, 1)
                                file_info = {
                                    "id": "f-" + uuid.uuid4().hex[:8],
                                    "name": clean_fname,
                                    "type": ftype,
                                    "target": target_cat,
                                    "url": play_url,
                                    "download_url": f"/uploads/{unique_name}?download=1",
                                    "size": f"{size_kb} KB"
                                }
                                break
                except Exception as parse_err:
                    print("Email multipart parser failed, falling back to manual boundary split:", parse_err, flush=True)
                
                # Fallback: Manual boundary split if email parser didn't find file
                if not file_info:
                    m = re.search(r'boundary=([^\s;]+)', ctype)
                    if m:
                        boundary = m.group(1).encode('latin-1').strip(b'"')
                        parts = body.split(b'--' + boundary)
                        for p in parts:
                            if b'name="target"' in p:
                                _, _, tcontent = p.partition(b'\r\n\r\n')
                                explicit_target = tcontent.split(b'\r\n')[0].decode('utf-8', errors='ignore').strip()
                            if b'filename=' in p:
                                hdr, _, content = p.partition(b'\r\n\r\n')
                                hdr_text = hdr.decode('utf-8', errors='ignore')
                                fn_m = re.search(r'filename="?([^";\r\n]+)"?', hdr_text)
                                fname = fn_m.group(1) if fn_m else 'document.docx'
                                fname = os.path.basename(fname).replace(' ', '_').strip('"\'')
                                
                                if content.endswith(b'\r\n'):
                                    content = content[:-2]
                                if content.endswith(b'--'):
                                    content = content[:-2]
                                if content.endswith(b'\r\n'):
                                    content = content[:-2]
                                    
                                unique_name = f"{uuid.uuid4().hex[:8]}_{fname}"
                                fpath = os.path.join(UPLOADS_DIR, unique_name)
                                with open(fpath, 'wb') as f:
                                    f.write(content)
                                    
                                ext = os.path.splitext(fname)[1].lower()
                                ftype = 'document'
                                play_url = f"/uploads/{unique_name}"

                                if ext in AUDIO_EXTENSIONS:
                                    ftype = 'audio'
                                    if ext == '.wma':
                                        wav_unique_name = os.path.splitext(unique_name)[0] + ".wav"
                                        wav_fpath = os.path.join(UPLOADS_DIR, wav_unique_name)
                                        try:
                                            WMATranscoder.convert_wma_to_wav(fpath, wav_fpath)
                                            play_url = f"/uploads/{wav_unique_name}"
                                        except Exception as wma_err:
                                            print(f"Fallback Upload WMA transcode error: {wma_err}", flush=True)
                                            play_url = f"/uploads/{unique_name}"
                                elif ext in IMAGE_EXTENSIONS:
                                    ftype = 'image'
                                elif ext in ['.pdf']:
                                    ftype = 'pdf'
                                elif ext in DOC_EXTENSIONS:
                                    ftype = 'document'
                                    
                                target_cat = explicit_target or ('teacher_admin' if ext in DOC_EXTENSIONS else 'student')
                                size_kb = round(len(content) / 1024, 1)
                                file_info = {
                                    "id": "f-" + uuid.uuid4().hex[:8],
                                    "name": fname,
                                    "type": ftype,
                                    "target": target_cat,
                                    "url": play_url,
                                    "download_url": f"/uploads/{unique_name}?download=1",
                                    "size": f"{size_kb} KB"
                                }
                                break

                if file_info:
                    resp = json.dumps({"success": True, "file": file_info}).encode('utf-8')
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.send_header('Content-Length', str(len(resp)))
                    self.end_headers()
                    self.wfile.write(resp)
                    return
                self.send_error(400, "File missing in upload request")
            except Exception as e:
                self.send_error(500, str(e))
            return

        if clean_path == '/api/parse-vocab-doc':
            try:
                raw_len = str(self.headers.get('Content-Length', '0')).split(',')[0].strip()
                length = int(raw_len) if raw_len.isdigit() else 0
                ctype = self.headers.get('Content-Type', '')
                body = self.rfile.read(length)

                file_content = None
                file_name = "document.docx"

                try:
                    msg = email.message_from_bytes(
                        b'Content-Type: ' + ctype.encode('latin-1', errors='ignore') + b'\r\n\r\n' + body,
                        policy=policy.default
                    )
                    for part in msg.iter_parts():
                        filename = part.get_filename()
                        if filename:
                            file_content = part.get_payload(decode=True)
                            file_name = os.path.basename(filename).strip('"\'')
                            break
                except Exception as parse_err:
                    print("Email multipart parser failed in parse-vocab-doc:", parse_err, flush=True)

                if not file_content:
                    m = re.search(r'boundary=([^\s;]+)', ctype)
                    if m:
                        boundary = m.group(1).encode('latin-1').strip(b'"')
                        parts = body.split(b'--' + boundary)
                        for p in parts:
                            if b'filename=' in p:
                                hdr, _, content = p.partition(b'\r\n\r\n')
                                hdr_text = hdr.decode('utf-8', errors='ignore')
                                fn_m = re.search(r'filename="?([^";\r\n]+)"?', hdr_text)
                                if fn_m:
                                    file_name = os.path.basename(fn_m.group(1)).strip('"\'')
                                if content.endswith(b'\r\n'):
                                    content = content[:-2]
                                if content.endswith(b'--'):
                                    content = content[:-2]
                                if content.endswith(b'\r\n'):
                                    content = content[:-2]
                                file_content = content
                                break

                if not file_content:
                    resp = json.dumps({"success": False, "error": "Файл не был передан"}).encode('utf-8')
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json; charset=utf-8')
                    self.send_header('Content-Length', str(len(resp)))
                    self.end_headers()
                    self.wfile.write(resp)
                    return

                words = parse_vocab_document(file_content, file_name)
                resp = json.dumps({
                    "success": True,
                    "filename": file_name,
                    "count": len(words),
                    "words": words
                }).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return
            except Exception as e:
                resp = json.dumps({"success": False, "error": str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Content-Length', str(len(resp)))
                self.end_headers()
                self.wfile.write(resp)
                return

        self.send_error(404, "Not Found")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Range')
        self.send_header('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length')
        self.end_headers()

if __name__ == '__main__':
    ThreadingHTTPServer.allow_reuse_address = False
    httpd = ThreadingHTTPServer(('0.0.0.0', PORT), Handler)
    print(f"Server started at http://localhost:{PORT}", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
