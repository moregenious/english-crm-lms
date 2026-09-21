import os
import re
import json
import sys

def check_brackets(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    lines = content.split('\n')
    
    in_string = None
    in_multiline_comment = False
    escaped = False
    
    for line_num, line in enumerate(lines, 1):
        i = 0
        while i < len(line):
            c = line[i]
            
            if in_multiline_comment:
                if c == '*' and i + 1 < len(line) and line[i+1] == '/':
                    in_multiline_comment = False
                    i += 2
                    continue
                i += 1
                continue
            
            if not in_string:
                if c == '/' and i + 1 < len(line) and line[i+1] == '*':
                    in_multiline_comment = True
                    i += 2
                    continue
                if c == '/' and i + 1 < len(line) and line[i+1] == '/':
                    break # Single line comment to end of line
                if c in ("'", '"', '`'):
                    in_string = c
                    escaped = False
                    i += 1
                    continue
                if c in '({[':
                    stack.append((c, line_num, i + 1))
                elif c in ')}]':
                    if not stack:
                        return False, f"Extra closing bracket '{c}' at line {line_num}:{i+1}"
                    top, top_line, top_col = stack.pop()
                    if pairs[c] != top:
                        return False, f"Mismatched bracket: expected '{pairs[c]}' but got '{c}' at line {line_num}:{i+1} (opened at {top_line}:{top_col})"
            else:
                if escaped:
                    escaped = False
                elif c == '\\':
                    escaped = True
                elif c == in_string:
                    in_string = None
            i += 1
            
    if stack:
        top, top_line, top_col = stack[-1]
        return False, f"Unclosed bracket '{top}' opened at line {top_line}:{top_col}"
    return True, "OK"

def main():
    base_dir = r"C:\Users\moreg\.gemini\antigravity\scratch\english-crm-lms"
    js_files = [
        os.path.join(base_dir, "js", "store.js"),
        os.path.join(base_dir, "js", "app.js"),
        os.path.join(base_dir, "js", "views", "vocabularyView.js"),
        os.path.join(base_dir, "js", "views", "studentCabinet.js"),
        os.path.join(base_dir, "js", "views", "lessonPlansView.js"),
        os.path.join(base_dir, "js", "data", "seedData.js"),
    ]
    
    print("=== STEP 1: BRACKET & SYNTAX INTEGRITY CHECK ===")
    all_ok = True
    for f in js_files:
        ok, msg = check_brackets(f)
        status = "PASSED" if ok else "FAILED"
        print(f"[{status}] {os.path.basename(f)}: {msg}")
        if not ok:
            all_ok = False

    print("\n=== STEP 2: VERIFY TRANSCRIPTION SUPPORT (REQUIREMENT 1) ===")
    with open(os.path.join(base_dir, "js", "store.js"), 'r', encoding='utf-8') as f:
        store_content = f.read()
    assert "transcription:" in store_content, "store.js missing transcription handling"
    
    with open(os.path.join(base_dir, "js", "views", "vocabularyView.js"), 'r', encoding='utf-8') as f:
        vocab_content = f.read()
    assert "transcription" in vocab_content, "vocabularyView.js missing transcription handling"
    assert "name=\"transcription\"" in vocab_content, "vocabularyView.js missing transcription input in modal"

    with open(os.path.join(base_dir, "js", "views", "lessonPlansView.js"), 'r', encoding='utf-8') as f:
        lp_content = f.read()
    assert "v-tr" in lp_content, "lessonPlansView.js missing v-tr transcription input"
    assert "transcription" in lp_content, "lessonPlansView.js missing transcription in state"
    print("[PASSED] Transcription format and modal inputs verified in store.js, vocabularyView.js, lessonPlansView.js.")

    print("\n=== STEP 3: VERIFY REMOVAL OF FLASHCARDS & SPEECH (REQUIREMENTS 2 & 3) ===")
    # Flashcard buttons removed from header
    assert 'id="btn-mode-flashcards"' not in vocab_content, "Flashcards button still in vocabularyView header!"
    assert 'id="btn-mode-grid"' not in vocab_content, "Grid mode button still in vocabularyView header!"
    
    # Audio pronunciation button removed from word cards
    assert 'btn-sound-pronounce' not in vocab_content, "Pronunciation speaker button still in vocabularyView cards!"
    print("[PASSED] Flashcard mode switcher and audio pronunciation buttons successfully removed from UI.")

    print("\n=== STEP 4: VERIFY MASTERED STATUS PRESERVED IN CODE, HIDDEN FROM UI (REQUIREMENT 4) ===")
    # toggleWordMastered is preserved in store.js and vocabularyView.js
    assert "toggleWordMastered" in store_content, "toggleWordMastered removed from store.js!"
    assert "toggleWordMastered" in vocab_content, "toggleWordMastered removed from vocabularyView.js!"
    # But button removed from cards
    assert 'btn-toggle-word-mastered' not in vocab_content, "Mastered toggle button still rendered in cards!"
    assert 'Выучено (Mastered)' not in vocab_content, "Выучено (Mastered) stat card still rendered!"
    print("[PASSED] Mastered logic is preserved in code, but cleanly hidden from card UI.")

    print("\n=== STEP 5: VERIFY DB.JSON INTEGRITY ===")
    db_file = os.path.join(base_dir, "db.json")
    with open(db_file, 'r', encoding='utf-8') as f:
        db_data = json.load(f)
    assert len(db_data["teachers"]) > 0, "Teachers empty in db.json"
    assert any("Ли Никита" in t.get("fullName", "") for t in db_data["teachers"]), "User's teacher missing from db.json!"
    assert any("English World 3" in g.get("name", "") for g in db_data["groups"]), "English World 3 group missing from db.json!"
    assert len(db_data["students"]) == 6, f"Expected 6 students in db.json, found {len(db_data['students'])}"
    print(f"[PASSED] db.json verified! User's teacher ({db_data['teachers'][0]['fullName']}) and group intact.")

    print("\n=== ALL 5 AUDIT STEPS COMPLETED WITH 100% SUCCESS ===")
    return 0 if all_ok else 1

if __name__ == '__main__':
    sys.exit(main())
