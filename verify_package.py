import zipfile
import tomllib
import re
import hashlib
import sys

ZIP_PATH = sys.argv[1] if len(sys.argv) > 1 else "afrigrid-task.zip"

print(f"--- VERIFYING {ZIP_PATH} ---")
with zipfile.ZipFile(ZIP_PATH, 'r') as zf:
    namelist = zf.namelist()
    
    # 1. Check root level files
    required_roots = ['environment/', 'instruction.md', 'launch.sh', 'solution/', 'task.toml', 'tests/']
    for req in required_roots:
        found = any(n == req or n.startswith(req) for n in namelist)
        assert found, f"Missing required root entry: {req}"
        print(f"[OK] Root entry present: {req}")

    # 2. Check no wrapper folder
    for n in namelist:
        first_segment = n.split('/')[0]
        assert first_segment in {'environment', 'instruction.md', 'launch.sh', 'solution', 'task.toml', 'tests'}, f"Invalid top-level folder/file: {first_segment} in {n}"
    print("[OK] Archive has flat root structure (no nested folder)")

    # 3. Check problem assets screenshots
    assert 'environment/problem_assets/broken.png' in namelist, "Missing broken.png"
    assert 'environment/problem_assets/target.png' in namelist, "Missing target.png"
    
    broken_bytes = zf.read('environment/problem_assets/broken.png')
    target_bytes = zf.read('environment/problem_assets/target.png')
    
    assert len(broken_bytes) > 10000, f"broken.png too small ({len(broken_bytes)} bytes)"
    assert len(target_bytes) > 10000, f"target.png too small ({len(target_bytes)} bytes)"
    
    h_broken = hashlib.sha256(broken_bytes).hexdigest()
    h_target = hashlib.sha256(target_bytes).hexdigest()
    assert h_broken != h_target, "broken.png and target.png are identical!"
    print(f"[OK] Screenshots verified: broken.png ({len(broken_bytes)} bytes), target.png ({len(target_bytes)} bytes), hashes differ")

    # 4. Check instruction.md
    instruction_text = zf.read('instruction.md').decode('utf-8')
    assert '/app/problem_assets/broken.png' in instruction_text, "instruction.md must embed broken.png"
    assert '/app/problem_assets/target.png' in instruction_text, "instruction.md must embed target.png"
    assert 'server.js' not in instruction_text, "instruction.md leaks server.js"
    assert 'app.js' not in instruction_text, "instruction.md leaks app.js"
    assert 'styles.css' not in instruction_text, "instruction.md leaks styles.css"
    assert 'BROKEN' not in instruction_text, "instruction.md leaks BROKEN label"
    print("[OK] instruction.md verified: embeds assets, no code/file leaks")

    # 5. Check task.toml
    toml_text = zf.read('task.toml').decode('utf-8')
    meta = tomllib.loads(toml_text)
    assert meta['metadata']['fail_to_pass_count'] == 6, f"F2P count mismatch: {meta['metadata']['fail_to_pass_count']}"
    assert meta['metadata']['pass_to_pass_count'] == 2, f"P2P count mismatch: {meta['metadata']['pass_to_pass_count']}"
    assert meta['metadata']['base_commit'], "Missing base_commit"
    print(f"[OK] task.toml verified: base_commit={meta['metadata']['base_commit']}, F2P={meta['metadata']['fail_to_pass_count']}, P2P={meta['metadata']['pass_to_pass_count']}")

    # 6. Check tests/behavior.spec.js test count
    spec_text = zf.read('tests/behavior.spec.js').decode('utf-8')
    f2p_tests = re.findall(r"test\('\[F2P\]\[(D\d+)\]", spec_text)
    p2p_tests = re.findall(r"test\('\[P2P\]", spec_text)
    assert len(f2p_tests) == 6, f"Expected 6 F2P tests, found {len(f2p_tests)}: {f2p_tests}"
    assert len(p2p_tests) == 2, f"Expected 2 P2P tests, found {len(p2p_tests)}: {p2p_tests}"
    print(f"[OK] behavior.spec.js verified: 6 F2P tags ({f2p_tests}), 2 P2P tags")

    # 7. Check line endings
    for n in namelist:
        if n.endswith(('.sh', '.py', '.js', '.json', '.toml', '.md', '.diff', '.css', '.html')):
            data = zf.read(n)
            assert b'\r\n' not in data, f"CRLF found in {n}"
    print("[OK] All text files use pure Unix LF line endings")

print("\n>>> ALL VALIDATION CHECKS PASSED PERFECTLY! <<<")
