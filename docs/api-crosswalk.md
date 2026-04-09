# Integrated Care Web-to-API Crosswalk

This is the web-side reference for which IC surfaces call which backend resources.

## Primary Client

-   `src/lib/services/integrated-care-service.ts`

## Route Surface to Service Method Map

| UI surface                         | Main route/component files                                                                                                                  | Key service methods                                                                                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MHIC panel queues                  | `src/routes/ic/mhic/overview.tsx`, `src/routes/ic/mhic/my-patients.tsx`, `src/routes/ic/mhic/patient-orders.tsx`                            | `getPatientOrders`, `getOverview`, `getPanelCounts`, `getPanelAccounts`, `autocompletePatientOrders`                                                       |
| MHIC order shelf/detail            | `src/routes/ic/mhic/patient-order-shelf.tsx`, `src/routes/ic/mhic/order-layout.tsx`                                                         | `getPatientOrder`, `patchPatientOrder`, `getClinicalReport`, `getAssessmentAnswerReportDownloadUrl`, `setEncounterCsn`, `overrideSchedulingEpicDepartment` |
| MHIC triage/resourcing/safety      | MHIC modals/components under `src/components/integrated-care/mhic/`                                                                         | `overrideTriage`, `revertTriage`, `updateResourcingStatus`, `updateSafetyPlanningStatus`, `updatePatientOrderResourceCheckInResponseStatusId`              |
| MHIC notes/outreach/messages/tasks | MHIC modals/components under `src/components/integrated-care/mhic/`                                                                         | `postNote`, `updateNote`, `deleteNote`, `postPatientOrderOutreach`, `createScheduledOutreach`, `sendMessage`, `createVoicemailTask`                        |
| MHIC admin/reporting helpers       | `src/routes/ic/mhic/department-availability.tsx`, `src/routes/ic/mhic/reports.tsx`                                                          | `getEpicDepartments`, `setEpicDepartmentAvailabilityStatus`, `getReferenceData`, `getPatientOrderClosureReasons`                                           |
| Patient IC landing and intake      | `src/routes/ic/patient/patient-landing.tsx`, `src/routes/ic/patient/patient-demographics.tsx`, `src/routes/ic/patient/patient-check-in.tsx` | `getOpenOrderForCurrentPatient`, `patchPatientOrder`, `updatePatientOrderConsentStatus`, `getLatestPatientOrder`                                           |
| Patient assessment workflow        | `src/routes/ic/patient/assessment-results.tsx`, `src/routes/ic/patient/assessment-complete.tsx`                                             | `getPatientOrder`, `scheduleAssessment`, `updateScheduledAssessment`, `deleteScheduledAssessment`                                                          |

## Backend Resource Target

Most methods above map to endpoints implemented in:

-   `../cobalt-api-mirror-codex/src/main/java/com/cobaltplatform/api/web/resource/PatientOrderResource.java`

## Known Naming Footguns

Existing method names include typos but are in active use:

-   `getEcounters`
-   `cancelScheduledOutreaach`
-   `completeScheduledOutreaach`

Avoid "fixing" names without coordinated refactors across all call sites.
