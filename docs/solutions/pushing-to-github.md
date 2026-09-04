# Pushing to GitHub from a Claude session

**Why it's awkward:** the cloud container's egress proxy only injects GitHub
credentials for repositories attached to the session, and it blocks pushes to
any other repo even when a token is supplied. Roger's Mac keychain also holds a
different GitHub account (Roger1of1), so a plain `git push` there uses the wrong
identity.

**What works (Roger, 2026-09-04): push from Roger's Mac with the token in the URL.**

1. Agent commits locally and produces an incremental bundle:
   `git bundle create thinkbook.bundle origin/main..main` → send the file.
   (First time: a zip of the whole repo, since there was no clone yet.)
2. Roger, in Terminal, from `~/Downloads/ThinkBook` (his clone):
   ```
   git pull ~/Downloads/thinkbook.bundle main
   git push https://roger101of1:<TOKEN>@github.com/roger101of1/ThinkBook.git main
   ```
   The token goes in the URL on purpose so the keychain account is bypassed.
   Roger may use different accounts for different repos; the URL form makes
   the account explicit every time.
3. Fine-grained token: repo = ThinkBook only, Contents: Read and write
   (+ Workflows: Read and write when `.github/workflows` changes). Delete it
   after use if it was pasted into chat.

**Long-term:** connect GitHub at claude.ai/code and start sessions with the
ThinkBook repo selected; the proxy then injects credentials and none of the
above is needed.
