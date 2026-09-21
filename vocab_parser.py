import io
import os
import zipfile
import re
import xml.etree.ElementTree as ET

HEADER_KEYWORDS = {
    'word', 'words', 'vocabulary', 'transcription', 'translation', 'meaning',
    'слово', 'слова', 'транскрипция', 'перевод', 'значение', 'пример', 'примеры',
    'example', 'examples', 'unit', 'lesson', 'урок', '№', 'no', 'num', 'id'
}

def clean_transcription(tr):
    if not tr:
        return ''
    tr = tr.strip(' \t\r\n')
    m = re.search(r'[\[/]([^\]/]+)[\]/]', tr)
    if m:
        content = m.group(1).strip()
        return f"[{content}]" if content else ''
    tr_clean = tr.strip('[]/\\ ')
    return f"[{tr_clean}]" if tr_clean else ''

def is_valid_pair(w, tl):
    if not w or not tl:
        return False
    w_clean = w.strip()
    tl_clean = tl.strip()
    if len(w_clean) < 1 or len(w_clean) > 80:
        return False
    if len(tl_clean) < 1 or len(tl_clean) > 200:
        return False
    if w_clean.lower() in HEADER_KEYWORDS or tl_clean.lower() in HEADER_KEYWORDS:
        return False
    # Word must contain Latin letters
    if not re.search(r'[a-zA-Z]', w_clean):
        return False
    return True

def parse_line_to_word(line):
    line = line.strip()
    if not line:
        return None

    # Strip list markers: 1., 1), *, -, bullet points
    line = re.sub(r'^(?:\d+[\.\)]\s*|[\u2022\u2023\u25E6\u2043\u2219\*\-]\s*)', '', line).strip()
    if not line:
        return None

    # Pattern 1: Word [transcription] [-–—:] translation OR Word [transcription] translation
    m_bracket = re.match(r'^([A-Za-z\s\'-]+?)\s*(?:\[([^\]]+)\]|\/([^\/]+)\/)\s*(?:[-–—:]\s*)?(.+)$', line)
    if m_bracket:
        w = m_bracket.group(1).strip()
        tr = m_bracket.group(2) or m_bracket.group(3) or ''
        tl = m_bracket.group(4).strip(' -–—:')
        return (w, clean_transcription(tr), tl)

    # Pattern 2: Word - translation (with dash/colon)
    m_dash = re.match(r'^([A-Za-z\s\'-]+?)\s*[-–—:]\s*(.+)$', line)
    if m_dash:
        w = m_dash.group(1).strip()
        tl_raw = m_dash.group(2).strip()
        m_inner_tr = re.match(r'^(?:\[([^\]]+)\]|\/([^\/]+)\/)\s*(.+)$', tl_raw)
        if m_inner_tr:
            tr = m_inner_tr.group(1) or m_inner_tr.group(2) or ''
            tl = m_inner_tr.group(3).strip(' -–—:')
            return (w, clean_transcription(tr), tl)
        return (w, '', tl_raw)

    # Pattern 3: Tab or multi-space separated (e.g. from copy-paste or table export)
    parts = [p.strip() for p in re.split(r'\t+|\s{3,}', line) if p.strip()]
    if len(parts) >= 3:
        w = parts[0]
        if re.search(r'[\[/]', parts[1]) or not re.search(r'[а-яА-ЯёЁ]', parts[1]):
            return (w, clean_transcription(parts[1]), ' '.join(parts[2:]))
        else:
            return (w, '', ' '.join(parts[1:]))
    elif len(parts) == 2:
        return (parts[0], '', parts[1])

    # Pattern 4: English word followed immediately by Cyrillic translation
    # e.g.: Look смотреть
    m_lang = re.match(r'^([A-Za-z\s\'-]+?)\s+([а-яА-ЯёЁ].*)$', line)
    if m_lang:
        return (m_lang.group(1).strip(), '', m_lang.group(2).strip())

    return None

