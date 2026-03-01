## Dialysis Session Tracker – API & UI

Minimal but realistic workflow to help dialysis nurses record sessions, surface per‑session anomalies, and review today’s schedule.

---

### Stack & Project Layout

- **Backend**: Node.js, Express, MongoDB (Mongoose)
  - `backend/index.js` – Express app bootstrap
  - `backend/Model/patient.js` – patient schema
  - `backend/Model/session.js` – dialysis session schema
  - `backend/controller/*.js` – request handlers (patients, sessions, scheduler)
  - `backend/utils/detectAnomalies.js` – anomaly detection logic
  - `backend/utils/anomalies.js` – anomaly configuration & documentation
- **Frontend**: React + TypeScript + Vite
  - `frontend/src/components/Home.tsx` – main sessions dashboard
  - `frontend/src/components/SessionDetails.tsx` – per‑session detail & nurse actions
  - `frontend/src/components/AddSessionForm.tsx` – intake modal for new sessions
  - `frontend/src/components/AddPatient.tsx` – patient list
  - `frontend/src/components/Navbar.tsx` – app shell navigation
- **Tests**
  - Backend (Node test runner): `backend/test/*.test.js`
  - Frontend (Vitest + RTL): `frontend/src/components/Home.test.tsx`
- **Seed script**
  - `backend/seed.js` – seeds example patients + sessions for multiple units.

---

### Running the Project

#### 1. Backend (API)

```bash
cd backend
npm install

# Configure MongoDB (defaults shown)
echo "MONGO_URI=mongodb://localhost:27017/dialysis" > .env

# Start API
npm run dev
```

The API listens on **`http://localhost:3001`**.

To seed example data:

```bash
cd backend
node seed.js
```

#### 2. Frontend (UI)

```bash
cd frontend
npm install

# Point UI at the backend
echo "VITE_BACKEND_URL=http://localhost:3001" > .env

npm run dev
```

The UI runs on **`http://localhost:5173`** (Vite default).

#### 3. Tests

- **Backend tests** (anomaly logic + patient API):

```bash
cd backend
npm test
```

- **Frontend tests** (Home dashboard view):

```bash
cd frontend
npm test
```

---

### API Overview

Base URL: **`http://localhost:3001/api`**

#### Patients

- **POST** `/patients`
  - **Description**: Register a patient with demographics and dry weight.
  - **Body**
    ```json
    {
      "name": "Rohit",
      "email": "rohitkumar@gmail.com",
      "dob": "1980-01-01",
      "dry_weight_kg": 65,
      "unit_id": "A1"
    }
    ```
  - **Response 201**
    ```json
    {
      "message": "Patient registered successfully",
      "data": { "...patient fields..." }
    }
    ```

- **GET** `/patients`
  - **Description**: List all registered patients (newest first).
  - **Response 200**
    ```json
    [
      {
        "_id": "…",
        "name": "Rohit",
        "dob": "1980-01-01T00:00:00.000Z",
        "dry_weight_kg": 65,
        "unit_id": "A1",
        "createdAt": "…"
      }
    ]
    ```

#### Sessions (clinical data + anomalies)

- **GET** `/session`
  - **Description**: List all sessions (any unit, any day) with populated patient info and `anomalies` array.
  - **Response 200**
    ```json
    {
      "count": 3,
      "sessions": [
        {
          "_id": "…",
          "patient_id": {
            "_id": "…",
            "name": "Rohit",
            "dry_weight_kg": 65,
            "unit_id": "A1"
          },
          "unit_id": "A1",
          "machine_id": "HD-01",
          "timestamps": {
            "start": "2026-03-01T08:00:00.000Z",
            "end": "2026-03-01T12:00:00.000Z"
          },
          "vitals": {
            "pre_weight": 68,
            "post_weight": 65,
            "pre_bp_sys": 140,
            "pre_bp_dia": 85,
            "post_bp_sys": 155,
            "post_bp_dia": 80
          },
          "status": "completed",
          "nurse_notes": "Stable session.",
          "anomalies": ["HIGH_POST_BP"]
        }
      ]
    }
    ```

- **GET** `/session/:sessionID`
  - **Description**: Fetch a single session by id (used by the Session Details view).
  - **Response 200**
    ```json
    {
      "data": {
        "_id": "…",
        "patient_id": { "name": "Rohit", "unit_id": "A1", "dry_weight_kg": 65 },
        "timestamps": { "start": "…", "end": "…" },
        "vitals": { "pre_weight": 68, "pre_bp_sys": 140, "...": "..." },
        "status": "completed",
        "nurse_notes": "Stable session.",
        "anomalies": ["HIGH_POST_BP"]
      }
    }
    ```

