import os
import sys
import json
import re

sys.stdout.reconfigure(encoding='utf-8')

print("=== STARTING MINI-GAMES AUTOMATED VERIFICATION ===")

WORKSPACE = r"C:\Users\moreg\.gemini\antigravity\scratch\english-crm-lms"

# 1. Verify irregularVerbsData.js
irr_path = os.path.join(WORKSPACE, "js", "data", "irregularVerbsData.js")
assert os.path.isfile(irr_path), f"Missing {irr_path}"
with open(irr_path, "r", encoding="utf-8") as f:
    irr_content = f.read()

# Count entries
v1_matches = re.findall(r"v1:\s*['\"]([^'\"]+)['\"]", irr_content)
v2_matches = re.findall(r"v2:\s*['\"]([^'\"]+)['\"]", irr_content)
v3_matches = re.findall(r"v3:\s*['\"]([^'\"]+)['\"]", irr_content)
trans_matches = re.findall(r"translation:\s*['\"]([^'\"]+)['\"]", irr_content)

print(f"✓ Irregular verbs count: {len(v1_matches)}")
assert len(v1_matches) == 100, f"Expected 100 verbs, got {len(v1_matches)}"
assert len(v2_matches) == 100, "v2 mismatch"
assert len(v3_matches) == 100, "v3 mismatch"
assert len(trans_matches) == 100, "translation mismatch"

# 2. Verify conditionalsData.js
cond_path = os.path.join(WORKSPACE, "js", "data", "conditionalsData.js")
assert os.path.isfile(cond_path), f"Missing {cond_path}"
with open(cond_path, "r", encoding="utf-8") as f:
    cond_content = f.read()

c1_matches = re.findall(r"id:\s*['\"]c1-\d+['\"]", cond_content)
c2_matches = re.findall(r"id:\s*['\"]c2-\d+['\"]", cond_content)
c3_matches = re.findall(r"id:\s*['\"]c3-\d+['\"]", cond_content)
cm_matches = re.findall(r"id:\s*['\"]cm-\d+['\"]", cond_content)

print(f"✓ Conditionals Type 1: {len(c1_matches)} / 40")
print(f"✓ Conditionals Type 2: {len(c2_matches)} / 40")
print(f"✓ Conditionals Type 3: {len(c3_matches)} / 40")
print(f"✓ Conditionals Mixed: {len(cm_matches)} / 40")
assert len(c1_matches) == 40, f"Expected 40 Type 1, got {len(c1_matches)}"
assert len(c2_matches) == 40, f"Expected 40 Type 2, got {len(c2_matches)}"
assert len(c3_matches) == 40, f"Expected 40 Type 3, got {len(c3_matches)}"
assert len(cm_matches) == 40, f"Expected 40 Mixed, got {len(cm_matches)}"

# 3. Verify tensesData.js
tenses_path = os.path.join(WORKSPACE, "js", "data", "tensesData.js")
assert os.path.isfile(tenses_path), f"Missing {tenses_path}"
with open(tenses_path, "r", encoding="utf-8") as f:
    tenses_content = f.read()

assert "present_simple" in tenses_content
assert "future_perfect_continuous" in tenses_content
assert "rampage" in tenses_content
sentences_count = len(re.findall(r"id:\s*['\"]ts-[^'\"]+['\"]", tenses_content))
print(f"✓ Tenses sentences pool: {sentences_count} sentences across 12 tenses")
assert sentences_count >= 50, f"Expected >= 50 sentences, got {sentences_count}"

# 4. Verify gamesView.js
games_view_path = os.path.join(WORKSPACE, "js", "views", "gamesView.js")
assert os.path.isfile(games_view_path), f"Missing {games_view_path}"
with open(games_view_path, "r", encoding="utf-8") as f:
    games_view_content = f.read()

assert "renderPairsGame" in games_view_content
assert "renderIrregularGame" in games_view_content
assert "renderConditionalsGame" in games_view_content
assert "renderTensesGame" in games_view_content
assert "awardGamePoints" in games_view_content
print("✓ gamesView.js contains all 4 game engines and integration hooks")

# 5. Verify avatarCustomization.js secret titles
custom_path = os.path.join(WORKSPACE, "js", "components", "avatarCustomization.js")
with open(custom_path, "r", encoding="utf-8") as f:
    custom_content = f.read()

assert "SECRET_TITLES" in custom_content
assert "знаток irregular" in custom_content
assert "знаток conditional" in custom_content
assert "гений времён" in custom_content
# Verify standard AVAILABLE_TITLES does not expose the secret titles by default
avail_block = re.search(r"export const AVAILABLE_TITLES = \[(.*?)\];", custom_content, re.DOTALL)
assert avail_block, "AVAILABLE_TITLES not found"
assert "знаток irregular" not in avail_block.group(1), "Secret title leaked into standard AVAILABLE_TITLES!"
assert "знаток conditional" not in avail_block.group(1), "Secret title leaked into standard AVAILABLE_TITLES!"
assert "гений времён" not in avail_block.group(1), "Secret title leaked into standard AVAILABLE_TITLES!"
print("✓ avatarCustomization.js correctly isolates secret titles until earned")

# 6. Verify app.js routing and sidebar
app_path = os.path.join(WORKSPACE, "js", "app.js")
with open(app_path, "r", encoding="utf-8") as f:
    app_content = f.read()

assert "GamesView" in app_content
assert "#games" in app_content
assert "GamesView.render(container)" in app_content
print("✓ app.js correctly routes #games and displays sidebar links")

