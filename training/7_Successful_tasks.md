# What Makes a Successful Task: Getting Approved

> [!IMPORTANT]
> **Core Objective:** Section 4 gets you a *valid* task; this section gets you an *approved* one ($50). Your goal on every submission is to make the target version the **most professional, production-ready version of that application you could ship**.

---

## 🚫 Common Rejection Reasons

Review this list first—these represent the most frequent failure points seen during QA and human review:

| Rejection Trigger | Why It Fails | How to Fix |
| :--- | :--- | :--- |
| **Image Adds Nothing** | The screenshot merely duplicates what is already in the text. | Ensure the image shows UI layout, clipping, styling, or state that text alone cannot convey. |
| **Not Enough Broken Images** | Multiple visual problems described, but only one is pictured. | Add a broken screenshot for **every distinct visual defect** mentioned. |
| **Trivial UI Tweaks** | "Make this button 2px larger" or cosmetic preference. | Ground changes in objectively broken UI (overlapping elements, cut-off text, unreadable contrast). |
| **Unfair Instructions** | Either too vague to solve or explicitly gives away the exact file/fix. | Describe observable symptoms clearly without naming files, variables, or functions. |
| **AI-Written Instructions** | Reads generically, describes non-existent behavior, or leaks answers. | Write instructions yourself from scratch. |
| **Too Similar to Existing Task** | Re-skinning or rewording an existing task template. | Redesign around a brand new bug family, domain primitive, or workflow. |

---

## 🧠 How to Harden a Task (Beating SOTA Models)

The automated difficulty probe runs your task against a **state-of-the-art AI agent 10 times**. 
Tasks that feel moderately difficult to a human are often trivially solved in seconds by an agent that reads the entire codebase at once.

### 1. Diagnose Why a Task is Too Easy
* ⚠️ **Leaked Instruction:** Names the file, function, variable, or fix.
* ⚠️ **Shallow Bug:** The root cause is directly adjacent to the symptom in local context.
* ⚠️ **Happy-Path Only Tests:** A single assertion satisfies the verifier, allowing random-guess passes.

### 2. What Actually Creates Real Difficulty
* **Non-Obvious Root Causes (`Fail site ≠ Fix site`):**
  The symptom surfaces in the UI or an endpoint handler, but the root cause lives deep in data normalization, state reducers, or configuration logic. The agent must trace data flow across multiple modules.
* **Cross-Cutting Changes:**
  Defects spanning frontend + backend, or a type/schema modification rippling across multiple modules. Make defects orthogonal (e.g., an incorrect route helper *plus* a lifecycle state bug, rather than one typo copied 4 times).
* **Edge Cases & Subtle Invariants:**
  Off-by-one errors, async race conditions, encoding mismatches, and boundary conditions in business logic that require rigorous reasoning.
* **Non-Trivial Feature Additions:**
  Small additions requiring deep understanding of the existing architecture to integrate cleanly.
* **Front-End Depth:**
  Layout constraints, z-index bugs, flexbox/grid edge cases, and responsive reflow issues are genuinely challenging for code models.

---

## 🔨 Hardening a Queue Template

Templates arrive far too easy. The solution is **not rewording—it is breaking them further**:

```
1. Add deeper bugs to Base Repo  ──►  2. Write clean fixes in Fixed Repo
                │                                    │
                ▼                                    ▼
3. Update `instructions.md` (Symptoms) ──►  4. Add Tests & Visual Evidence
```

1. Introduce orthogonal defects into the **Base Repo**.
2. Implement corresponding clean fixes in the **Fixed Repo** (which forms your solution patch).
3. Update `instructions.md`, screenshots, and tests to match.
4. If all four pieces do not describe the exact same contract, the task fails review regardless of difficulty.

---

## 🎯 Guiding Principles

* **Describe symptoms, not causes:** Let screenshots carry visual weight. State rules in plain English.
* **Coupled behaviors:** The strongest tasks require understanding how multiple system behaviors interact.
* **Test behavior, not implementation:** Never test private helper names, regex source files, or assert call order.
* **Honest reference patch:** The patch must directly and cleanly resolve the failing tests without hardcoding test data.
* **Depth over triviality:** A half-finished fix should leave the majority of `fail_to_pass` tests failing.

> [!CAUTION]
> **Ambiguity is NOT Difficulty:** Making an instruction vague, under-specified, or dependent on guessing unstated conventions will cause rejection. The expected behavior must be crisp, testable, and unambiguous.

---

## ⛔ If Your Task is Flagged as "Too Similar"

Treat this as a **hard stop**. Rewording text, changing theme colors, or tweaking test names will not suffice.

* **Action Required:** Redesign around a genuinely different bug, workflow, or feature.
* Create a new domain primitive, different bug families, and a distinct UI layout.

---

## 💡 Expert Tips & Best Practices

* **One Cohesive Contract:** The instruction, verifier, reference solution, and screenshots are a single unified artifact.
* **One Problem, Several Angles:** Focus on one clear behavioral issue and test it thoroughly across different user-visible scenarios rather than bolting on unrelated toys.
* **Match Screenshot Viewports:** When including `target.png`, match the exact scenario, window size, and state of `broken.png` so diffs are immediate.
* **Draw from Experience:** Think of bugs that previously gave you or your team real debugging headaches.
* **Local Verification Sequence:**
  1. Automated sanity checks
  2. `harbor run -p ./my-task -a nop` *(reward = 0)*
  3. `harbor run -p ./my-task -a oracle` *(reward = 1, run twice)*
  4. Archive with `HEAD == base_commit` and Unix file modes.

---

## ⚠️ Workspace Gotchas

* **1-Hour Claim Window:** Starts ticking the moment you claim the task.
* **Import Failure Checklist:**
  - [ ] Zip structure matches the standard template.
  - [ ] Git `HEAD` matches `base_commit`.
  - [ ] File modes are Unix (LF line endings).
  - [ ] Screenshots located strictly under `environment/problem_assets/`.
* **Release vs. Burn:** If a base template is irreconcilably broken, release it immediately rather than burning an hour.

---

**Previous:** [Section 6: If It Comes Back](file:///Users/melab/Documents/afterquery-project/project-sand/training/6_If_it_comes_back.md) | **Next:** [Section 8: Standing and Quality](file:///Users/melab/Documents/afterquery-project/project-sand/training/8_Standing_and_quality.md)