- **GET** `/session/:unitId/today`
  - **Description**: *Today’s schedule* for a given unit. Returns all sessions whose `timestamps.start` falls within today, for that `unitId`, with anomalies attached.
  - **Response 200**
    ```json
    {
      "unit": "A1",
      "count": 2,
      "schedule": [
        {
          "_id": "…",
          "patient_id": { "name": "Alice Smith", "dry_weight_kg": 65, "unit_id": "A1" },
          "timestamps": { "start": "…", "end": "…" },
          "vitals": { "pre_weight": 68, "post_weight": 65, "...": "..." },
          "status": "completed",
          "anomalies": ["HIGH_POST_BP"]
        }
      ]
    }
    ```

#### Scheduler (nurse actions)

- **POST** `/schedule/:unitId`
  - **Description**: Create a new dialysis session for a patient (used by **Add Session** UI). If the patient email is new, the patient record is created on the fly.
  - **Body**
    ```json
    {
      "name": "Rohit",
      "email": "rohitkumar@gmail.com",
      "dob": "1980-01-01",
      "dry_weight_kg": 65,
      "unit_id": "A1",
      "machine_id": "HD-01",
      "timestamps": {
        "start": "2026-03-01T08:00:00.000Z",
        "end": "2026-03-01T12:00:00.000Z"
      },
      "vitals": {
        "pre_weight": 68,
        "pre_bp_sys": 140,
        "pre_bp_dia": 85
      },
      "nurse_notes": "Initial assessment…"
    }
    ```
  - **Behaviour**
    - Validates required patient + pre‑session vitals.
    - Creates/associates `Patient`.
    - Computes initial `anomalies` with **pre‑session** values (e.g. excessive weight gain vs dry weight).

- **PATCH** `/schedule/update/:sessionID`
  - **Description**: Update a session during / after treatment (status, post‑dialysis vitals, nurse notes).
  - **Body (example: ending a session)**
    ```json
    {
      "status": "completed",
      "vitals": {
        "post_weight": 65,
        "post_bp_sys": 170,
        "post_bp_dia": 95
      },
      "nurse_notes": "Short session, high BP."
    }
    ```
  - **Behaviour**
    - Merges any new vitals into existing ones.
    - Updates `status` (e.g. `"scheduled"` → `"in_progress"` → `"completed"`).
    - Recomputes `anomalies` with full session data (pre + post vitals, duration).

---

### Clinical Assumptions & Trade‑offs

All clinically meaningful thresholds are centralised in:

- **Backend**: `backend/utils/anomalies.js` (`ANOMALY_CONFIG`)
- **Frontend**: `frontend/src/config/rules.ts` (`CLINICAL_THRESHOLDS` & `ANOMALY_LABELS`)

#### 1. Excess Interdialytic Weight Gain

- **Rule (backend)**: flag `EXCESSIVE_WEIGHT_GAIN` when
$$
pre\_weight > dry\_weight \times 1.05
$$
- **Configuration**: `ANOMALY_CONFIG.EXCESSIVE_WEIGHT_GAIN_PERCENT = 0.05` (5%).
- **Rationale**:
  - Several cohort analyses suggest **IDWG > 4–5% of dry weight** is associated with worse blood‑pressure control and higher cardiovascular / all‑cause mortality.
  - For a minimal tool, 5% is a simple, explainable cut‑off; in reality this would be personalised (e.g. by residual renal function, frequency of dialysis).
- **Trade‑offs**:
  - May over‑flag athletic or very large patients with slightly higher tolerated gains.
  - Does not incorporate **intradialytic symptoms** or ultrafiltration rate (kg/h), which are clinically relevant but outside this minimal scope.

#### 2. High Post‑Dialysis Systolic Blood Pressure

- **Rule (backend)**: flag `HIGH_POST_BP` when
  $$
  \text{post\_bp\_sys} > 160\ \text{mmHg}
  $$
- **Configuration**: `ANOMALY_CONFIG.HIGH_POST_BP_SYSTOLIC = 160`.
- **Rationale**:
  - Post‑dialysis hypertension (especially SBP ≥ 160 mmHg) is linked to poor volume control and higher risk of cardiovascular events.
  - 160 mmHg is higher than typical pre‑dialysis treatment targets, so it is a conservative “definitely pay attention” line.
