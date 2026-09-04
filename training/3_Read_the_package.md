# Read the Package

> [!NOTE]
> Four components decide whether a task is good. The **submit checklist** unlocks each item only once you have actually opened the file it refers to — you cannot confirm what you haven’t looked at.

---

## 📂 The Four Core Package Components

### 1. `instruction.md` — The Agent’s Written Prompt
* **Purpose:** The sole written prompt shown to the solving agent.
* **Visibility:** The agent can inspect the environment source code, but tests and solution assets remain protected.
* **Rule:** Describe the broken behavior precisely **without giving away the cause** — no file names, function names, or fix hints.

### 2. `environment/` — The App + Screenshots
* **Purpose:** Contains the application source, Dockerfile, and runtime files.
* **Visuals:** Screenshots live in `environment/problem_assets/` and carry the visual proof of the bug.

### 3. `tests/` — The Verifier
* **Fail-to-Pass (`[F2P]`):** Must fail on the broken app and pass after the correct fix.
* **Pass-to-Pass (`[P2P]`):** Must pass both before and after the fix.
* **Goal:** Together, these define what "solved" means. Ensure failing tests fail due to the planted bug, not incidental errors.

### 4. `solution/` — The Reference Patch
* **Purpose:** The minimal, clean patch that makes the failing tests pass.
* **Rule:** If you alter the bug or tests, this patch must be updated to remain the exact fix.

---

## 🚦 Hard Gate: Test Counts & Tagging

Submitting is **blocked** until the package meets the minimum test floor:

| Test Type | Tag Required | Minimum Count | Behavior |
| :--- | :--- | :--- | :--- |
| **Fail-to-Pass** | `[F2P]` | **6** | Fails before fix, passes after fix. |
| **Pass-to-Pass** | `[P2P]` | **2** | Passes before and after fix. |
| **Total Floor** | — | **8 minimum** *(no max)* | Hard submission requirement. |

### ⚠️ What Counts vs. What Gets Rejected:
* **Valid Test:** A `test('...')` block in `tests/*.spec.js` whose title explicitly carries the `[F2P]` or `[P2P]` tag.
* **Untagged Tests:** Do not count toward the quota.
* **Duplicate Titles:** Rejected outright by automated validation.
* **Padding:** Near-duplicate assertions, asserting constants, or guards that pass when the subject is missing will satisfy the count but **fail human/LLM review**.

---

## 🖼️ Screenshot Standards

* **`broken.png` (Required):**
  * Must visibly show the claimed problem in the exact state the agent will encounter.
  * The defect must be **observable in the pixels**, not merely implied.
  * Must be embedded directly in `instruction.md`.
* **`target.png` (Optional):**
  * Must visibly show the corresponding fix.
  * Must be **measurably different** from the broken screenshot (identical or near-identical pairs are rejected by automated QA).
  * Must be embedded in `instruction.md` if included.

> [!IMPORTANT]
> **Value Rule:** A screenshot earns its place by adding information that the written prose does not already carry (e.g., exact UI placement, visual glitches). A screenshot that merely restates the text is a common reason tasks get returned.

---

## ✅ Your Submit Checklist

Before submitting, you must confirm:

- [ ] **1. Instruction Quality:** Confirm `instruction.md` is clear, correct, and leak-free.
- [ ] **2. Visual Verification:** Confirm problem images match the described behavior.
- [ ] **3. Fix Verification:** Confirm the fixed repository resolves the described issue.
- [ ] **4. Test Suite:** Confirm the verifier tests / harness accurately check the described behavior.

---

**Previous:** [Section 2: Claim a Task](file:///Users/melab/Documents/afterquery-project/project-sand/training/2_Claim_a_task.md) | **Next:** [Section 4: How to Build a Task](file:///Users/melab/Documents/afterquery-project/project-sand/training/4_Harden_the_task.md)