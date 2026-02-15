# Reflection: Sprint Close Leaves Orphan Directories

**Date:** 2026-02-15
**Trigger:** Stakeholder pointed out Sprint 001 directory still exists in
`sprints/` despite being "closed." This is a recurring issue across multiple
sprint closures.

## What Happened

When closing sprints (001, and previously 007 and 002 in the old sprint
structure), I called the CLASI `close_sprint` tool and then committed the
result. Every time, the commit only contained **additions** to `sprints/done/`
— the original sprint directory was never removed.

Evidence from `git show --diff-filter=D` on all three close commits:
- `5dee47d` (Sprint 001 new): 0 deletions
- `a1646ff` (Sprint 007 old): 0 deletions
- `8112844` (Sprint 002 old): likely same pattern

## Root Cause

The CLASI `close_sprint` tool **copies** the directory to `done/` and updates
the database phase to "done", but it does not delete the original directory.
I treated the tool as a complete close operation and never verified the
filesystem state afterward.

The deeper issue: **I trusted the tool output without verifying the actual
result.** After calling `close_sprint`, I should have:
1. Checked that the original directory was gone
2. If not, removed it manually
3. Verified with `ls` before committing

## Pattern

This is a "fire and forget" anti-pattern. I call a tool, see a success
response, assume the job is done, and move on to the next step. The CLASI
tool did what it was designed to do (DB update + copy), but the full close
workflow requires an additional step (removing the original) that I need to
handle myself.

## Wrong Corrective Instinct

My first instinct was to add a manual `git rm -r` step after every
`close_sprint` call — silently cleaning up after the tool. The stakeholder
correctly pointed out that this is wrong. If the tool doesn't move the
directory, that's a bug in the tool (or in how I'm invoking it). Silently
working around it:
- Hides the real problem
- Guarantees it will bite again in a new context
- Means the tool never gets fixed

## Actual Corrective Actions

1. **Immediate fix:** Clean up the orphan directory this one time (done).
2. **Process fix:** After `close_sprint`, verify the original directory is
   gone. If it's still there, **stop and flag it to the stakeholder** so we
   can investigate why the tool isn't working correctly. Do NOT silently
   `git rm` it.
3. **Investigate:** File a TODO or issue to understand why `close_sprint`
   copies instead of moves, and fix the tool itself.
