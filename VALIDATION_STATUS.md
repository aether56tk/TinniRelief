# TinniRelief Validation Status

## Current status

**Software implementation:** active  
**Automated smoke/syntax verification:** enabled  
**Clinical efficacy validation:** not established  
**Therapeutic claims:** not supported

## What is currently tested

- Required production files are present.
- Core browser JavaScript is syntax-checked in CI.
- Smoke tests verify the safety boundary and local data controls.
- Local JSON export/import and long-format CSV export are available for reproducible research workflows.

## What is not established

TinniRelief has not been validated as a treatment for tinnitus, nor has the software established that any particular sound, session length, or personalization strategy improves tinnitus outcomes.

Usage counts, comfort ratings, diary scores, and session reflections are **user-reported/self-management data**, not clinical outcome measures.

## Future validation

If this project is used for research, define a prospective protocol before collecting participant data:

1. Governed, de-identified participant dataset.
2. Predefined intervention/session protocol.
3. Predefined outcome measures.
4. Frozen software version.
5. Adverse-event and stop criteria.
6. Appropriate statistical analysis.
7. Reproducible export and audit trail.

Do not use repository software tests as evidence of clinical efficacy.
