import os
import zipfile
import tarfile

TASK_DIR = os.path.abspath("afrigrid-solar-logistics")
ZIP_OUT = os.path.abspath("afrigrid-task.zip")
TGZ_OUT = os.path.abspath("afrigrid-task.tar.gz")

EXCLUDE_PARTS = {"node_modules", ".DS_Store", "Thumbs.db", "test-results"}

def should_exclude(relpath):
    parts = relpath.replace("\\", "/").split("/")
    for part in parts:
        if part in EXCLUDE_PARTS:
            return True
        if part.endswith(".log"):
            return True
    return False

print(f"Building zip package from: {TASK_DIR}")
if os.path.exists(ZIP_OUT):
    os.remove(ZIP_OUT)

with zipfile.ZipFile(ZIP_OUT, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
    for root, dirs, files in os.walk(TASK_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_PARTS]
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, TASK_DIR).replace("\\", "/")
            if should_exclude(rel_path):
                continue
            
            with open(full_path, 'rb') as fh:
                data = fh.read()
            
            if rel_path.endswith(('.sh', '.py', '.js', '.json', '.toml', '.md', '.diff', '.css', '.html', '.gitignore')) or file == 'Dockerfile':
                data = data.replace(b'\r\n', b'\n')

            zinfo = zipfile.ZipInfo(rel_path)
            zinfo.compress_type = zipfile.ZIP_DEFLATED
            if rel_path.endswith('.sh') or rel_path.endswith('.py'):
                zinfo.external_attr = (0o755 << 16) | 0o100000
            else:
                zinfo.external_attr = (0o644 << 16) | 0o100000
            
            zf.writestr(zinfo, data)
            print(f"  + {rel_path} ({len(data)} bytes)")

print(f"\n[SUCCESS] Created standard zip package: {ZIP_OUT} (Size: {os.path.getsize(ZIP_OUT)} bytes)")

if os.path.exists(TGZ_OUT):
    os.remove(TGZ_OUT)

with tarfile.open(TGZ_OUT, "w:gz") as tar:
    for root, dirs, files in os.walk(TASK_DIR):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_PARTS]
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, TASK_DIR).replace("\\", "/")
            if should_exclude(rel_path):
                continue
            
            with open(full_path, 'rb') as fh:
                data = fh.read()
            if rel_path.endswith(('.sh', '.py', '.js', '.json', '.toml', '.md', '.diff', '.css', '.html', '.gitignore')) or file == 'Dockerfile':
                data = data.replace(b'\r\n', b'\n')
                
            ti = tarfile.TarInfo(name=rel_path)
            ti.size = len(data)
            ti.mtime = int(os.path.getmtime(full_path))
            if rel_path.endswith('.sh') or rel_path.endswith('.py'):
                ti.mode = 0o755
            else:
                ti.mode = 0o644
            
            import io
            tar.addfile(ti, io.BytesIO(data))

print(f"[SUCCESS] Created standard tar.gz package: {TGZ_OUT} (Size: {os.path.getsize(TGZ_OUT)} bytes)")
