# Integrated Care UI Map (Web)

This document maps the integrated-care user interface structure in the web app.

## Enablement and Routing Gates

Integrated-care routes are gated in `src/routes.tsx`:

-   IC routes are only active when `institution.integratedCareEnabled` is true.
-   Login destinations map in `src/contexts/account-context.tsx`:
    -   `COBALT_PATIENT -> /`
    -   `IC_PANEL -> /ic/mhic`
    -   `IC_PATIENT -> /ic/patient`

## Route Tree (IC)

### `/ic/mhic`

Primary route modules:

-   `src/routes/ic/mhic/mhic-layout.tsx`
-   `src/routes/ic/mhic/my-panel.tsx`
-   `src/routes/ic/mhic/overview.tsx`
-   `src/routes/ic/mhic/my-patients.tsx`
-   `src/routes/ic/mhic/patient-orders.tsx`
-   `src/routes/ic/mhic/order-layout.tsx`
-   `src/routes/ic/mhic/order-assessment.tsx`
-   `src/routes/ic/mhic/reports.tsx`
-   `src/routes/ic/mhic/department-availability.tsx`
-   `src/routes/ic/mhic/care-resources.tsx`

Operationally, this is the MHIC cockpit for:

-   triage and prioritization
-   outreach and scheduled outreach
-   voicemail tasks
-   order notes
-   resource packet and safety-planning state
-   department availability and reporting

### `/ic/patient`

Primary route modules:

-   `src/routes/ic/patient/patient-layout.tsx`
-   `src/routes/ic/patient/patient-landing.tsx`
-   `src/routes/ic/patient/demographics-introduction.tsx`
-   `src/routes/ic/patient/patient-demographics.tsx`
-   `src/routes/ic/patient/demographics-thanks.tsx`
-   `src/routes/ic/patient/assessment-complete.tsx`
-   `src/routes/ic/patient/assessment-results.tsx`
-   `src/routes/ic/patient/patient-check-in.tsx`

This path supports the patient self-service workflow after referral creation.

## Service Layer

IC client methods are centralized in:

-   `src/lib/services/integrated-care-service.ts`

This file handles API orchestration for:

-   order retrieval and patching
-   notes/outreach/message scheduling
-   triage/consent/resourcing/safety updates
-   panel metrics and account assignments
-   Epic department/encounter utilities

## UI Component Clusters

IC-specific component library:

-   `src/components/integrated-care/mhic/`
-   `src/components/integrated-care/patient/`
-   `src/components/integrated-care/common/`

Most MHIC task actions are modal-driven and depend on IC service responses.

## Typical Change Paths

### Add MHIC action

1. Add/adjust route UI in `src/routes/ic/mhic/`.
2. Implement UI interaction in `src/components/integrated-care/mhic/`.
3. Add service method (or extend payload) in `integrated-care-service.ts`.
4. Update models in `src/lib/models/integrated-care-models.ts`.

### Add patient flow step

1. Add new route under `src/routes/ic/patient/` and wire path in `src/routes.tsx`.
2. Add supporting patient components.
3. Use existing service endpoints or add new typed service call.
4. Validate redirect behavior for `IC_PATIENT` login destination.

## Validation Checklist

-   `npm run dev` route load: `/ic/mhic` and `/ic/patient`.
-   MHIC list to shelf/detail navigation works.
-   Patient demographics and assessment routes still render.
-   TypeScript types compile for new service payloads/responses.
