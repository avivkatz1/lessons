# Multi-Bot Orchestration System
## Automated Workflow Management for Math Lessons Platform

**Version:** 2.0
**Last Updated:** February 16, 2026
**Status:** Active

---

## Overview

This document describes the multi-bot orchestration system for automated lesson development, bug fixing, and feature implementation. The system uses specialized AI bots that work together through defined workflows.

---

## Directory Structure

```
/frontends/lessons/
  /docs/
    /bots/                    Bot role definitions
      /core/                  Always-needed general-purpose bots
      /specialized/           Task-specific domain expert bots
      /meta/                  System management bots
    /guides/                  Active documentation for humans
    /archived/                Deprecated documentation (cleanup pending)

  /context/
    project.json              Project metadata (lightweight)
    /conversations/           Conversation lifecycle management
      active.json            Current ongoing conversations (<7 days)
      important.json         Flagged permanent conversations
      archived_YYYY-MM.json  Monthly archives (>7 days old)
      cleanup_queue.json     Pending deletion review
    /workflows/               Multi-stage workflow definitions
      create_lesson.json     Lesson creation workflow
      fix_bug.json           Bug fixing workflow
      add_feature.json       Feature implementation workflow
```

---

## Bot Roles

### Core Bots (Always Available)

**Architect** (`/docs/bots/core/architect.json`)
- System design and technical decisions
- Plans architecture and data models
- Provides technical guidance

**Engineer** (`/docs/bots/core/engineer.json`)
- Implements features and code
- Integrates new functionality
- Follows established patterns

**Project Manager** (`/docs/bots/core/project_manager.json`)
- Coordinates tasks and bots
- Manages priorities and deadlines
- Oversees project progress

**Tester** (`/docs/bots/core/tester.json`)
- Quality assurance and testing
- Verifies functionality and edge cases
- Catches regressions

**Documenter** (`/docs/bots/core/documenter.json`)
- Writes documentation
- Maintains guides and comments
- Prepares deployment docs

### Specialized Bots (Domain Experts)

**Lesson Developer** (`/docs/bots/specialized/lesson_developer.json`)
- Implements math lesson components
- Follows LESSON_DEVELOPMENT_CHECKLIST
- Ensures dark mode compatibility
- **Can spawn:** konva_specialist, dark_mode_specialist, geometry_specialist

**Dark Mode Specialist** (`/docs/bots/specialized/dark_mode_specialist.json`)
- Ensures perfect theme support
- Adds Konva canvas backgrounds
- Replaces hardcoded colors with theme tokens

**Geometry Specialist** (`/docs/bots/specialized/geometry_specialist.json`)
- Validates geometric accuracy
- Ensures angle indicators inside triangles
- Tests all 8 triangle orientations

**Konva Specialist** (`/docs/bots/specialized/konva_specialist.json`)
- Implements canvas visualizations
- Manages Stage/Layer architecture
- Ensures responsive canvas sizing

**Backend Specialist** (`/docs/bots/specialized/backend_specialist.json`)
- API and data structure implementation
- Server-side logic

**React Specialist** (`/docs/bots/specialized/react_specialist.json`)
- React patterns and best practices
- Component architecture

### Meta Bots (System Management)

**Orchestrator** (`/docs/bots/meta/orchestrator.json`)
- Coordinates multi-bot workflows
- Spawns appropriate bots for each stage
- Manages stage transitions

**Cleanup Bot** (`/docs/bots/meta/cleanup_bot.json`)
- Manages conversation lifecycle
- Weekly review of archived conversations
- Proposes deletions after consultation

**Knowledge Extractor** (`/docs/bots/meta/knowledge_extractor.json`)
- Identifies patterns in conversations
- Migrates knowledge to .md files
- Quarterly review of important conversations

---

## Workflows

### 1. Create Lesson Workflow

**Trigger:** User says "Create a lesson on [topic]"

**Workflow File:** `/context/workflows/create_lesson.json`

**Stages:**
1. **Planning & Design** (Architect)
   - Review similar lessons
   - Define data contract
   - Create implementation plan

2. **Backend Implementation** (Backend Specialist)
   - Create data generator
   - Implement validation
   - Generate test data

3. **Frontend Implementation** (Lesson Developer)
   - Build React component
   - Use standard patterns
   - Ensure dark mode compatibility
   - *May spawn:* Konva, Dark Mode, Geometry specialists

