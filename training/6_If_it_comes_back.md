# Handling Returned Tasks (If It Comes Back)

> [!NOTE]
> After submitting, the progress strip on your **Overview** (and on the **Import** page) tracks each automated check in real-time.

---

## 🚦 Understanding Progress & Pause States

| State | Visual Indicator | Meaning | Required Action |
| :--- | :--- | :--- | :--- |
| **Transient Retry** | 🟡 **Amber Pause** | The platform encountered a transient issue and is automatically retrying. | **None.** Wait for retry to finish. |
| **Human Review** | 🔘 **Grey Pause** *(“Additional review”)* | An operator/person is actively reviewing the task. | **None.** Await human feedback. |
| **Action Required** | 🔴 **Check Failed** | A check failed and the task was returned to your **Needs your fix** tab. | **Action Required.** Review reason and fix. |

---

## 🛠️ Action Options for Returned Tasks

Depending on how your task originated, choose the appropriate action:

### 1. `Resume fix` *(Tasks claimed from the queue)*
* **Action:** Reopens the returned task in your workspace with your previous changes intact.
* **Timer:** Grants a **fresh claim window** under the currently active policy.

### 2. `Download package → Upload fixed version` *(Imported tasks)*
* **Action:** Repaired offline on your local machine.
* **Workflow:** Download the returned package, apply fixes locally, and upload the corrected archive (`.zip`, `.tar.gz`, or `.tgz`). Automated checks restart automatically.

### 3. `Release task` *(Any returned task)*
* **Action:** Terminates your fix line.
  * **Queue tasks:** Re-enters the global pool for other specialists.
  * **Imported tasks:** Permanently closes the task (since it was your custom upload).
* **Impact:** Released work **no longer counts against your standing** — a deliberate release is always better than leaving a returned task parked.

### 4. `Flag as unfixable` *(Any returned task)*
* **Action:** Used strictly when the underlying template is too fundamentally broken/low-quality to be salvageable.
* **Impact:** Permanently retires the task for everyone. 
* > [!WARNING]
  > Unfixable flags are audited by administrators. Repeated unjustified flags will negatively impact your standing.

---

## 📊 Attempt Budgets & Rules

### 1. Automated Quality Returns (3 Counted Attempts)
* **Budget:** **3 counted fix attempts** per task.
* **Free First Reports:** An attempt is deducted **only when an issue you were already notified about fails again**. The first report of any new issue is **free**.
* **Exhausting the Budget:**
  * **Queue tasks:** Requeued to another expert (you cannot reclaim it).
  * **Imported tasks:** Escalated directly to administrator review.

### 2. Difficulty / "Too-Easy" Loop (3 Hardening Attempts)
* Budgeted separately from quality checks with its own **3 hardening attempts**.

### 3. Human Reviewer Returns
* Arrives with **structured feedback** detailing the issue, recommended fix, and required rework.
* > [!TIP]
  > Human reviewer returns **do not consume** your automated fix attempt budget.

---

**Previous:** [Section 5: Submit and QA](file:///Users/melab/Documents/afterquery-project/project-sand/training/5_Submit_and_QA.md) | **Next:** [Section 7: What Makes a Successful Task](file:///Users/melab/Documents/afterquery-project/project-sand/training/7_Successful_tasks.md)