def extract_vocab_from_docx_bytes(docx_bytes):
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    words = []
    seen = set()

    def add_item(w, tr, tl):
        if not is_valid_pair(w, tl):
            return
        w = re.sub(r'^\d+[\.\)]\s*', '', w).strip()
        tr = clean_transcription(tr)
        tl = tl.strip(' -–—:')
        key = (w.lower(), tl.lower())
        if key not in seen:
            seen.add(key)
            words.append({
                'word': w,
                'transcription': tr,
                'translation': tl
            })

    try:
        with zipfile.ZipFile(io.BytesIO(docx_bytes)) as zf:
            if 'word/document.xml' not in zf.namelist():
                return []
            xml_content = zf.read('word/document.xml')
            root = ET.fromstring(xml_content)

            body = root.find('./w:body', ns)
            if body is None:
                body = root

            for child in list(body):
                tag = child.tag.split('}')[-1]

                # 1. Parse Tables
                if tag == 'tbl':
                    for tr_node in child.findall('.//w:tr', ns):
                        cells = tr_node.findall('.//w:tc', ns)
                        if not cells:
                            continue
                        cell_texts = []
                        for tc in cells:
                            t_nodes = [t.text for t in tc.findall('.//w:t', ns) if t.text]
                            cell_texts.append(''.join(t_nodes).strip())

                        # Remove empty trailing cells
                        while cell_texts and not cell_texts[-1]:
                            cell_texts.pop()
                        if not cell_texts:
                            continue

                        # Check if first cell is numbering e.g. "1", "2."
                        first_is_num = bool(re.match(r'^\d+[\.\)]?$', cell_texts[0]))
                        if first_is_num and len(cell_texts) >= 4:
                            # [#1, Word, Transcription, Translation, ...]
                            add_item(cell_texts[1], cell_texts[2], cell_texts[3])
                        elif first_is_num and len(cell_texts) == 3:
                            # [#1, Word, Translation]
                            add_item(cell_texts[1], '', cell_texts[2])
                        elif len(cell_texts) >= 3:
                            # [Word, Transcription, Translation]
                            add_item(cell_texts[0], cell_texts[1], cell_texts[2])
                        elif len(cell_texts) == 2:
                            c0, c1 = cell_texts[0], cell_texts[1]
                            parsed = parse_line_to_word(f"{c0} {c1}")
                            if parsed:
                                add_item(*parsed)
                            else:
                                add_item(c0, '', c1)

                # 2. Parse Paragraphs (outside tables)
                elif tag == 'p':
                    t_nodes = [t.text for t in child.findall('.//w:t', ns) if t.text]
                    full_line = ''.join(t_nodes).strip()
                    if full_line:
                        res = parse_line_to_word(full_line)
                        if res:
                            add_item(*res)

    except Exception as e:
        print(f"Error parsing docx bytes: {e}", flush=True)

    return words

def extract_vocab_from_text_bytes(text_bytes):
    words = []
    seen = set()
    # Try utf-8 first, fallback to cp1251
    try:
        text = text_bytes.decode('utf-8')
    except UnicodeDecodeError:
        try:
            text = text_bytes.decode('cp1251')
        except Exception:
            text = text_bytes.decode('latin-1', errors='ignore')

    for line in text.splitlines():
        res = parse_line_to_word(line)
        if res:
            w, tr, tl = res
            if is_valid_pair(w, tl):
                key = (w.lower(), tl.lower())
                if key not in seen:
                    seen.add(key)
                    words.append({
                        'word': w,
                        'transcription': clean_transcription(tr),
                        'translation': tl.strip(' -–—:')
                    })
    return words

def parse_vocab_document(file_bytes, filename=""):
    ext = os.path.splitext(filename)[1].lower() if filename else ''
    if ext in ['.txt']:
        return extract_vocab_from_text_bytes(file_bytes)
    # Default attempt docx (even without extension or .docx)
    words = extract_vocab_from_docx_bytes(file_bytes)
    if not words and ext in ['.txt', '.doc']:
        words = extract_vocab_from_text_bytes(file_bytes)
    return words
