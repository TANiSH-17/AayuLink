# Project Flowchart

```mermaid
flowchart TD
    %% Entry point
    A[LandingPage.jsx] --> B[PatientLookupPage.jsx]
    A --> C[ValidatorPage.jsx]

    %% Dashboard and main components
    B --> D[MedicalRecordCard.jsx]
    B --> E[EmergencyDetailModal.jsx]
    C --> F[OtpVerificationModal.jsx]
    A --> G[LeafletMap.jsx]

    %% App structure
    H[App.jsx / MainApp.jsx] --> A
    H --> B
    H --> C
    H --> G

    %% Backend connection
    H --> I[Backend Routes]
    I --> J[api.js]
    I --> K[auth.js]
    I --> L[otp.js]
    I --> M[prescription.js]
    I --> N[translator.js]
    I --> O[seedDB.js]

    %% Backend models
    J --> P[user.js]
    J --> Q[patient.js]
    J --> R[hospital.js]
    J --> S[medicalRecord.js]
    J --> T[Prescription.js]
    J --> U[Otp.js]
