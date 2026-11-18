# Review of the team setup, round 1

Reviewer: reviewer.london-billboard@AgentiCCells.dinis, a sub-agent of conductor.london-billboard@AgentiCCells.dinis, 2026-11-18 about 18:08 UTC.
Scope: the files committed at HEAD bd42115 and HEAD~1 be3a978 on branch dev: `team/BRIEF.md`, `team/WORKFLOW.md`, `team/scopes.json`, `team/rounds/1.md`, the six `team/<role>/ROLE.md` and `POLICY.md`, `scripts/abp-check.mjs`, `scripts/role-scope.mjs` (and `REALITY.md`, `scripts/release.sh`, `.github/workflows/pages.yml` at HEAD, read to check claims). Uncommitted files in `src/`, `scripts/`, `tests/` and `.github/` were not reviewed.

Verdict: pass

The setup passes with notes. Findings 1 to 3 should be fixed in this round, before the first release; they are text edits or a gate the policies already promise. Findings 4 to 9 are notes.

## Checks run

- `node scripts/abp-check.mjs` (run 2026-11-18 about 18:06 UTC):
  ```
  team/analyst/POLICY.md: analyst.london-billboard@AgentiCCells.dinis 0.1.0 proposal, observe; 23 rules: boundary 0, setting 10, expectation 13, nothing 0
  team/conductor/POLICY.md: conductor.london-billboard@AgentiCCells.dinis 0.1.0 proposal, mixed; 23 rules: boundary 1, setting 6, expectation 16, nothing 0
  team/designer/POLICY.md: designer.london-billboard@AgentiCCells.dinis 0.1.0 proposal, observe; 21 rules: boundary 0, setting 7, expectation 14, nothing 0
  team/developer/POLICY.md: developer.london-billboard@AgentiCCells.dinis 0.1.0 proposal, observe; 25 rules: boundary 0, setting 8, expectation 17, nothing 0
  team/reviewer/POLICY.md: reviewer.london-billboard@AgentiCCells.dinis 0.1.0 proposal, observe; 26 rules: boundary 0, setting 7, expectation 19, nothing 0
  team/writer/POLICY.md: writer.london-billboard@AgentiCCells.dinis 0.1.0 proposal, observe; 23 rules: boundary 0, setting 7, expectation 16, nothing 0
  OK (6 policies)
  ```
