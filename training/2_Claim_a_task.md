# Claim a Task

## 📌 Overview

Open the task queue and claim an available task.

* **Single Task Rule:** You can hold **one task at a time** — finish or release it before taking another.

---

## ⏱️ Claim Duration & Snapshot Lifecycle

> [!WARNING]
> **60-Minute Window:** A new claim runs for **60 minutes**. 
> The timer in your workspace is authoritative because an active claim keeps the policy it started under.

### What Happens on Release or Expiration?
* **Working Snapshot Closes:** Release or expiry closes your working snapshot.
* **Audit Trail Preserved:** The audit trail remains intact.
* **Clean Slate for Next Claimant:** A later claimant starts from the accepted base rather than your unfinished edits.

---

**Previous:** [Section 1: How Project Sand Works](file:///Users/melab/Documents/afterquery-project/project-sand/training/1_How_Sand_works.md) | **Next:** [Section 3: Read the Package](file:///Users/melab/Documents/afterquery-project/project-sand/training/3_Read_the_package.md)