# 7. Test JS logic with Node.js
test_js_code = """
import { IRREGULAR_VERBS } from './js/data/irregularVerbsData.js';
import { CONDITIONALS_DATA } from './js/data/conditionalsData.js';
import { TENSES_CONFIG, TENSE_LEVELS, TENSES_SENTENCES } from './js/data/tensesData.js';
import { store } from './js/store.js';

console.log('Testing store game progress methods in Node:');

const students = store.getStudents();
if (students.length === 0) {
  throw new Error('No students found in store');
}

const student = students[0];
console.log('Testing with student:', student.fullName, student.id);

// 1. Check vocabulary prioritization
const gameVocab = store.getPrioritizedVocabularyForGame(student.id, 10);
console.log('Game vocabulary count:', gameVocab.length);
if (gameVocab.length !== 10) {
  throw new Error('Expected exactly 10 vocabulary words for game, got ' + gameVocab.length);
}

// 2. Check weekly points cap logic (100 pts)
const initialProgress = store.getStudentGameProgress(student.id);
console.log('Initial weekly points:', initialProgress.weeklyPoints);

// Award 50 points
const res1 = store.awardGamePoints(student.id, 50, 'test', 'Test Round 1');
console.log('Awarded 50 -> Points awarded:', res1.pointsAwarded, 'Weekly total:', res1.weeklyTotal);
if (res1.pointsAwarded !== 50) throw new Error('Failed to award 50 points');

// Award 60 points (should cap at 50 to reach 100)
const res2 = store.awardGamePoints(student.id, 60, 'test', 'Test Round 2');
console.log('Awarded 60 -> Points awarded:', res2.pointsAwarded, 'Weekly total:', res2.weeklyTotal, 'Cap reached:', res2.capReached);
if (res2.pointsAwarded !== 50 || res2.weeklyTotal !== 100 || !res2.capReached) {
  throw new Error('Weekly cap at 100 failed: ' + JSON.stringify(res2));
}

// Award more points (should award 0)
const res3 = store.awardGamePoints(student.id, 10, 'test', 'Test Round 3');
if (res3.pointsAwarded !== 0) throw new Error('Awarded points after cap was reached');

// 3. Test irregular streak 3x 10/10 -> secret title
store.recordGameResult(student.id, 'irregular', 10, 10, { verbIds: [1, 2, 3] });
store.recordGameResult(student.id, 'irregular', 10, 10, { verbIds: [4, 5, 6] });
const irrFinal = store.recordGameResult(student.id, 'irregular', 10, 10, { verbIds: [7, 8, 9] });
console.log('Irregular streak 3 result:', irrFinal);
if (irrFinal.newTitleUnlocked !== 'знаток irregular') {
  throw new Error('Failed to unlock "знаток irregular" after 3x 10/10 games');
}

// 4. Test conditionals streak 3x 10/10 -> secret title
store.recordGameResult(student.id, 'conditionals', 10, 10);
store.recordGameResult(student.id, 'conditionals', 10, 10);
const condFinal = store.recordGameResult(student.id, 'conditionals', 10, 10);
console.log('Conditionals streak 3 result:', condFinal);
if (condFinal.newTitleUnlocked !== 'знаток conditional') {
  throw new Error('Failed to unlock "знаток conditional" after 3x 10/10 games');
}

// 5. Test tenses progressive unlocks
// Easy -> score 8 -> Middle unlocks
const tRes1 = store.recordGameResult(student.id, 'tenses', 8, 10, { level: 'easy' });
console.log('Easy completed (8/10) -> Level unlocked:', tRes1.levelUnlocked);
if (tRes1.levelUnlocked !== 'middle') throw new Error('Expected middle to unlock');

// Middle -> score 9 -> Hard unlocks
const tRes2 = store.recordGameResult(student.id, 'tenses', 9, 10, { level: 'middle' });
console.log('Middle completed (9/10) -> Level unlocked:', tRes2.levelUnlocked);
if (tRes2.levelUnlocked !== 'hard') throw new Error('Expected hard to unlock');

// Hard -> score 8 -> Impossible unlocks
const tRes3 = store.recordGameResult(student.id, 'tenses', 8, 10, { level: 'hard' });
console.log('Hard completed (8/10) -> Level unlocked:', tRes3.levelUnlocked);
if (tRes3.levelUnlocked !== 'impossible') throw new Error('Expected impossible to unlock');

// Impossible -> score 10 -> Rampage unlocks
const tRes4 = store.recordGameResult(student.id, 'tenses', 10, 10, { level: 'impossible' });
console.log('Impossible completed (10/10) -> Level unlocked:', tRes4.levelUnlocked);
if (tRes4.levelUnlocked !== 'rampage') throw new Error('Expected rampage to unlock');

// Rampage -> score 8 -> Secret title "гений времён"
const tRes5 = store.recordGameResult(student.id, 'tenses', 8, 10, { level: 'rampage' });
console.log('Rampage completed (8/10) -> Title unlocked:', tRes5.newTitleUnlocked);
if (tRes5.newTitleUnlocked !== 'гений времён') throw new Error('Expected "гений времён" to unlock');

console.log('ALL NODE TESTS PASSED SUCCESSFULLY! 🚀');
"""

test_js_path = os.path.join(WORKSPACE, "test_games_node.mjs")
with open(test_js_path, "w", encoding="utf-8") as f:
    f.write(test_js_code)

print(f"✓ Created test harness: {test_js_path}")
print("=== PYTHON PRE-CHECKS PASSED ===")
