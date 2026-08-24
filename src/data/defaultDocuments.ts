import { DocumentItem } from "../types";

export const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-apex-10k",
    title: "Apex Financial Corp 2025 Annual 10-K Report",
    filename: "Apex_Annual_Report_2025.pdf",
    category: "Finance",
    description: "Audited financial statements, quarterly net revenue, operating expenses, and market risk analysis for fiscal year 2025.",
    totalPages: 4,
    enabled: true,
    uploadedAt: "2026-01-15T09:30:00Z",
    pages: [
      {
        pageNumber: 1,
        content: `EXECUTIVE SUMMARY & BUSINESS OVERVIEW - APEX FINANCIAL CORP
Apex Financial Corp (NYSE: APX) delivers global cloud fintech infrastructure and payment settlement processing.
In Fiscal Year 2025, consolidated net revenues reached $4.82 billion, representing a 22.4% year-over-year expansion compared to $3.94 billion in FY2024.
Total processed payment volume (TPV) exceeded $312 billion across 48 countries.
Operating cash flows closed at $1.35 billion, with free cash flow conversion standing at 88.5%.
The company maintained a Tier-1 capital adequacy ratio of 14.8%, significantly surpassing standard regulatory thresholds.`,
      },
      {
        pageNumber: 2,
        content: `CONSOLIDATED FINANCIAL STATEMENTS & SEGMENT BREAKDOWN
Segment Net Revenue:
1. Enterprise Core Banking Solutions: $2.41 billion (50.0% of total revenue), generating an adjusted EBITDA margin of 38.2%.
2. Merchant Acquiring & Cross-Border Rails: $1.65 billion (34.2% of total revenue), up 29.1% YoY driven by Southeast Asia and EMEA adoption.
3. Embedded Wealth & AI Advisory APIs: $760 million (15.8% of total revenue), expanding at a CAGR of 44.0%.
Total Operating Expenses for FY2025 totaled $3.18 billion, consisting of $1.42 billion in R&D, $980 million in Sales & Marketing, and $780 million in G&A.`,
      },
      {
        pageNumber: 3,
        content: `FOURTH QUARTER (Q4 2025) DETAILED PERFORMANCE
In Q4 2025, Apex recorded net revenues of $1.31 billion, up 18.5% year-over-year.
Q4 GAAP Net Income stood at $342 million ($1.12 diluted EPS) compared to $280 million ($0.94 diluted EPS) in Q4 2024.
Adjusted EBITDA for the quarter was $495 million, achieving an operating margin of 37.8%.
Effective corporate tax rate for Q4 2025 was finalized at 19.4%, down from 21.2% in the prior year due to overseas research tax credits.`,
      },
      {
        pageNumber: 4,
        content: `ENTERPRISE RISK FACTORS & CAPITAL EXPENDITURE GUIDANCE
Capital expenditures for FY2026 are forecasted between $420 million and $460 million, primarily targeting high-availability sovereign data center clusters in Frankfurt and Singapore.
Key identified operational risks include foreign exchange volatility in EMEA currencies (EUR/GBP exposure totaling $620 million unhedged), cybersecurity threats against distributed ledger validators, and tightening data residency mandates across Latin America.
The company holds $2.1 billion in cash and short-term liquid securities as of December 31, 2025.`,
      },
    ],
  },
  {
    id: "doc-novacloud-handbook",
    title: "NovaCloud Global Employee Handbook 2026",
    filename: "NovaCloud_Employee_Handbook_2026.pdf",
    category: "HR & Operations",
    description: "Standard corporate policies, paid time off, remote working provisions, health benefits, and compliance rules.",
    totalPages: 4,
    enabled: true,
    uploadedAt: "2026-02-01T11:00:00Z",
    pages: [
      {
        pageNumber: 1,
        content: `SECTION 1: WORKPLACE PRINCIPLES & WORKING HOURS
NovaCloud operates as a hybrid-first engineering and software organization.
Standard full-time employment entails 40 hours per workweek. Core collaboration hours are 10:00 AM to 3:00 PM in the employee's designated primary time zone.
Flexible scheduling is supported upon written confirmation with the department team lead.
Overtime eligibility is strictly governed by FLSA classification; non-exempt employees must obtain prior manager approval for any hours exceeding 40 in a single workweek.`,
      },
      {
        pageNumber: 2,
        content: `SECTION 2: PAID TIME OFF (PTO), SICK LEAVE & PARENTAL LEAVE
All standard full-time employees accrue 22 business days of flexible Paid Time Off (PTO) per calendar year, accruing at a rate of 1.83 days per completed month.
A maximum of 5 unused PTO days may roll over into the subsequent calendar year; excess days forfeit on March 31.
NovaCloud provides 16 weeks of fully paid parental leave for primary and secondary caregivers following birth, adoption, or foster placement, accessible within the first 12 months.
Dedicated wellness and bereavement leave is allocated up to 10 paid days per eligible incident.`,
      },
      {
        pageNumber: 3,
        content: `SECTION 3: MEDICAL, DENTAL & WELLNESS SUBSIDIES
NovaCloud covers 90% of monthly health insurance premiums for employees and 75% for eligible dependents under the Premium Platinum PPO plan.
Employees enrolled in the High Deductible Health Plan (HDHP) receive an annual Health Savings Account (HSA) employer contribution of $1,200 for individuals and $2,400 for families.
An annual wellness stipend of $600 is reimbursable for gym memberships, athletic equipment, or mental health counseling apps.`,
      },
      {
        pageNumber: 4,
        content: `SECTION 4: HOME OFFICE & REMOTE WORK REIMBURSEMENT
All remote and hybrid employees are eligible for a one-time Home Office Setup Allowance of $1,500 upon initial hire to purchase ergonomic desk furniture and external monitors.
Additionally, remote employees receive a recurring monthly internet and cellular utility stipend of $85.
All hardware purchases remain the personal property of the employee, whereas company-issued MacBook Pro laptops must be returned within 14 calendar days upon separation.`,
      },
    ],
  },
  {
    id: "doc-novacloud-addendum",
    title: "NovaCloud Benefits & Stipends Addendum Q1 2026",
    filename: "NovaCloud_Benefits_Addendum_Q1_2026.pdf",
    category: "HR & Operations",
    description: "Official executive board amendment overriding remote work subsidies and travel expense policies starting March 2026.",
    totalPages: 2,
    enabled: true,
    uploadedAt: "2026-03-01T14:15:00Z",
    pages: [
      {
        pageNumber: 1,
        content: `POLICY AMENDMENT MEMORANDUM - EFFECTIVE MARCH 1, 2026
This official addendum supersedes specific provisions outlined in the Global Employee Handbook 2026 regarding remote setup allowances and travel limits.
In response to inflation and revised global ergonomic standards, the Executive Leadership Team has approved upgraded budget allowances across all regional entities.`,
      },
      {
        pageNumber: 2,
        content: `REVISED HOME OFFICE STIPENDS (SUPERSEDING SECTION 4)
The one-time Home Office Setup Allowance is officially increased to $2,200 (increased from the previous $1,500 baseline) for all active full-time staff and new hires onboarding after March 1, 2026.
The recurring monthly connectivity stipend is elevated from $85 to $110 per month.
Employees who claimed the original $1,500 stipend within the preceding 6 months are entitled to a supplemental catch-up reimbursement of up to $700 with verified expense receipts.`,
      },
    ],
  },
  {
    id: "doc-cardiozen-protocol",
    title: "CardioZen Phase III Clinical Trial Protocol (CZ-302)",
    filename: "CardioZen_Clinical_Protocol_v3.pdf",
    category: "Healthcare & Clinical",
    description: "Double-blind randomized multi-center trial protocol evaluating CardioZen (CZ-302) for hypertensive cardiomyopathy.",
    totalPages: 3,
    enabled: true,
    uploadedAt: "2026-01-20T08:00:00Z",
    pages: [
      {
        pageNumber: 1,
        content: `CLINICAL PROTOCOL SUMMARY & PRIMARY OBJECTIVES
Study ID: CZ-302-HTN. Title: A Double-Blind, Placebo-Controlled Trial of CZ-302 in Hypertensive Cardiomyopathy.
Primary Efficacy Endpoint: Reduction in mean 24-hour ambulatory systolic blood pressure (SBP) from baseline to Week 24.
Secondary Endpoints: Left ventricular mass index (LVMI) regression measured via cardiac MRI and reduction in serum NT-proBNP levels.
Target Enrollment: 1,450 adult subjects aged 35-75 years across 62 global investigational sites.`,
      },
      {
        pageNumber: 2,
        content: `DOSING SCHEDULE & PATIENT ELIGIBILITY CRITERIA
Dosing Regimen: CardioZen 40mg administered orally once daily in the morning with water.
Dose titration to 80mg is permitted at Week 8 for patients failing to achieve SBP < 130 mmHg, provided estimated glomerular filtration rate (eGFR) remains >= 45 mL/min/1.73m^2.
Inclusion Criteria: Documented stage-2 hypertension (SBP >= 140 mmHg and/or DBP >= 90 mmHg) despite dual antihypertensive therapy.
Exclusion Criteria: Severe renal impairment (eGFR < 30 mL/min/1.73m^2), history of acute myocardial infarction within 6 months, or baseline serum potassium > 5.2 mmol/L.`,
      },
      {
        pageNumber: 3,
        content: `SAFETY MONITORING & ADVERSE EVENT DISCONTINUATION THRESHOLDS
Mandatory clinical evaluation occurs at Weeks 2, 4, 8, 12, 18, and 24.
Treatment Discontinuation Criteria:
1. Confirmed serum creatinine increase > 50% over baseline on two consecutive tests spaced 48 hours apart.
2. Sustained hyperkalemia with serum potassium >= 5.6 mmol/L despite dietary potassium restriction.
3. Symptomatic hypotension with resting systolic blood pressure < 90 mmHg accompanied by syncope or lightheadedness.
All Serious Adverse Events (SAEs) must be transmitted to the Data Safety Monitoring Board (DSMB) within 24 hours of site notification.`,
      },
    ],
  },
  {
    id: "doc-aetherscale-sla",
    title: "AetherScale Distributed DB Architecture & SLA Whitepaper",
    filename: "AetherScale_Architecture_SLA.pdf",
    category: "Engineering & Tech",
    description: "Technical architecture specifications, Raft consensus protocol parameters, backup retention, and high-availability SLAs.",
    totalPages: 3,
    enabled: true,
    uploadedAt: "2026-02-10T16:00:00Z",
    pages: [
      {
        pageNumber: 1,
        content: `SYSTEM ARCHITECTURE & CONSENSUS ENGINE
AetherScale is a globally distributed, multi-master transactional database engine designed for sub-10ms ACID transactions across multi-cloud regions.
Consensus Algorithm: Multi-Raft protocol with dynamic leader leasing and pipelined log replication.
Storage Engine: Hybrid LSM-tree with lock-free block cache and NVMe-optimized tiered compaction.
Default replication factor is 5 nodes across minimum 3 independent availability zones (AZs), guaranteeing survival against 2 simultaneous node crashes with zero data loss.`,
      },
      {
        pageNumber: 2,
        content: `SERVICE LEVEL AGREEMENTS (SLA) & PERFORMANCE METRICS
Uptime Guarantee: 99.995% monthly availability for multi-region active-active deployments (excluding scheduled maintenance windows under 30 minutes per calendar quarter).
Latency SLAs: P95 read latency < 4.5ms; P99 write latency < 12.0ms under standard transaction loads up to 150,000 writes/second.
Recovery Point Objective (RPO): RPO = 0 seconds for synchronous multi-AZ clusters; RPO < 5 seconds for cross-continental asynchronous replicas.
Recovery Time Objective (RTO): Automated failover triggers within 800ms upon leader heartbeat timeout.`,
      },
      {
        pageNumber: 3,
        content: `BACKUP RETENTION & SECURITY COMPLIANCE
Continuous incremental point-in-time recovery (PITR) is maintained with a 35-day rolling window in encrypted object storage.
Full cluster immutable cryptographic snapshots are generated every 24 hours and retained for 365 days in WORM (Write Once, Read Many) compliant storage.
Encryption in Transit: TLS 1.3 with mutual certificate authentication (mTLS) and ChaCha20-Poly1305 / AES-256-GCM cipher suites.
Encryption at Rest: Hardware-accelerated AES-256 with customer-managed encryption keys (CMEK) via AWS KMS, GCP Cloud KMS, or HashiCorp Vault.`,
      },
    ],
  },
  {
    id: "doc-legal-msa",
    title: "GlobalCorp Enterprise Master Services Agreement (MSA)",
    filename: "GlobalCorp_Master_Services_Agreement.pdf",
    category: "Legal",
    description: "Standard commercial contract clauses, governing law, indemnification caps, liability limits, and termination terms.",
    totalPages: 3,
    enabled: true,
    uploadedAt: "2026-01-05T10:00:00Z",
    pages: [
      {
        pageNumber: 1,
        content: `SECTION 8: INTELLECTUAL PROPERTY & DATA OWNERSHIP
Client retains exclusive right, title, and interest in all Client Data, including confidential customer records, proprietary telemetry, and derivative work products.
Vendor is granted a non-exclusive, revocable, worldwide license strictly to process and store Client Data solely to provide the contracted SaaS services.
Vendor warrants that neither the platform software nor deliverables infringe upon any third-party patent, copyright, or trade secret rights.`,
      },
      {
        pageNumber: 2,
        content: `SECTION 12: LIMITATION OF LIABILITY & INDEMNIFICATION
Neither party shall be liable for indirect, incidental, punitive, or consequential damages, including loss of profits, data, or business goodwill.
Aggregate liability of either party arising out of or related to this Agreement shall not exceed the total fees paid by Client in the twelve (12) months preceding the incident.
Carve-Outs: The liability cap does not apply to (a) breach of confidentiality obligations under Section 7, (b) gross negligence or willful misconduct, or (c) Vendor's indemnification obligations for third-party IP infringement.`,
      },
      {
        pageNumber: 3,
        content: `SECTION 15: TERM, TERMINATION & GOVERNING LAW
Term: Initial term of three (3) years, renewing automatically for successive 12-month periods unless notice is provided.
Termination for Convenience: Either party may terminate this Agreement without cause upon sixty (60) days prior written notice to the other party.
Termination for Cause: Either party may terminate immediately if the other party material breaches any provision and fails to cure such breach within thirty (30) days of receiving written notice.
Governing Law & Dispute Resolution: This Agreement is governed by the laws of the State of Delaware, without regard to conflict of law principles. All disputes shall be resolved by binding arbitration in Wilmington, DE under AAA commercial rules.`,
      },
    ],
  },
];
