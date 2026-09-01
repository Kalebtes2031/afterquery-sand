How Project Sand works
Start Here
Read this page before you claim or import anything. It takes two minutes and will save you several dropped tasks.
Pay and limits
$50 per approved task
Budget 1 hour or more per task. This is not a task you can rush.
Bootcamp status: you must produce at least one task that passes QA. Until then you're capped at 2 tasks.
What you're making
You are making a task built on a code repo, with at least one visual that shows the broken version.
What a task is made of
Piece
What it is
Base repo
The broken version of the application
Fixed repo
The corrected version
instructions.md
The problem description
Broken screenshot
Required. Visual evidence of what's wrong
Target screenshot
Optional. Include it only if it adds something the broken image and the text don't
Tests
fail_to_pass (must fail before the fix, pass after) and pass_to_pass (must pass both before and after)
Solution patch
The reference fix that makes the failing tests pass

The three things that get a task approved
Difficulty. A strong agent that can read the entire codebase instantly should still struggle with it.
Correctness. The patch genuinely fixes the stated problem, and the tests genuinely verify it.
Fairness. A valid solution is never docked, and an invalid one never passes.
Everything in Sections 2 and 3 is an expansion of these three.
Two ways to create a task
Claim from the queue. Queue tasks are templates, not finished work. They are not checked for difficulty and not checked against existing submissions for duplication. Your job is to break them further and rebuild the problem, not to polish what's there. A lightly-edited template will be rejected as too easy or too similar.
Task Import (recommended). You build the task yourself and upload it. Requirements:
The task is zipped.
The application launches and has visuals. At least one screenshot must be attached.
You have run nop = 0 and oracle = 1 locally before uploading. Section 2, Step 7 explains how.
You have used the provided task template. Download it and build your task inside it. Structuring the task yourself is the most common cause of import failures.
Import is recommended because you control the problem from the start, which makes it far easier to hit the difficulty and originality bars.
Rules that apply to everything you submit
Write your instructions yourself. instructions.md must be written by you, in your own words. AI-generated instructions are a rejection reason. They read as generic, they leak solutions, and they consistently describe behavior the application doesn't actually have.
Verify everything manually. Launch the base repo and confirm it is broken in the way you described. Launch the fixed repo and confirm it's fixed. Interact with the application. Automated checks tell you a task is valid; only using the app tells you it's correct.
Delete any UNVERIFIED.md or warning.md files you find in a claimed task.

