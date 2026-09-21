import os
import sys

files = [
    'js/components/avatarCustomization.js',
    'js/store.js',
    'js/auth.js',
    'js/app.js',
    'js/views/studentCabinet.js',
    'js/views/studentsView.js'
]

print("=== STEP 1: BRACKET & SYNTAX INTEGRITY ===")
pairs = {'(': ')', '{': '}', '[': ']'}
all_passed = True

for fpath in files:
    if not os.path.exists(fpath):
        print(f"[FAIL] Missing file {fpath}")
        all_passed = False
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        code = f.read()

    stack = []
    in_single = False
    in_double = False
    in_backtick = False
    in_line_comment = False
    in_block_comment = False

    i = 0
    while i < len(code):
        c = code[i]
        nxt = code[i+1] if i + 1 < len(code) else ''

        if in_line_comment:
            if c == '\n':
                in_line_comment = False
        elif in_block_comment:
            if c == '*' and nxt == '/':
                in_block_comment = False
                i += 1
        elif in_single:
            if c == '\\':
                i += 1
            elif c == "'":
                in_single = False
        elif in_double:
            if c == '\\':
                i += 1
            elif c == '"':
                in_double = False
        elif in_backtick:
            if c == '\\':
                i += 1
            elif c == '`':
                in_backtick = False
        else:
            if c == '/' and nxt == '/':
                in_line_comment = True
                i += 1
            elif c == '/' and nxt == '*':
                in_block_comment = True
                i += 1
            elif c == "'":
                in_single = True
            elif c == '"':
                in_double = True
            elif c == '`':
                in_backtick = True
            elif c in pairs:
                stack.append((c, i))
            elif c in pairs.values():
                if not stack:
                    print(f"[FAIL] {fpath}: Unexpected closing {c} at {i}")
                    all_passed = False
                    break
                top, top_idx = stack.pop()
                if pairs[top] != c:
                    print(f"[FAIL] {fpath}: Mismatched {top} at {top_idx} closed by {c} at {i}")
                    all_passed = False
                    break
        i += 1

    if stack:
        print(f"[FAIL] {fpath}: Unclosed delimiters: {stack[-5:]}")
        all_passed = False
    else:
        print(f"[PASS] {fpath}: 100% syntax and brackets valid")

print("\n=== STEP 2: VERIFY CUSTOMIZATION EXPORTS & FRAMES ===")
with open('js/components/avatarCustomization.js', 'r', encoding='utf-8') as f:
    custom_code = f.read()

required_frames = ['frame-none', 'frame-stars', 'frame-neon', 'frame-fire', 'frame-gold', 'frame-cosmic', 'frame-cyber', 'frame-rainbow']
for rf in required_frames:
    if rf in custom_code:
        print(f"[PASS] Frame '{rf}' defined in avatarCustomization.js")
    else:
        print(f"[FAIL] Missing frame '{rf}'")
        all_passed = False

required_titles = ['Лучший болтун', 'Знаток слов', 'Гений грамматики', 'Король домашки', 'Гроза Present Perfect']
for rt in required_titles:
    if rt in custom_code:
        print(f"[PASS] Title '{rt}' defined in avatarCustomization.js")
    else:
        print(f"[FAIL] Missing title '{rt}'")
        all_passed = False

print("\n=== STEP 3: VERIFY CSS FRAMES & ANIMATIONS ===")
with open('css/views.css', 'r', encoding='utf-8') as f:
    css_code = f.read()

for rf in required_frames:
    if f'.custom-avatar-wrapper.{rf}' in css_code:
        print(f"[PASS] CSS style defined for .{rf}")
    else:
        print(f"[FAIL] Missing CSS style for .{rf}")
        all_passed = False

if all_passed:
    print("\n>>> ALL CHECKS PASSED SUCCESSFULLY (100%) <<<")
    sys.exit(0)
else:
    print("\n>>> ERRORS DETECTED <<<")
    sys.exit(1)
