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

## Research workspace

The repository now includes a local research workspace for structured, de-identified record keeping. It stores a study ID, protocol version, participant code, visit type, self-reported measures, session duration/type, protocol note, software version, and timestamps. It can export a long-format CSV and show descriptive baseline-to-latest intensity changes.

This is a data-management and prototyping feature only. It does not establish treatment efficacy, diagnostic validity, or clinical safety.

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


### Audiological baseline module
The research workspace now supports an optional, de-identified audiological baseline record. Fields include tinnitus laterality/duration/character, PTA by ear, speech score by ear, tympanometry type by ear, OAE/ABR status, hearing-aid use, assessment source, and a protocol note. These fields are descriptive data capture only; the application does not interpret them as a diagnosis or claim treatment efficacy.
