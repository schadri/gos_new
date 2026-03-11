@echo off
git fetch origin
git rebase origin/main
git push origin HEAD:main --force
git log -1 --oneline
echo DONE
