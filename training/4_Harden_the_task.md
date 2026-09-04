# How to Build and Harden a Task

> [!NOTE]
> This is the end-to-end workflow for authoring a high-quality task. Each step includes the standard you are held to and the rationale behind it.

---

## 🖥️ The Workspace Layout

### 📁 **Folder Tab**
* **`base repo`:** The broken version of the application. Edit this to introduce the target defect.
* **`fixed repo`:** The corrected version. Edit this to implement the reference solution.
* **`instructions.md`:** The problem description the solving agent receives.
* **`broken.png` / `target.png`:** Visual screenshots. `broken.png` is required; `target.png` is optional. Retake any that do not show the real application state.
* **`reference/tests/NAME_OF_TEST.spec.js`:** Your test suite. Edit these or any file in the `tests/` directory.

### 🛠️ **Tools Tab**
* **Launch Base / Fixed Repo:** Run the application locally and interact with the UI live.
* **Local Editing:** Download the task package as `.tar`, edit it in your local IDE, and re-upload it. Confirm diffs before applying.

---

## 🚀 Step-by-Step Workflow

### Step 1: Claim and Read the Task
* Preview tasks in the queue and claim one (you have a **1-hour timer** upon claiming).
* Open the screenshots and `instructions.md`, then launch the base repo and interact with the app.
* Assess what the task currently claims to be about and how far short of the difficulty bar it falls.

---

### Step 2: Break the Task on Purpose *(Crucial Step)*
> [!IMPORTANT]
> **Queue tasks are templates.** They are not measured for difficulty or duplication and are almost always too easy as shipped. Your job is **not to tidy the existing bug**, but to **introduce a harder, deeper problem**.

Work on both repositories in parallel:
1. **Base Repo (Add Bugs):**
   * Break things deliberately in ways that make the root cause harder to trace.
   * Put the **symptom in one place and the cause in another** (`Fail site ≠ Fix site`).
   * Spread defects across both the backend and frontend.
   * Break layouts in ways that are **objectively bad** (e.g., overlapping, clipping) rather than cosmetically different.
2. **Fixed Repo (Write Solutions):**
   * Write the corresponding clean fix for every bug introduced.
   * These fixes will become your reference solution patch.

*(Everything downstream follows what you break here: instructions describe these symptoms, screenshots show them, and tests verify them.)*

---

### Step 3: Confirm Base Repo Broken State
Launch the base repo again and verify three things:
- [x] The base repo is **genuinely broken** in every way intended.
- [x] `instructions.md` **accurately describes** those breaks without leaking causes.
- [x] Screenshots **clearly depict** the exact issues described (add more broken screenshots if needed).

---

### Step 4: Rewrite `instructions.md` in Your Own Words
> [!CAUTION]
> Unrewritten instructions or AI-generated prompts are immediately flagged, and the task will be rejected. Write them yourself from scratch.

#### Guidelines for Great Instructions:
* **Describe symptoms, not causes:** Write what a user encounters. Let the agent diagnose *why*.
  * ❌ *Bad:* "The reducer in `cartSlice.js` is missing an action case."
  * ✅ *Good:* "The cart total does not update when an item is removed."
* **Be concrete about correctness:**
  * ❌ *Bad:* "The function should handle edge cases properly."
  * ✅ *Good:* "Calling `processOrder({ items: [] })` should throw an `EmptyCartError`."
* **Do NOT leak the solution:**
  * No file names, function signatures, variable names, pseudocode, algorithm names, or `BROKEN` comments in code.
* **Keep it concise and structured:** Short paragraphs, clean headers, no unneeded configuration dumps or stack traces.
* **Cover UI and layout:** Describe domain-relevant visual defects briefly.

#### 📝 Example of a Good Instruction:
> "When I play this game, after 3 points scored, the fourth and fifth points aren't added to the score. The bonus point isn't added when I press the space bar and the up key together, even though the game instructions say it should. The game screen is also cut off, the buttons overlap, and the words trail off the edge of the screen."

---

