import json

with open('db.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for tb_name, tb_data in data.get('textbookLessons', {}).items():
    found_any = False
    for m_idx, month in tb_data.items():
        if isinstance(month, dict):
            for l_idx, lesson in month.items():
                if isinstance(lesson, dict) and lesson.get('files'):
                    print(f"Textbook: {tb_name}, Month: {m_idx}, Lesson: {l_idx}, Files: {len(lesson['files'])}")
                    for fl in lesson['files']:
                        print(f"   - {fl.get('name')} (type: {fl.get('type')}, target: {fl.get('target')})")
                    found_any = True
    if not found_any:
        print(f"Textbook: {tb_name} has NO files.")