- **Trade‑offs**:
  - We do **not** adjust the threshold for age, diabetes, or baseline BP.
  - Single high reading may be noise; repeated or trend‑based logic is not implemented here.

#### 3. Abnormal Session Duration

- **Rule (backend)**:
  - `SHORT_SESSION` if duration **\< 180 minutes (3h)**.
  - `LONG_SESSION` if duration **\> 300 minutes (5h)**.
- **Configuration**:
  - `ANOMALY_CONFIG.SESSION_DURATION_MIN_MINUTES = 180`
  - `ANOMALY_CONFIG.SESSION_DURATION_MAX_MINUTES = 300`
- **Rationale**:
  - Standard thrice‑weekly hemodialysis prescriptions target about **4 hours**.
  - < 3h is a pragmatic “too short” cut‑off; > 5h suggests significant complications or unusual prescriptions.
- **Trade‑offs**:
  - Does not consider prescribed duration explicitly; some patients are intentionally shorter or longer.
  - Does not consider delivered Kt/V or blood‑flow rate; we treat time as a coarse surrogate for dose.

#### 4. Status Model

- Backend status values: `"scheduled"`, `"in_progress"`, `"completed"`.
- UI renders these as **“Not started / In progress / Completed”** via a small mapping in `Home.tsx`.
- Trade‑off: we intentionally keep a single coarse‑grained status field rather than separate flags (e.g. “on machine”, “off machine with needles in”) to keep the workflow light‑weight.

---

### Frontend Behaviour & States

- **Home (Sessions dashboard)**
  - Fetches sessions from `/api/session`.
  - Shows:
    - Patient, unit, pre/post BP, pre/post weight, start time, notes.
    - Status badge (**Not started / In progress / Completed**).
    - **Anomaly marker**: a pulsing `!` pill if `session.anomalies.length > 0` with human‑readable tooltips from `ANOMALY_LABELS`.
  - Supports:
    - Search by patient name, unit, status, or notes.
    - Toggle **“Anomalies”** to *only show sessions with anomalies*.
  - Handles:
    - **Loading** – skeleton rows.
    - **Empty** – explicit “No sessions found” state (tested in `Home.test.tsx`).
    - **Error** – inline error banner if the API call fails.

- **SessionDetails**
  - Loads a single session from `/api/session/:sessionID`.
  - Nurse actions:
    - **Start session** → `PATCH /schedule/update/:sessionID` with `status: "in_progress"`.
    - **End session** → `PATCH /schedule/update/:sessionID` with `status: "completed"`, post‑session vitals, and updated `nurse_notes`.
  - Re‑uses the backend anomaly logic through the update endpoint; any new anomalies (e.g. high post‑dialysis BP, short/long duration) are recomputed and visible on the dashboard.

- **AddSessionForm**
  - Modal intake flow for a new session, posting to `/schedule/:unitId`.
  - Captures:
    - Patient: name, email, DOB, dry weight, unit.
    - Session: machine ID, pre‑session weight and BP, free‑text nurse notes.
  - Handles:
    - **Loading** button state while saving.
    - **Error** banner on validation or network failure.

- **AddPatient**
  - Lists all registered patients from `/patients` with search, loading skeletons, empty state, and error handling.

---

### Architecture Notes

- **Data Modelling**
  - `Patient` and `Session` are separate collections, linked by `session.patient_id`.
  - `unit_id` is denormalised onto both models for easy filtering by unit.
  - `anomalies` is stored as an array of **machine‑readable codes** (e.g. `"EXCESSIVE_WEIGHT_GAIN"`), with human‑readable labels provided in the frontend.

- **Anomaly Detection**
  - Implemented in a **pure function** `detectSessionAnomaliesForPatient(session, patient)` plus an async wrapper that fetches the patient.
  - Used:
    - On **session creation** with pre‑session vitals.
    - On **session update** when post‑session vitals are added.
  - This ensures anomalies are always present in the `Session` document and automatically exposed in any API that returns sessions (including **today’s schedule**).

- **Error & State Handling**
  - All API calls surfaced in the UI have explicit `loading`, `error`, and `empty` pathways.
  - For “partial failures” (e.g. patient list fails, sessions load successfully), the failing panel shows an inline error while the rest of the UI remains usable.

