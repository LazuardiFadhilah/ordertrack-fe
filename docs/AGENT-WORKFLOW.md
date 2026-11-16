# OrderTrack Agent Workflow — Ground Rules

## Model routing

- PM (this session) uses the active model selected by the user.
- Subagents inherit the PM model by default; escalate to a stronger model only for auth/security review or after two failed retries.

## Team shape

- **PM**: human proxy, splits tasks, writes/approves contract, verifies output, merges.
- **BE agent**: backend route, service, model, tests.
- **FE agent**: UI page, dialog, API client integration.
- **QA agent**: runs automated checks + browser evidence, gives PASS/FAIL.

## Workflow — strictly sequential

One agent alive at a time. Parallel fan-out is forbidden because it burns tokens and creates merge races.

1. **PM phase**
   - Read repo state: branch, last commit, dirty files, open worktrees.
   - Read/confirm contract (`docs/API.md`, task card).
   - If the task is too large, split into smaller cards before spawning.
   - Create worktree and branch: `feat/TASK-NNN-phaseN-role`.
   - Write a one-line handoff in Discord thread.

2. **BE agent**
   - Task: implement backend slice + automated tests.
   - Acceptance: `npm run check` and `npm test` pass.
   - PM verifies diff and runs tests before declaring BE done.

3. **FE agent**
   - Task: implement UI slice + API client updates.
   - Acceptance: `npm run build` and `npm test` pass.
   - PM verifies files exist and build passes before declaring FE done.

4. **QA agent**
   - Task: run repository checks and browser end-to-end evidence.
   - Acceptance: all checks green + required screenshots/artifacts.
   - PM verifies artifacts before merge.

## Agent handoff contract

Every agent prompt must include:

- Exact repo path and worktree directory.
- Branch name.
- Endpoint/contract reference or existing pattern to copy.
- Acceptance criteria (commands to run + expected result).
- Forbidden actions (e.g., do not change other phases, do not add deps without PM approval).

## Verification before merge

- BE: `npm run check` and `npm test` pass.
- FE: `npm run build` and `npm test` pass.
- QA: evidence file list + PASS verdict.
- PM reads the diff and runs the same commands.

## Merge rules

- Merge only after QA PASS or explicit user override.
- Use `--no-ff` merge commits.
- Clean worktrees after merge.
- Never merge into a dirty `main`; stash/backup uncommitted changes first.

## Communication

- User talks only to PM.
- Agent threads are one-way logs; user may read but should not reply there.
- Status updates use the format: `role | branch | status | blocker/next step`.
