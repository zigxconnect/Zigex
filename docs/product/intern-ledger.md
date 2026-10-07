# Zigex Intern Ledger: Financial Architecture & Roadmap

This document provides a comprehensive breakdown of the **Intern Financial Ledger System**. It is designed to manage the economic lifecycle of every intern with 100% mathematical transparency, transitioning the institution from manual record-keeping to a digital financial node.

---

## 1. The Mathematical Foundation

The Zigex Ledger operates on an **Accrual Basis**, where revenue is projected at the start of an engagement and realized as monthly milestones are met.

### A. Total Contract Value ($TCV$)
This represents the maximum expected revenue from a single internship engagement over its entire lifespan.
$$TCV = R \times D$$
*   **$R$**: The agreed **Monthly Rate** (in XAF).
*   **$D$**: The **Duration** of the internship (in months).

### B. Total Amount Paid ($TAP$)
The real-time sum of all verified collections recorded in the monthly sub-ledger by an administrator.
$$TAP = \sum_{i=1}^{n} a_i$$
*   **$a_i$**: The specific amount recorded for **Month $i$**. Defaults to $R$ but can be a custom value.

### C. Accrued Revenue to Date ($AR$)
The total amount that *should* have been collected at the present moment, based on the time elapsed since the intern's start date $(t_{now} - t_{start})$.
$$AR = \min(D, months_{elapsed}) \times R$$

### D. Current Arrears / Debt ($A$)
The immediate financial gap that requires recovery. This is the difference between what was expected *by today* and what was actually collected.
$$A = \max(0, AR - TAP)$$

### E. Lifetime Net Balance ($B$)
The total remaining contractual obligation, including future months.
$$B = TCV - TAP$$

### F. Collection Efficiency ($\eta$)
A Key Performance Indicator (KPI) used to measure the financial health of a specific intern cohort.
$$\eta = \left( \frac{TAP}{TCV} \right) \times 100$$

---

## 2. Practical Scenarios & Samples

### Scenario A: The Overdue Intern
An intern is on a **4-month** plan at **50,000 XAF/month**. They applied **2 months ago** but have only paid for **Month 1**.
*   **Variables**: $R = 50,000$, $D = 4$, $months_{elapsed} = 2$
*   **Actuals**: $TAP = 50,000$

**Calculations**:
1.  **Contract Worth**: $TCV = 50,000 \times 4 = \mathbf{200,000 \text{ XAF}}$
2.  **Expected to Date**: $AR = 2 \times 50,000 = \mathbf{100,000 \text{ XAF}}$
3.  **Current Debt**: $A = 100,000 - 50,000 = \mathbf{50,000 \text{ XAF}}$ (Status: **DEBT**)
4.  **Lifetime Balance**: $B = 200,000 - 50,000 = \mathbf{150,000 \text{ XAF}}$

---

## 3. Financial Health Lifecycle

The Zigex UI uses these formulas to dynamically assign a "Financial Health" status to each record:

| Status | Condition | UI Indicator | Meaning |
| :--- | :--- | :--- | :--- |
| **Settled** | $A \le 0$ & $B = 0$ | **SHIELD (Green)** | Contract complete and fully paid. |
| **Current** | $A \le 0$ & $B > 0$ | **CHECK (Blue)** | Paid to date, future payments pending. |
| **Arrears** | $A > 0$ | **ALERT (Red)** | Immediate debt detected; recovery needed. |
| **Credit** | $TAP > AR$ | **PLUS (Emerald)** | Overpayment or advance payment recorded. |

### Scenario B: The Scholarship or Zero-Base Intern
An intern has a **0 XAF** base rate ($R=0$) but is required to pay a manual **25,000 XAF** certification fee during their final month.
*   **Calculations**: $TCV = 0 \times D = \mathbf{0 \text{ XAF}}$
*   **Action**: Admin uses the **Custom Amount Modal** to log $a_3 = 25,000$.
*   **Result**: $B = 0 - 25,000 = \mathbf{-25,000 \text{ XAF}}$
    *   *Note: Negative balances represent credits or "Fully Settled" status in the Zigex UI.*

---

## 3. System Logic & Toggle Mechanics

The dashboard features interactive reactors (**M1, M2, M3...**) that correspond to monthly indices. 

| State | Graphic | Mathematical Impact |
| :--- | :--- | :--- |
| **Awaiting** | $\circ$ | $a_i = 0$. Balance ($B$) remains at maximum. |
| **Verified** | $\checkmark$ | $a_i = R$. $TAP$ increments, $B$ decreases. |
| **Custom** | $\$$ | $a_i = \text{input}$. Allows for partial or over-payments. |

### Data Storage Strategy
Every intern's financial state is stored as a **JSONB Array** in the database to allow for high-speed, join-free auditing:
```json
{
  "month_index": 1,
  "status": "paid",
  "amount_verified": 50000,
  "timestamp": "2026-01-26T12:00:00Z"
}
```

---

## 4. Financial Roadmap (Strategic Evolution)

We are currently evolving the ledger from a managed tool to a **Zero-Touch Financial Engine**.

### 🚀 Phase 1: Late Fee Calculus ($LF$)
Introduction of automated penalties for payments delayed past the 5th of each month.
$$LF = B \times (\lambda \times t)$$
*   **$\lambda$**: Daily interest rate (e.g., 0.5%).
*   **$t$**: Days past the standard grace period.

### 💰 Phase 2: Gateway Integration
*   **Direct Pay**: Integration with **MTN/Orange Mobile Money**.
*   **Instant Clearing**: When an intern pays via the app, the ledger updates via a secure webhook $(\text{MoMo} \rightarrow \text{Zigex API} \rightarrow \text{Ledger})$.

### 📊 Phase 3: Pro-Rata Engine
Automated adjustment of Monthly Rates ($R_{adj}$) for interns who join or leave mid-billing-cycle.
$$R_{adj} = R \times \left( \frac{days_{active}}{30} \right)$$

---
*Document Version: 1.1.0*
*Author: Zigex Engineering Team*
*Last Updated: January 26, 2026*