- `node scripts/role-scope.mjs`: `OK (1 commit(s) checked against team/scopes.json)`.
- Names: all six roles are `<role>.london-billboard@AgentiCCells.dinis` in ROLE.md, POLICY.md, WORKFLOW.md and the policy data. Pass.
- Dinis's words: every quotation in WORKFLOW.md and the six policies matches `team/BRIEF.md` character for character, with its time (checked by script). The policies quote the 16:10, 17:45 and 18:00 words and leave out the 17:30 words; what they quote is exact. Pass.
- `team/scopes.json` against the team table in `team/WORKFLOW.md` lines 19 to 26: the same six roles and the same globs for each. Pass.
- Rules from CLAUDE.md and the brief, each found in the setup: simulation band word for word (rounds/1.md line 12, WORKFLOW.md line 46); London simulated; Porto, Braga and Lisbon live from IPMA with station and distance; cameras only through live.promptugal.news, drawn scene labelled; flights, prices and travel times "invented example"; scripted assistant labelled; white paper figures with a primary source or "source unconfirmed"; no organisation named as involved; no person named but Dinis Cruz, credited; IPMA named, no profit-making use; five full rounds; reviewer passes the setup (WORKFLOW.md line 41); only the conductor pushes, through release.sh; `Agent:` trailer on every commit (both commits carry `Agent: conductor.london-billboard@AgentiCCells.dinis`); `board/HOLD.md` (absent; release.sh line 7 and pages.yml line 30 refuse while it exists, as the policies claim). Pass.
- Em dashes (U+2014): none in the files in scope. Hype words: none (the word "nice" appears only inside Dinis's quotation). No American spellings found. Pass.
- Nothing invented that a reader could take for real: the setup describes the site as a simulation throughout and REALITY.md lists what is not yet true. Pass.

## Findings

1. **`team/WORKFLOW.md`, "The loop", lines 32 to 35: the loop has no step where the design proposal is reviewed.** The team table (line 26), `team/reviewer/ROLE.md` line 3, `team/designer/ROLE.md` line 11 ("to the reviewer, then to the developer and writer once passed") and `team/developer/ROLE.md` lines 3 and 5 ("Build what passed review", "The passed proposal") all assume one, but step 3 has the developer build the proposal straight after step 2, and step 4 reviews only the build. Fix: add to step 2, or as a step between 2 and 3: "The reviewer checks `PROPOSAL.md` and the mock-ups in `team/rounds/N/review/`; the developer and writer start only on what passed." Fix before release.

2. **`team/WORKFLOW.md`, step 5 (line 36), against CLAUDE.md "Releases": a release needs "the wording check clean" and "a commit signed by the releasing agent".** The setup never says which script is the wording check, and no signing key exists (REALITY.md; gap G2 in every policy), so no release can meet the signing rule as written. The setup records the missing key but not that the release rule is therefore unmet. Fix: in step 5, name the wording check (the em dash and hype word checks in `scripts/validate.mjs`, if that is what it is) and add: "Commits are unsigned until a key is given (REALITY.md); each release says so, and the round report lists it under what Dinis must decide." The conductor asks Dinis whether unsigned releases may go ahead. Fix before release.

3. **G4 in all six policies, and `team/WORKFLOW.md` line 36: `scripts/release.sh` and `.github/workflows/pages.yml` at HEAD do not run `role-scope.mjs` or `abp-check.mjs`** (release.sh lines 10 to 13; pages.yml lines 53 to 59). Every policy says the conductor adds them "before the first release", while WORKFLOW.md says only "once the conductor wires them in". Until then the scope and policy rules marked "setting" hold only when run by hand. Fix: wire both into release.sh and the Pages workflow before the first release (both files have uncommitted changes in the working tree, which this review did not read), and make WORKFLOW.md line 36 say the same as the policies. Fix before release.

4. **`team/rounds/1.md`, "Data", lines 15 to 17, and `team/WORKFLOW.md` line 47: only IPMA's terms are stated, but the Algarve files hold another source.** `https://data.promptugal.news/api/v1/by-place/now/faro.json` (fetched 2026-11-18 about 18:08 UTC; its `read_at` 2026-11-18T17:56:50Z) says it carries adsb.lol counts for Faro under ODbL 1.0 (share-alike, attribution). The setup labels every flight an "invented example"; real aircraft counts on the same screen could be confused with the invented flights, or used without ODbL's attribution. Fix: in rounds/1.md add "every source's terms from its card (IPMA: named, no profit-making use; adsb.lol: ODbL 1.0, named)", and have the analyst say whether the adsb.lol counts are shown; if they are, label them "live" with source and keep them apart from the invented flights. The band's "The Algarve weather is real, read live from IPMA" stays accurate for the weather values. Note.

5. **Allowed hosts differ between files.** `team/developer/POLICY.md` N13 allows live.promptugal.news once it offers cameras; `team/reviewer/ROLE.md` line 11, `team/reviewer/POLICY.md` N20 and `team/WORKFLOW.md` line 35 allow only data.promptugal.news and the site itself. Fix: add "(and live.promptugal.news once it offers cameras)" to the three reviewer-side texts, so a camera build is not failed for following the brief. Note.

6. **`team/scopes.json` lines 9 and 10 give the developer and the writer `src/**`, which covers the analyst's `src/data/` and the designer's `src/d/`.** The analyst, designer and developer policies record this as G5. `team/writer/ROLE.md` line 7 and the writer's G5 mention only `src/data/` and say nothing on who writes the words inside the five designs in `src/d/`. Fix: say in the writer's ROLE.md and policy whether the writer writes text in `src/d/` (with the designer's agreement) or not at all. Note.

7. **`team/BRIEF.md` line 10 (copied into WORKFLOW.md line 11 and each policy's "given"): the 18:00 UTC words are "relayed ... at 17:55 UTC (session clock)", so they read as relayed before they were said.** Fix: add a few words, for example "about 18:00 UTC by the cells@AgentiCCells.dinis clock; received here at 17:55 UTC by this session's clock, which differs". Note.

8. **`scripts/abp-check.mjs` lines 7 to 9 and `scripts/role-scope.mjs` line 7: the provenance names the repository `AgentiCCells__Site__Marc-Noah` and the agent `conductor.marc-noah@AgentiCCells.dinis`, which may be a person's name.** CLAUDE.md says never name a person who has not agreed to be named, and the brief says name no person but Dinis Cruz. These files are not published on the site, and recording where code came from is also a CLAUDE.md rule. Also, in abp-check.mjs the sentence on line 7 ends "from" and carries on at line 9, with line 8 inserted between. Fix: ask Dinis whether the repository name may stay; if not, write "another AgentiCCells site repository" for that hop. Put line 8 after line 10 so each sentence reads whole. Note.

9. **`team/conductor/POLICY.md` C4 (`publish.site.project`, tier 4, decision "draft").** "Draft" means a person acts, but WORKFLOW.md step 5 has the conductor deploy by running release.sh, with no step for a person. Fix: either add a person's step (Dinis approves each release) or describe the release as it is (for example tier 3, "plan-apply", release.sh and the Pages workflow as what applies it, Dinis able to reverse) and record the gap. Note.