4. **Testing & QA** (Tester)
   - Test all scenarios
   - Verify dark mode
   - Test responsive design
   - Test edge cases

5. **Documentation** (Documenter)
   - Add code comments
   - Update indices
   - Prepare deployment

**Estimated Time:** 2-4 hours

### 2. Fix Bug Workflow

**Trigger:** User says "Fix bug [description]" or "Debug [issue]"

**Workflow File:** `/context/workflows/fix_bug.json`

**Stages:**
1. **Reproduce & Diagnose** (Bug Fixer)
   - Reproduce issue
   - Identify root cause
   - Determine affected files

2. **Implement Fix** (Engineer)
   - Minimal fix addressing root cause
   - Maintain existing patterns
   - Ensure dark mode compatibility

3. **Testing & Verification** (Tester)
   - Verify fix works
   - Check for regressions
   - Test in both themes

4. **Documentation** (Documenter)
   - Add comments
   - Update CHANGELOG
   - Prepare commit message

**Estimated Time:** 30 minutes - 2 hours

### 3. Add Feature Workflow

**Trigger:** User says "Add [feature]" or "Implement [functionality]"

**Workflow File:** `/context/workflows/add_feature.json`

**Stages:**
1. **Feature Design** (Architect)
   - Design architecture
   - Plan integration
   - Consider dark mode

2. **Backend Changes** (Backend Specialist) *[if needed]*
   - Update data models
   - Modify API endpoints

3. **Frontend Implementation** (Engineer)
   - Implement feature
   - Use theme tokens
   - Responsive design

4. **Testing & QA** (Tester)
   - Test feature thoroughly
   - Verify no regressions
   - Test responsive

5. **Documentation** (Documenter)
   - Document feature
   - Update guides
   - Prepare PR

**Estimated Time:** 1-6 hours

---

## Conversation Lifecycle

### Active Conversations (`active.json`)
- **Age:** < 7 days
- **Purpose:** Current ongoing work
- **Cleared:** When conversation concludes or after 7 days

### Important Conversations (`important.json`)
- **Age:** Permanent
- **Purpose:** Flagged valuable conversations
- **Review:** Quarterly by Knowledge Extractor

### Archived Conversations (`archived_YYYY-MM.json`)
- **Age:** > 7 days, < 3 months
- **Purpose:** Historical reference
- **Cleanup:** Reviewed for deletion after 3 months

### Cleanup Queue (`cleanup_queue.json`)
- **Purpose:** Conversations pending deletion
- **Process:** Weekly review by Cleanup Bot
- **Requires:** User approval for final deletion

---

## How to Use the System

### For Lesson Creation

```
User: "Create a lesson on finding the area of triangles"

System:
1. Orchestrator loads create_lesson.json workflow
2. Spawns Architect for Stage 1 (Planning)
3. Architect reviews existing lessons, creates plan
4. User approves plan
5. Spawns Backend Specialist for Stage 2
6. Backend creates data generator and test data
7. Spawns Lesson Developer for Stage 3
   - May spawn Geometry Specialist if needed
   - May spawn Konva Specialist for visualization
   - May spawn Dark Mode Specialist for theme checks
8. Spawns Tester for Stage 4
9. Spawns Documenter for Stage 5
10. Presents completed lesson for user review
```

### For Bug Fixes

```
User: "Debug the angle indicator issue in Tangent Lesson"

System:
1. Orchestrator loads fix_bug.json workflow
2. Spawns Bug Fixer for Stage 1
   - May spawn Geometry Specialist to understand issue
3. Bug Fixer identifies root cause
4. Spawns Engineer for Stage 2 (implement fix)
5. Spawns Tester for Stage 3 (verify fix)
6. Spawns Documenter for Stage 4
7. Presents fix for commit
```

### For Feature Requests

```
User: "Add a progress tracker to all lessons"

System:
1. Orchestrator loads add_feature.json workflow
2. Spawns Architect for planning
3. User approves approach
4. Spawns Backend Specialist if data changes needed
5. Spawns Engineer for implementation
   - May spawn React Specialist for best practices
6. Spawns Tester for QA
7. Spawns Documenter for docs
8. Presents feature for review
```

---

## Conversation Management

### Weekly Cleanup (Automated)

Every week, Cleanup Bot:
1. Scans `active.json` for conversations > 7 days old
2. Moves them to `archived_YYYY-MM.json`
3. Scans archived conversations > 3 months old
4. Adds them to `cleanup_queue.json`
5. Asks all bots: "Do you still need conversation X?"
6. Compiles deletion list
7. Presents to user for approval
8. Deletes approved conversations