### Step 5: Make a Complete, Honest Fix
* Launch the fixed repo and interact with every flow to confirm all issues are resolved.
* **Substantial UI Fixes:** Moving an element by 2 pixels is not a task. Turn objectively bad UI (unreadable contrast, clipped text, cramped layout) into professional UI.
* **Honest Patch:** The patch must address every part of the problem and make the failing tests pass. Never hardcode against test assertions or bypass the verifier.

---

### Step 6: Write and Check the Tests
* **Test Behavior, Not Implementation:** Run the code and assert on observable outputs.
  * ❌ *Never:* Grep source for variable names, scan imports, regex function signatures, or assert on private helpers.
  * ✅ *Always:* Test external API contracts, DOM states, user interactions, and return values.
* **Execute Real Code Paths:** Every `fail_to_pass` test must genuinely call the broken code path.
* **Cover the Whole Problem:** Ensure tests cover edge cases so an agent cannot guess with a partial fix.
* **Objective UI Bounds:** Assert on defensible bounds (e.g., box spacing is between 4px and 10px).
* **Exact Test Names:** Test names in `fail_to_pass` and `pass_to_pass` must **match runner output exactly**.
* **Test Isolation:** No reliance on execution order, network access, or shared mutable state.

---

### Step 7: Run `nop` and `oracle` Locally
Run these checks in your terminal before clicking platform verification to save time:

#### 1. Null Check (`nop`):
```bash
harbor run -p ./my-task -a nop
```
* **Expected Result:** The `nop` agent applies no fix. Every test in `fail_to_pass` must **FAIL**.
* **Reward:** `/logs/verifier/reward.txt` must contain `0`.
* *If reward is 1:* The bug is already fixed at `base_commit`, or tests are not asserting on the bug.

#### 2. Oracle Check (`oracle`):
```bash
harbor run -p ./my-task -a oracle
```
* **Expected Result:** The `oracle` agent applies `solution/solve.sh`. Every test in `fail_to_pass ∪ pass_to_pass` must **PASS**.
* **Reward:** `/logs/verifier/reward.txt` must contain `1`.
* *If oracle fails:* Check `git apply` patch context lines, verify fix completeness, or check test name casing/spelling in `config.json`.

#### 3. Inspect Logs:
```bash
harbor view ./jobs
```
* Opens an interactive viewer with `stdout`, `stderr`, parser output, and rewards for detailed diagnostics.

---

### Step 8: Platform Verification Check
Run the platform verification check only after local `nop = 0` and `oracle = 1` pass cleanly.

---

### Step 9: Iterate and Harden
Refine tests, repos, and instructions until difficulty and quality bars are met. (See Section 7 for advanced hardening strategies).

---

## 📋 Pre-Submission Checklist

Ensure every item below is manually verified before clicking Submit:

- [ ] `instructions.md` is written by you, describes symptoms only, leaks nothing, and covers UI/layout.
- [ ] Base repo launches and is broken exactly as described.
- [ ] Fixed repo launches and resolves all issues, verified via live interaction.
- [ ] Screenshots reflect actual states; extra images are added for additional visual bugs.
- [ ] Target screenshot (if included) uses the exact same scenario, viewport, and state as the broken screenshot.
- [ ] Tests cover the full problem, assert on behavior, and use exact test runner names.
- [ ] Parser expects identical F2P/P2P test counts to the actual test suite.
- [ ] `nop = 0` and `oracle = 1` run and pass locally.
- [ ] All `UNVERIFIED.md` and `warning.md` files have been deleted.
- [ ] **For Imports:** Built from official template, zipped, `HEAD == base_commit`, Unix line endings/modes, screenshots strictly under `environment/problem_assets/`, no extraneous root files.

---

## ⚖️ Signal Quality Reference

| Quality | Characteristics |
| :--- | :--- |
| 🟢 **Good Signal** | Observable behavior, defects requiring understanding interacting systems, tests failing strictly due to the planted bug, clean minimal reference patch. |
| 🔴 **Brittle Signal** | Assertions on private helpers/source strings, single happy-path test, instructions mentioning file names or functions. |

---

**Previous:** [Section 3: Read the Package](file:///Users/melab/Documents/afterquery-project/project-sand/training/3_Read_the_package.md) | **Next:** [Section 5: Submit and QA](file:///Users/melab/Documents/afterquery-project/project-sand/training/5_Submit_and_QA.md)