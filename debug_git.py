import subprocess
import os

def run_git_cmd(cmd, log_file):
    with open(log_file, "a") as f:
        f.write(f"Running: {cmd}\n")
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        f.write(f"Return code: {result.returncode}\n")
        f.write(f"Stdout:\n{result.stdout}\n")
        f.write(f"Stderr:\n{result.stderr}\n")
        f.write("-" * 20 + "\n")

log_path = r"c:\Users\THE EYE INFORMATIQUE\OneDrive\Desktop\All\Zigex\zApp\git_log.txt"
if os.path.exists(log_path):
    os.remove(log_path)

os.chdir(r"c:\Users\THE EYE INFORMATIQUE\OneDrive\Desktop\All\Zigex\zApp")
run_git_cmd("git branch -a", log_path)
run_git_cmd("git status", log_path)
run_git_cmd("git log -n 1", log_path)
run_git_cmd("git remote -v", log_path)