### Quarterly Knowledge Extraction (Automated)

Every quarter, Knowledge Extractor:
1. Scans `important.json` for recurring patterns
2. Identifies valuable insights
3. Proposes updates to .md files in `/docs/guides/`
4. User approves changes
5. Migrates knowledge to documentation
6. Flags conversations as "extracted" (can be archived)

---

## Bot Decision Authority

Each bot has defined decision-making authority:

### Can Approve Autonomously
- Implementation details within their domain
- Styling choices (following theme system)
- Standard pattern usage

### Must Consult User
- Architectural changes
- New dependencies
- API modifications
- Breaking changes

---

## File Organization

### Project Context
- **Location:** `/context/project.json`
- **Contents:** Metadata, access tiers, file locations
- **Update Frequency:** Rarely (only on major changes)

### Bot Definitions
- **Location:** `/docs/bots/{core,specialized,meta}/`
- **Format:** Individual JSON files per bot
- **Update Frequency:** When roles change or new bots added

### Workflows
- **Location:** `/context/workflows/`
- **Format:** JSON with stages, bots, tasks
- **Update Frequency:** When processes improve

### Conversations
- **Location:** `/context/conversations/`
- **Lifecycle:** Active → Archived → Deleted (or Important)
- **Update Frequency:** Continuous (managed by Cleanup Bot)

---

## Getting Started

### 1. User Request
```
"Create a lesson on [topic]"
"Fix bug in [component]"
"Add [feature] to [area]"
```

### 2. Orchestrator Activates
- Matches request to workflow
- Loads workflow definition
- Begins Stage 1

### 3. Bots Execute Stages
- Each bot completes its stage
- Spawns specialists as needed
- Hands off to next stage

### 4. User Review
- Receives progress updates
- Approves stage transitions
- Reviews final output

### 5. Completion
- All stages complete
- Tests pass
- Documentation ready
- Ready for deployment

---

## Maintenance

### Adding a New Bot
1. Create JSON file in appropriate `/docs/bots/` subdirectory
2. Define personality, responsibilities, decision authority
3. Update relevant workflows to reference new bot

### Modifying a Workflow
1. Edit workflow JSON in `/context/workflows/`
2. Update stages, tasks, or success criteria
3. Test workflow with sample request

### Updating Documentation
1. Edit files in `/docs/guides/`
2. Remove outdated information
3. Add new patterns or learnings

---

## Best Practices

### For Bots
- ✅ Always check required documentation first
- ✅ Spawn specialists when expertise needed
- ✅ Test in BOTH light and dark modes
- ✅ Follow established patterns
- ❌ Don't skip stages or success criteria
- ❌ Don't make architectural changes without consultation

### For Users
- ✅ Provide clear, specific requests
- ✅ Review stage outputs before approval
- ✅ Flag important conversations for retention
- ✅ Approve cleanup bot deletions promptly
- ❌ Don't skip testing phases
- ❌ Don't rush complex workflows

---

## Troubleshooting

### Workflow Stuck
- Check success criteria for current stage
- Verify required inputs available
- Consult stage owner bot for blockers

### Bot Spawning Failed
- Verify bot definition exists
- Check bot's access tier permissions
- Review workflow's `can_spawn_bots` list

### Conversation Cleanup Issues
- Check `cleanup_queue.json` for pending reviews
- Manually flag important conversations
- Approve or reject deletion candidates

---

## Related Documentation

- **LESSON_DEVELOPMENT_CHECKLIST.md** - Lesson development guide
- **VISUAL_DESIGN_RULES.md** - Visual design standards
- **LESSON_TESTING_PROTOCOL.md** - Testing procedures
- **Individual Bot Definitions** - See `/docs/bots/` subdirectories
- **Workflow Definitions** - See `/context/workflows/`

---

## Version History

**2.0** (Feb 16, 2026)
- Complete restructure of context and conversation management
- Separated bot definitions into individual files
- Created formal workflow definitions
- Implemented conversation lifecycle system
- Added meta bots (Orchestrator, Cleanup, Knowledge Extractor)
- Organized documentation into guides

**1.0** (Feb 5, 2026)
- Initial multi-bot system
- Single context.json file
- Basic conversation tracking

---

**For Questions or Issues:**
- Review this document
- Check specific bot definitions
- Consult workflow JSON files
- Ask Project Manager bot for coordination