Next: Section 2. How to Build a Task.
Claim a task
Open the task queue and claim an available task. You hold one task at a time — finish or release it before taking another.
A new claim runs for 60 min. The timer in your workspace is authoritative because an active claim keeps the policy it started under. Release or expiry closes its working snapshot; the audit trail remains, but a later claimant starts from the accepted base rather than your unfinished edits.
Before the queue unlocks you must pass the comprehension quiz. It checks that you understand what the platform expects — the same things this page describes.
Read the package
Four things decide whether a task is any good. The submit checklist unlocks each item only once you have actually opened the file it refers to — you cannot confirm what you haven’t looked at.
instruction.mdthe agent’s written prompt
The sole written prompt shown to the solving agent. The agent can still inspect the environment source; tests and solution assets stay protected. Describe the broken behavior precisely without giving away the cause — no file names, function names, or fix hints.
environment/the app + screenshots
The application, its Dockerfile, and the runtime files. The screenshots in environment/problem_assets/ carry the visual proof of the bug — the screenshot standard below spells out exactly what each one must show.
tests/the verifier
Fail-to-pass tests must fail on the broken app and pass after the correct fix; pass-to-pass tests must pass both before and after. Together they are the definition of 'solved' — check that the failing ones fail for the planted bug and not for some incidental reason.
solution/the reference patch
The change that makes the failing tests pass. If you alter the bug or the tests, this must still be the thing that fixes them.
Hard gate — test counts. A package must ship at least 6 fail-to-pass tests (titles tagged [F2P]) and 2 pass-to-pass tests ([P2P]) — 8 minimum in total, with no maximum. Submitting is blocked until the package meets the floor.
What counts: a test('…') in tests/*.spec.js whose title carries the tag. Untagged tests count toward neither number, and duplicate titles are rejected outright. A real fail-to-pass test fails because of the planted bug and passes after the reference patch; a pass-to-pass test passes on both sides. Padding — near-duplicate assertions, tests that assert constants, guards that pass when their subject is missing — satisfies the count but not the review.
Screenshot standard. broken.png must visibly show the claimed problem — the app in the exact state the agent will find it, with the defect observable in the pixels, not implied by them. If the package ships target.png (optional), it must visibly show the corresponding fix and be measurably different from the broken shot — identical or near-identical pairs are rejected by automated QA. broken.png must be embedded in instruction.md, and so must target.png when the package ships one.
A screenshot earns its place by adding information the written task does not already carry — where in the UI the defect lives, what the wrong state actually looks like. One that merely restates the prose is one of the most common reasons an otherwise-good task is returned.
Your submit checklist
1
Confirm the task instruction (instruction.md) is clear, correct, and leak-free
2
Confirm the provided problem images match the described behavior
3
Confirm the fixed repository resolves the described issue
4
Confirm the verifier tests / harness check the described behavior
Harden the task
How to Build a Task
This is the full workflow. Each step includes the standard you're being held to and why it exists.
The workspace
Folder tab. The task contents:
base repo: the broken version. You can edit it if it doesn't reflect the issues in your instructions.
fixed repo: the corrected version. You will edit this.
instructions.md: the problem description the agent receives.
broken.png / target.png: the screenshots. broken.png is required. target.png is optional, and you can remove it if it isn't adding anything. Retake any that don't show the actual state.
reference/tests/NAME_OF_TEST.spec.js: your tests. Edit these or any file in the tests folder.
Tools tab:
Launch base repo / Launch fixed repo: run the application and interact with it.
Local editing: download the task as a .tar, edit it locally, then upload it back. You confirm the changes before they apply.

Step 1. Claim and read the task as it stands
Preview tasks in the queue and claim one. You have 1 hour once claimed.
Open the screenshots and instructions.md, then launch the base repo and interact with it. You're building a picture of what the task currently claims to be about and how far short of the difficulty bar it falls.
Step 2. Break the task on purpose
This is the most important step, and it is where most rejections are avoided.
Queue tasks are templates. They are not measured for difficulty or for duplication, and as shipped they are almost always too easy. Your job is not to tidy the existing bug. Your job is to introduce a harder problem.
That means working on both repos at once:
In the base repo, add the bugs. Break things deliberately, in places that make the problem harder to trace. Put the symptom in one place and the cause in another. Spread defects across the back end and the front end. Break a layout in a way that's objectively bad rather than cosmetically different.
In the fixed repo, write the corresponding fixes. Every bug you introduce needs a real fix, and that fix becomes part of your solution patch.
Read Section 3 before you do this. It covers what actually makes a task hard for an agent and what gets flagged as fake difficulty.
Everything downstream follows from what you break here: your instructions describe these symptoms, your screenshots show them, and your tests verify their fixes.
Step 3. Confirm the base repo is broken the way you say it is
Launch it again after your changes. You are checking three things:
The base repo is genuinely broken, in every way you intend.
instructions.md describes those breaks accurately.
The screenshots show the exact issues described.
If any of the three is off, fix it. Retake screenshots that don't depict the real state, and add more broken screenshots if there are visual bugs the existing ones don't capture.
This is also where you decide how to make the UI better for this specific application, not just different. Carry that decision through instructions.md, the solution patch, and the tests together.
Step 4. Rewrite instructions.md in your own words
You must rewrite the instructions. Templates ship with generic, often AI-written text; unrewritten instructions are flagged and the task is returned.
Write them yourself. Do not generate them.
What good instructions look like
Describe symptoms, not causes. Write what a user sees going wrong and let the agent work out why. "The total doesn't update when an item is removed", not "the reducer in cartSlice.js is missing a case."
Be concrete about what correct looks like. "The function should handle edge cases" is untestable. "Calling processOrder({ items: [] }) should throw an EmptyCartError" is testable.
Don't leak the solution. No file names, no function signatures, no variable names, no pseudocode, no algorithm names, no BROKEN labels in the code. An agent told where to look isn't being tested on finding it.
Keep it short and clean. Short paragraphs, line breaks, headers if the task is long. No walls of text, no dumped config files or stack traces unless genuinely necessary.
Cover UI and layout. Some part of the instruction must concern the UI or layout in a way that makes the application better for its domain. Describe what's visually wrong at a high level, briefly.
Example
When I play this game, after 3 points scored, the fourth and fifth points aren't added to the score. The bonus point isn't added when I press the space bar and the up key together, even though the game instructions say it should. The game screen is also cut off, the buttons overlap, and the words trail off the edge of the screen.
Short, specific, symptom-only, and it covers both behavior and layout.
Step 5. Make the fix, and make it a real fix
Launch the fixed repo and confirm through actual interaction that every issue is resolved.
UI fixes must be substantial. Moving a button two pixels left is not a task. You are changing objectively bad UI (overlapping elements, cut-off text, unreadable contrast, cramped spacing) into objectively good UI. Ask yourself whether the target version is the most professional version of this application you could ship.
The patch must be honest. It must address every part of the problem stated in the instructions, and it must be the thing that makes your failing tests pass. It must never hardcode around the tests or bypass the verifier. If you widen the bug, widen the patch.
Step 6. Write and check the tests
Test behavior, not implementation. Run the code and assert on observable outputs. Never grep the source for variable names, scan for imports, regex-match function signatures, or assert on private helper names or call order. If a correct but differently-structured solution would fail your test, the test is brittle, not hard, and the pipeline will flag it.
Tests must actually execute the code. Every fail_to_pass test must genuinely call the code path the task is about. Checking that a file exists or that a string appears in the source verifies nothing.
Cover the whole problem. Your tests should span everything stated in the instructions, not just the happy path. If the verifier accepts any change that makes one assertion pass, an agent can guess its way through.
Test for good UI, objectively. Set defensible bounds and assert on them. For example: if boxes on the page should be reasonably spaced, test that they're at least 4px and no more than 10px apart. The bar is that a valid solution isn't docked and an invalid one doesn't pass.
Get the names right. The names in fail_to_pass and pass_to_pass must exactly match your test runner's output. Run the tests locally and copy the names from the output. Mismatched names are one of the most common validation failures.
Keep tests isolated. No dependence on execution order, network access, or mutable shared state. The container is fresh each run, but tests within a run share a process.
Check your counts. The parser must expect exactly the same fail_to_pass / pass_to_pass counts as the actual suite.
Step 7. Run nop and oracle locally
Run these locally before touching Verification Check. It's faster and it doesn't burn an attempt.
Null check:
harbor run -p ./my-task -a nop

The nop agent does nothing. It just runs tests/test.sh with no solution applied. Every test in fail_to_pass must FAIL. /logs/verifier/reward.txt should contain 0.
If it's 1: the bug is already fixed at your base_commit, or your tests aren't actually exercising the bug.
Oracle check:
harbor run -p ./my-task -a oracle

The oracle agent applies solution/solve.sh, then runs the tests. Every test in fail_to_pass ∪ pass_to_pass must PASS. reward.txt should contain 1.
If oracle fails, it's one of three things: git apply errored (check the patch's context lines against base_commit), the patch applied but tests still fail (the fix is incomplete), or the test names in config.json don't match what parser.py emits.
Inspect logs:
harbor view ./jobs

Opens an interactive viewer with stdout, stderr, parser output, and the reward file for each run. Use this when oracle fails to see exactly what the parser saw.
Step 8. Run the Verification Check on the platform
Only once nop and oracle are clean locally.
Step 9. Iterate, then check difficulty
Iterate on tests, repos, and instructions.md until everything is consistent. Then read Section 3 and harden the task before you submit. Difficulty is re-checked at submission, and a task judged too easy comes back to you and costs a full submission cycle.

Before you submit
Everything on this list, verified manually:
 instructions.md is written by you, describes symptoms only, leaks nothing, and covers UI/layout
 Base repo launches and is broken exactly as described
 Fixed repo launches and every issue is resolved, confirmed by interacting with the app
 Screenshots show the actual states, with extra broken images added for any bug the existing ones miss
 If you included a target screenshot, it uses the same scenario, viewport, and state as the broken one so a reviewer can compare them directly
 Tests cover the full problem, assert on behavior, and use exact runner names
 Parser expects the same F2P/P2P counts as the real suite
 nop = 0 and oracle = 1, run locally
 No UNVERIFIED.md or warning.md files
 For imports: built from the provided task template, zipped, HEAD == base_commit, Unix file modes, screenshots only under environment/problem_assets/, no extra root-level junk
Submit only when the instructions are fair, the solution is correct and complete, and the tests enforce the full contract. Your task then goes through LLM QA, a difficulty check, and a final review.

Next: Section 3. Getting Approved.
Good signal
Observable behavior, a defect that requires understanding interacting behavior, and tests that fail for the planted bug and nothing else. The correct patch may still be small.
Brittle signal
Assertions on private helper names or exact source text, a single happy-path case, or an instruction that names the file to change.
Submit and QA
Submitting runs automated QA against your edited package, then sends it to a reviewer. QA re-checks that the app builds, that the tests behave as they must before and after the reference patch, and that the task is hard enough to be worth including.
If automated QA returns it, the reason is specific. Fix that issue and resubmit. The full difficulty result runs after submission and is shown to the reviewer. A reviewer flag escalates to an admin rather than reopening your claim.
The pre-review easiness check can return a task to you up to 3 times with a fresh window each time. If it’s still too easy after that, it goes back to the queue for someone else — and you won’t be able to reclaim that one. The full difficulty finding is measured before review and gives the reviewer more context for their decision rather than granting another fix retry.
If it comes back
After you submit, the progress strip on your Overview (and on the Import page) tracks each automated check. Two pause states look similar but mean different things — neither needs action from you: an amber pause means the platform hit a transient problem and is retrying that check automatically, while a grey pause — wherever it sits, on a check step or on the review step (which then reads Additional review) — means an operator has the task: a person, not a retry. When a check genuinely fails, the task comes back to you: it lands in Needs your fix (its own tab in your nav) with the specific reason attached. What you do next depends on how the task started:
Resume fixtasks claimed from the queue
Reopens the returned task in your workspace with your previous changes still there. A resume is a fresh claim window under the currently active policy.
Download package → Upload fixed versiontasks you imported
Imported tasks are repaired offline: download the returned package, fix it locally, and upload the corrected archive (.zip, .tar.gz, or .tgz). Automated checks restart on the same task, and an upload that fails to process can simply be uploaded again.
Release taskany returned task
Ends your fix line. A queue-claimed task goes back for someone else; releasing an imported task permanently closes it (the package is your own upload — there is no one else to hand it to). Either way, released work no longer counts against you — a deliberate release beats leaving a return parked.
Flag as unfixableany returned task
For a task that is itself too low-quality to be worth fixing. It is retired for everyone and your reason is reviewed — repeated unjustified flags are audited.
Automated quality returns are budgeted per task: 3 counted fix attempts. An attempt is spent only when a check you were already told about fails again — the first report of each new issue is free, and the counter under each returned task shows exactly where you stand. Using the last attempt does not end the line by itself — the next repeat failure after it does: a queue-claimed task is then requeued for another expert and you won’t be able to reclaim it; an imported task goes to admin review instead (your own upload cannot be requeued to someone else). The too-easy loop is budgeted separately (3 hardening attempts — see above).
A return from a human reviewer is different: it arrives with structured feedback — what is wrong, how to fix it, and how much rework they judge it needs — and does not spend your automated fix budget.
What makes a successful task
Getting Approved
Section 2 gets you a valid task. This section gets you an approved one.

Common rejection reasons
Start here. These are the failures we actually see.
The image adds nothing. Screenshots must carry information that can't be derived from the text alone, such as how the UI is laid out, how the game or site behaves. If your instructions fully describe what the image shows, the image isn't doing any work.
Not enough broken images. If the instructions describe several problems and one screenshot covers one of them, add more. Every visual problem you describe needs visual evidence.
The UI problems aren't real problems. "Make these buttons two pixels larger" is not a defect. UI changes must be grounded in objectively good design: overlapping elements, cut-off text, unreadable contrast, missing icons that make the product look unfinished.
Unfair instructions. Either too vague to be solvable, or leaking the specific steps and making it trivial. Both fail.
AI-written instructions. Generic phrasing, described behavior the app doesn't have, or a solution leaked into the prose.
Too similar to an existing task. Covered below. Rewording won't fix it.
Your goal on every submission: the target version should be the most professional version of that application you could ship.

How to harden a task
The difficulty probe runs your task against a state-of-the-art agent 10 times. Tasks that feel moderately difficult to a human are often trivially solvable by an agent that can search and read an entire codebase instantly. Hardening is the part of this job that takes judgement. The platform can tell you that a task is too easy, but not what would make it interesting.
First, diagnose why it's too easy
The instruction gives it away. It names the file, the function, or the fix.
The bug is shallow. The cause is obvious from the prompt or from local context, so the agent never has to investigate the system.
The tests only check the happy path. If one passing assertion satisfies the verifier, an agent can guess its way through.
What actually creates difficulty
Agents are excellent at searching code, reading documentation, following clear instructions, and making straightforward fixes. Your task has to require something else.
Non-obvious root causes. The symptom appears in one place, the fix belongs in another. The agent has to trace across files or understand a subtle interaction to find the real issue. Fail site ≠ fix site.
Cross-cutting changes. Defects that span back end and front end, or a type change that ripples through several call sites, or a config change touching multiple subsystems. Make them orthogonal: the wrong helper on one route, plus a draft-vs-published lifecycle bug, rather than the same wrong constant copied into four files, and not everything buried in one engine file.
Edge cases and subtle invariants. Off-by-one errors, race conditions, encoding issues, boundary conditions in business logic. These need careful reasoning, not pattern matching.
Non-trivial feature additions. Small features that require understanding the existing architecture to integrate correctly, so the agent has to find the right place to add code rather than writing it in isolation.
Front-end depth. Layout, spacing, and professional presentation issues are genuinely difficult for agents. Test for objectively good UI given the task's domain.
Hardening a queue template
Templates arrive too easy. The fix is not to reword them, it is to break them further.
Go into the base repo and add bugs, then write the matching fixes in the fixed repo. Use the categories above to choose what to introduce: put the cause somewhere other than the symptom, spread defects across back end and front end, add a layout failure that's objectively bad rather than cosmetic. Every bug you add needs a real fix in the fixed repo, and that fix becomes part of your solution patch.
Then update instructions.md, the screenshots, and the tests to match what you actually broke. If those four pieces don't describe the same problem, the task fails review regardless of how hard it is.
Principles while hardening
Describe the symptom, not the cause. Screenshots do this well. State the posted rules in plain English; never name files, bugs, or BROKEN labels.
Make behaviors coupled. The strongest tasks require understanding how several behaviors interact, even when the correct fix ultimately changes one place. A small patch can still be a hard task.
Test behavior, not implementation. Brittle is not the same as hard.
Keep the reference patch honest. Whatever you change about the bug or the tests, the patch must remain the thing that makes the failing tests pass.
Aim for real depth. A collapsed or half-finished fix should leave most of your fail_to_pass tests red. Passing Harbor is the floor, not the goal.
What not to do
Ambiguity is not difficulty. Don't make a task hard by making it unclear, under-specified, or dependent on guessing a convention that isn't visible in the repository. That produces tasks where the reference solution is only one of several defensible answers, and those get rejected downstream. If you can't state the expected behavior precisely, the task isn't ready.

If your task comes back as "too similar"
Treat it as a hard stop, not a note. Changing wording is not enough, and neither is changing colors or tests alone.
Redesign around a genuinely different bug, workflow, or feature: a new domain primitive, a new scenario, different bug families, a different layout. Ship a new UI shell, not a noun-swap of something already approved or in review.

Tips from experts
Treat the task as one contract. The instruction, the verifier, the reference solution, and the screenshots are a single artifact, not four separate pieces. Before submitting, confirm the parser expects exactly the same F2P/P2P counts as the real suite, the broken version fails the intended F2P tests, the reference solution passes the full suite cleanly, and the P2P tests pass both before and after the fix.
One problem, several angles. Keep the task focused on one clear behavioral problem and test it from several user-visible angles. Don't bolt on unrelated requirements just to inflate difficulty.
Match your screenshots. The target screenshot is optional, but if you include one, use the exact same scenario, viewport, and state as the broken one. It makes the difference far easier for a reviewer to verify.
Draw from your own experience. This is the single most useful thing you can do. Think about what you have actually struggled to get a model to change: the bugs it kept missing, the layout it kept getting wrong. Those make the best tasks.
Prove the pack before you ship. Easiness audit → nop = 0 → oracle = 1, run twice. Then zip with HEAD == base_commit, Unix modes, screenshots only under environment/problem_assets/, and no extra root-level junk.

Workspace gotchas
The 1-hour claim limit starts the moment you claim.
Queue tasks are templates. Not difficulty-checked, not duplication-checked. Substantial redesign is expected.
Import failures are usually one of: the zip structure is wrong, HEAD doesn't match base_commit, file modes aren't Unix, or screenshots aren't under environment/problem_assets/.
Release a task rather than burn an hour on it if the base repo is broken in ways that can't be reconciled with the instructions in the time available. Flag it in chat so we can pull it from the queue.

Questions and tips get shared in the project chat, worth reading through.
Standing and quality
During your first 3 completed tasks, the platform limits how much work you can have awaiting review so misunderstandings are caught early. Every expert submission still goes through automated QA and human review.
Clean review outcomes move you to full access; repeated fixes can pause or remove access. Quality controls continue after ramp-up even though new claims no longer wait on the initial cohort.
If you’re unsure whether something counts as a problem, say so rather than guessing. Release the task rather than guessing; a careful handoff is cheaper than a false submission.
Ready to pick up a task?
Claim one task, read it end to end, and make it harder than you found it.
Pass the comprehension quiz first.

