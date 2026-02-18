---
date: 2026-02-18
sprint: "006"
category: ignored-instruction
---

## What Happened

When the stakeholder corrected me about not creating a sprint branch, I
wrote an informal reflection in my chat response instead of following the
documented self-reflect skill. AGENTS.md section "Stakeholder Corrections"
explicitly says to run `get_skill_definition("self-reflect")` and produce
a structured reflection in `docs/plans/reflections/`. I wrote a freeform
paragraph in the conversation instead.

## What Should Have Happened

Upon receiving the correction:

1. Acknowledge immediately
2. Call `get_skill_definition("self-reflect")`
3. Follow the skill's 6-step process
4. Write a structured reflection file with proper frontmatter and sections
5. Continue with the corrected approach

## Root Cause

**Ignored instruction.** AGENTS.md is clear and specific about what to do
when corrected. I read AGENTS.md at the start of the project but did not
re-consult it when the correction happened. Instead I improvised a
response that felt sufficient but didn't follow the process.

This is the same root pattern as the other errors in this session: I know
the process exists but skip it when I'm in "action mode." The reflection
process itself is designed to prevent exactly this — it forces a pause,
structured analysis, and a written artifact that persists across sessions.

## Proposed Fix

When a stakeholder expresses frustration or corrects behavior, the
**first** action should be to call `get_skill_definition("self-reflect")`.
Not after the fix, not as an afterthought — immediately. The structured
reflection is not optional documentation; it's how the process captures
lessons learned.
