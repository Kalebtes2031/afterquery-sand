# How Project Sand Works

> [!IMPORTANT]
> **Start Here:** Read this page before you claim or import anything. It takes two minutes and will save you several dropped tasks.

---

## 💰 Pay and Limits

* **Compensation:** **$50** per approved task.
* **Time Commitment:** Budget **1 hour or more** per task. *This is not a task you can rush.*
* **Bootcamp Status:** You must produce at least **1 task that passes QA**. Until then, you are capped at **2 concurrent tasks**.

---

## 📦 What You're Making

You are building a task centered on a code repository, accompanied by at least one visual screenshot demonstrating the broken state.

### Anatomy of a Task

| Component | Type | Description |
| :--- | :--- | :--- |
| **Base repo** | Code | The broken version of the application. |
| **Fixed repo** | Code | The corrected version of the application. |
| **`instructions.md`** | Docs | The problem description presented to the agent. |
| **Broken screenshot** | Image | **Required.** Visual evidence clearly demonstrating what is wrong. |
| **Target screenshot** | Image | *Optional.* Include only if it adds context beyond the broken image and text. |
| **Tests** | Test Suite | Includes `fail_to_pass` (must fail before fix, pass after) and `pass_to_pass` (must pass both before and after). |
| **Solution patch** | Patch | The reference fix that makes the failing tests pass. |

---

## 🎯 The Three Pillars of Task Approval

Every task is evaluated on three core criteria:

1. **Difficulty**
   A strong AI agent that can read the entire codebase instantly should still struggle with it.
2. **Correctness**
   The patch genuinely fixes the stated problem, and the test suite genuinely verifies the fix.
3. **Fairness**
   A valid solution is never docked, and an invalid solution never passes.

*(All guidance in subsequent sections expands upon these three principles.)*

---

## 🛠️ Two Ways to Create a Task

### 1. Claim from the Queue
* Queue tasks are **templates**, not finished work.
* They are **not checked for difficulty** and **not checked against existing submissions for duplication**.
* Your job is to **break them further and rebuild the problem**, not simply polish what exists.
* > [!WARNING]
  > A lightly-edited template will be rejected as too easy or too similar.

### 2. Task Import *(Recommended)*
Build the task yourself locally and upload it.

**Requirements for Import:**
- [x] **Zipped:** The task must be properly compressed into an archive.
- [x] **Visuals:** The application launches and has visual UI. At least one screenshot must be attached.
- [x] **Verified Locally:** You have run `nop = 0` and `oracle = 1` locally before uploading (*see Section 4, Step 7*).
- [x] **Standard Template:** You must download and build inside the provided task template. Structuring the task yourself is the most common cause of import failures.

> [!TIP]
> **Why Import is Recommended:** You control the problem design from the start, making it far easier to achieve the required difficulty and originality bars.

---

## 📋 Universal Submission Rules

1. **Write your instructions yourself:**
   `instructions.md` must be written by you, in your own words. AI-generated instructions are a strict rejection reason—they read as generic, leak solutions, and frequently describe behavior the application does not have.
2. **Verify everything manually:**
   Launch the base repo and confirm it is broken as described. Launch the fixed repo and confirm it is resolved. Manually interact with the application. *Automated checks tell you a task is valid; only using the app tells you it is correct.*
3. **Clean up artifacts:**
   Delete any `UNVERIFIED.md` or `warning.md` files found in a claimed task before submitting.

---

**Next:** [Section 2: Claim a Task](file:///Users/melab/Documents/afterquery-project/project-sand/training/2_Claim_a_task.md) | [Section 4: How to Build a Task](file:///Users/melab/Documents/afterquery-project/project-sand/training/4_Harden_the_task.md)