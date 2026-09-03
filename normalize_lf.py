import os

ROOT = os.path.abspath("savannaroute-safari-logistics")

EXTENSIONS = ('.sh', '.py', '.js', '.json', '.toml', '.md', '.diff', '.css', '.html', '.gitignore')
EXACT_FILES = ('Dockerfile',)

converted = 0
for dirpath, dirnames, filenames in os.walk(ROOT):
    # skip node_modules and .git
    if 'node_modules' in dirpath or '.git' in dirpath:
        continue
    for f in filenames:
        if f.endswith(EXTENSIONS) or f in EXACT_FILES:
            fp = os.path.join(dirpath, f)
            with open(fp, 'rb') as fh:
                content = fh.read()
            # Replace CRLF with LF
            if b'\r\n' in content:
                new_content = content.replace(b'\r\n', b'\n')
                with open(fp, 'wb') as fh:
                    fh.write(new_content)
                converted += 1
                print(f"Normalized CRLF -> LF: {os.path.relpath(fp, ROOT)}")

print(f"Total files normalized to Unix LF: {converted}")
