# Submit and QA

## 🔄 The Review Pipeline

When you submit a task, it undergoes a two-stage evaluation process:

```
[ Your Submission ] 
       │
       ▼
[ Automated QA ] ── (Fails) ──► Returned to "Needs your fix"
       │ (Passes)
       ▼
[ Human Reviewer ] ── (Issues) ──► Human Review Feedback / Escalation
       │ (Approved)
       ▼
[ Approved Task ($50) ]
```

1. **Automated QA:**
   * Verifies the app builds cleanly.
   * Runs the verifier to ensure tests fail on base and pass on reference solution (`nop = 0` / `oracle = 1`).
   * Evaluates task difficulty with automated difficulty probes.
2. **Human Reviewer:**
   * Inspects instructions, screenshot quality, solution cleanliness, and subjective UI improvements.

---

## 🔁 Handling Automated QA Returns

* **Actionable Reasons:** If automated QA returns your task, a specific failure reason will be provided. Fix the targeted issue and resubmit.
* **Escalations:** Reviewer flags escalate to an administrator rather than reopening your claim.

---

## ⚠️ Pre-Review Easiness Check & Retries

> [!WARNING]
> **3-Attempt Easiness Limit:** The automated pre-review easiness check can return a task to you **up to 3 times** with a fresh time window each iteration.

* **Exhausting Retries:** If the task remains too easy after 3 attempts, it is automatically returned to the global queue, and **you will not be able to reclaim it**.
* **Reviewer Difficulty Findings:** The full difficulty probe is measured prior to human review, providing reviewers with objective data to evaluate marginal submissions.

---

**Previous:** [Section 4: How to Build a Task](file:///Users/melab/Documents/afterquery-project/project-sand/training/4_Harden_the_task.md) | **Next:** [Section 6: If It Comes Back](file:///Users/melab/Documents/afterquery-project/project-sand/training/6_If_it_comes_back.md)