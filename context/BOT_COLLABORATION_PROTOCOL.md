# Bot Collaboration Protocol - Multi-Cycle Review System

**Version:** 1.0
**Created:** February 28, 2026
**Status:** Active
**Integrates With:** MULTI_BOT_SYSTEM.md, MASTER_BOT_CONVERSATIONS.md

---

## Overview

This protocol enables **iterative multi-cycle collaboration** between bots, where bots can review each other's work, provide feedback, and iterate until consensus is reached.

### Current System (Linear)
```
Architect → Backend → Engineer → Tester → Documenter
   ↓           ↓          ↓         ↓          ↓
 Done       Done       Done      Done       Done
```

### Enhanced System (Iterative)
```
Cycle 1:
  Architect → Backend → Engineer → Tester → Documenter
     ↓          ↓          ↓         ↓          ↓
   Draft    Draft     Draft    Review    Review

Cycle 2: (Feedback Loop)
  Architect ← Backend ← Engineer ← Tester ← Documenter
     ↓          ↓          ↓         ↓          ↓
  Refine    Refine    Refine   Approve   Approve

Cycle 3: (if needed)
  [Continue until all bots approve]

Convergence:
  All bots mark status = "approved" → Workflow complete
```

---

## Communication Structure

### Stage Communication File
Each stage creates a JSON file for inter-bot communication:

**Location:** `/context/conversations/stages/{workflow_id}/stage_{N}_communication.json`

**Example:** `/context/conversations/stages/adding_fractions_rework/stage_1_communication.json`

```json
{
  "stage": 1,
  "stage_name": "Planning & Design",
  "workflow_id": "adding_fractions_rework",
  "cycle": 2,
  "status": "in_review",
  "primary_bot": "architect",
  "participating_bots": ["architect", "backend_specialist", "lesson_developer"],
  "cycles": [
    {
      "cycle_number": 1,
      "timestamp": "2026-02-28T09:00:00Z",
      "posts": [
        {
          "id": "arch_001",
          "from": "architect",
          "to": ["all"],
          "type": "proposal",
          "timestamp": "2026-02-28T09:05:00Z",
          "content": "Proposing InputOverlayPanel with fraction-specific keypad. Will need numerator/denominator split input.",
          "references": {
            "sections": ["lesson_developer.fraction_visuals"],
            "files": ["src/shared/components/SlimMathKeypad.js"]
          },
          "status": "pending_review"
        },
        {
          "id": "backend_001",
          "from": "backend_specialist",
          "to": ["architect"],
          "type": "feedback",
          "in_reply_to": "arch_001",
          "timestamp": "2026-02-28T09:10:00Z",
          "content": "⚠️ Current backend sends fractions as single string '3/4'. Split input would require backend changes. Suggest: parse '3/4' in frontend OR update backend to send {numerator: 3, denominator: 4}",
          "tags": ["needs_decision", "backend_impact"],
          "options": [
            {
              "id": "opt_a",
              "title": "Frontend parsing (no backend change)",
              "pros": ["No backend work", "Faster implementation"],
              "cons": ["Harder validation", "Format coupling"]
            },
            {
              "id": "opt_b",
              "title": "Backend structured data",
              "pros": ["Type-safe", "Better validation"],
              "cons": ["Backend migration needed", "+2 hours work"]
            }
          ],
          "recommendation": "opt_a"
        },
        {
          "id": "arch_002",
          "from": "architect",
          "to": ["backend_specialist"],
          "type": "response",
          "in_reply_to": "backend_001",
          "timestamp": "2026-02-28T09:15:00Z",
          "content": "✅ Agree with opt_a (frontend parsing). Updated plan: SlimMathKeypad accepts '3/4' format, validates with regex /^\d+\/\d+$/",
          "decision": "opt_a",
          "updates": {
            "plan_section": "input_handling",
            "change": "Added fraction parsing utility function"
          },
          "status": "resolved"
        },
        {
          "id": "lesson_dev_001",
          "from": "lesson_developer",
          "to": ["architect", "backend_specialist"],
          "type": "suggestion",
          "timestamp": "2026-02-28T09:20:00Z",
          "content": "💡 I built similar pattern in SubtractingIntegers. Check DEVELOPMENT_LOG.md section on SlimMathKeypad integration. Can reuse that pattern.",
          "references": {
            "files": ["DEVELOPMENT_LOG.md#slimmathkeypad-integration"],
            "code_examples": ["src/features/lessons/lessonTypes/algebra/SubtractingIntegersLesson.jsx:399-403"]
          },
          "helpful": true,
          "tags": ["pattern_reuse"]
        },
        {
          "id": "arch_003",
          "from": "architect",
          "to": ["all"],
          "type": "cycle_summary",
          "timestamp": "2026-02-28T09:25:00Z",
          "content": "Cycle 1 complete. Decisions made: Frontend fraction parsing (3/4 format). Pattern identified: Reuse SubtractingIntegers InputOverlay approach. Ready for Cycle 2 review.",
          "decisions": ["frontend_parsing", "pattern_reuse"],
          "pending_items": [],
          "ready_for_next_cycle": true
        }
      ]
    },
    {
      "cycle_number": 2,
      "timestamp": "2026-02-28T09:30:00Z",
      "posts": [
        {
          "id": "tester_001",
          "from": "tester",
          "to": ["architect"],
          "type": "review",
          "timestamp": "2026-02-28T09:35:00Z",
          "content": "🔍 Reviewed plan. Question: How do we handle improper fractions (5/3)? Should we validate denominator > numerator or allow any valid fraction?",
          "tags": ["needs_clarification", "validation"],
          "status": "pending_response"
        },
        {
          "id": "arch_004",
          "from": "architect",
          "to": ["tester"],
          "type": "response",
          "in_reply_to": "tester_001",
          "timestamp": "2026-02-28T09:40:00Z",
          "content": "✅ Allow all valid fractions (improper OK). Validation: denominator !== 0, both integers. Added to plan.",
          "updates": {
            "plan_section": "validation_rules",
            "change": "Added improper fraction support"
          },
          "status": "resolved"
        },
        {
          "id": "backend_002",
          "from": "backend_specialist",
          "to": ["all"],
          "type": "approval",
          "timestamp": "2026-02-28T09:45:00Z",
          "content": "✅ Approved plan. No backend changes needed. Frontend parsing approach is solid.",
          "status": "approved",
          "ready_to_proceed": true
        },
        {
          "id": "lesson_dev_002",
          "from": "lesson_developer",
          "to": ["all"],
          "type": "approval",
          "timestamp": "2026-02-28T09:50:00Z",
          "content": "✅ Approved. Plan is clear and follows established patterns. Ready to implement.",
          "status": "approved",
          "ready_to_proceed": true
        },
        {
          "id": "arch_005",
          "from": "architect",
          "to": ["all"],
          "type": "cycle_summary",
          "timestamp": "2026-02-28T09:55:00Z",
          "content": "Cycle 2 complete. All bots approved. Validation rules clarified. Proceeding to Stage 2.",
          "convergence": true,
          "all_approved": true,
          "proceed_to_next_stage": true
        }
      ]
    }
  ],
  "final_status": "approved",
  "total_cycles": 2,
  "convergence_reached": true
}
```

---

## Convergence Criteria

A stage converges (moves to next stage) when **ALL** of the following are true:

### 1. **Approval Threshold Met**
```javascript
// All participating bots must approve
const allApproved = participatingBots.every(bot =>
  bot.status === "approved"
);
```

### 2. **No Pending Items**
```javascript
// No unresolved questions/blockers
const noPendingItems = currentCycle.posts.every(post =>
  post.status !== "pending_response" &&
  post.tags?.includes("needs_decision") === false
);
```

### 3. **Maximum Cycles Not Exceeded**
```javascript
// Safety limit: max 5 cycles per stage
const withinCycleLimit = currentCycleNumber <= 5;
```

### 4. **Convergence Vote**
```javascript
// Majority vote for convergence
const convergenceVotes = participatingBots.filter(bot =>
  bot.ready_to_proceed === true
);
const hasConvergence = convergenceVotes.length >= (participatingBots.length * 0.66);
```

---

## Message Types

### 1. **Proposal** (Cycle 1, primary bot)
```json
{
  "type": "proposal",
  "from": "architect",
  "content": "Proposing X approach...",
  "status": "pending_review"
}
```

### 2. **Feedback** (Cycle 1+, any bot)
```json
{
  "type": "feedback",
  "from": "backend_specialist",
  "in_reply_to": "arch_001",
  "content": "⚠️ Concern about X...",
  "tags": ["needs_decision"],
  "options": [{"id": "opt_a", "title": "..."}]
}
```

### 3. **Response** (Cycle 2+, addressing feedback)
```json
{
  "type": "response",
  "from": "architect",
  "in_reply_to": "backend_001",
  "content": "✅ Updated plan to address concern",
  "decision": "opt_a",
  "updates": {"plan_section": "...", "change": "..."},
  "status": "resolved"
}
```

### 4. **Suggestion** (Any cycle, collaborative)
```json
{
  "type": "suggestion",
  "from": "lesson_developer",
  "content": "💡 Pattern from X could help",
  "references": {"sections": ["..."], "files": ["..."]},
  "helpful": true
}
```

### 5. **Review** (Cycle 2+, quality check)
```json
{
  "type": "review",
  "from": "tester",
  "content": "🔍 Question about edge case X",
  "tags": ["needs_clarification"],
  "status": "pending_response"
}
```

### 6. **Approval** (Final cycle, convergence)
```json
{
  "type": "approval",
  "from": "backend_specialist",
  "content": "✅ Approved plan",
  "status": "approved",
  "ready_to_proceed": true
}
```

### 7. **Cycle Summary** (End of each cycle)
```json
{
  "type": "cycle_summary",
  "from": "architect",
  "content": "Cycle N complete. Summary...",
  "decisions": ["..."],
  "pending_items": [],
  "ready_for_next_cycle": true,
  "convergence": false
}
```

---

## Workflow Integration

### Updated MULTI_BOT_SYSTEM.md Stage Execution

**Before (Linear):**
```
Stage 1: Architect completes → proceeds to Stage 2
```

**After (Iterative):**
```
Stage 1:
  Cycle 1:
    - Architect posts proposal
    - Other bots read and provide feedback
    - Architect responds to feedback

  Cycle 2:
    - All bots review responses
    - Bots approve or request changes
    - If all approve → convergence

  [Repeat until convergence or max cycles]

  → Proceed to Stage 2
```

### Cycle Transition Logic

```javascript
function shouldStartNextCycle(stage) {
  const currentCycle = stage.cycles[stage.cycles.length - 1];

  // Check if any bot has pending feedback
  const hasPendingFeedback = currentCycle.posts.some(post =>
    post.status === "pending_response" ||
    post.tags?.includes("needs_decision")
  );

  // Check if primary bot has responded to all feedback
  const allFeedbackAddressed = currentCycle.posts
    .filter(p => p.type === "feedback")
    .every(feedback =>
      currentCycle.posts.some(response =>
        response.in_reply_to === feedback.id &&
        response.status === "resolved"
      )
    );

  // Decision tree
  if (hasPendingFeedback && !allFeedbackAddressed) {
    return "continue_cycle"; // Wait for responses
  }

  if (allFeedbackAddressed && !allBotsApproved(stage)) {
    return "start_next_cycle"; // Next cycle for reviews/approvals
  }

  if (allBotsApproved(stage)) {
    return "converged"; // Move to next stage
  }

  if (stage.cycles.length >= 5) {
    return "max_cycles_exceeded"; // Escalate to user
  }
}
```

---

## Example: Multi-Cycle Workflow

### Scenario: Adding Fractions Rework - Stage 1 (Planning)

#### **Cycle 1: Initial Proposals & Feedback**

**9:00 AM** - Architect posts proposal
```markdown
**PROPOSAL:**
Modernize Adding Fractions with:
1. InputOverlayPanel (like SubtractingIntegers)
2. SlimMathKeypad with "/" button
3. Visual fraction bars (canvas animation)
4. Split numerator/denominator input
```

**9:10 AM** - Backend Specialist provides feedback
```markdown
**FEEDBACK:** ⚠️
Current backend sends: "3/4" (string)
Proposal needs: {numerator: 3, denominator: 4} (object)

Options:
A. Frontend parsing (no backend change)
B. Update backend structure (+2 hours)

Recommendation: A
```

**9:15 AM** - Lesson Developer suggests pattern
```markdown
**SUGGESTION:** 💡
SubtractingIntegers uses single-value input with validation.
Could parse "3/4" on frontend with regex: /^(\d+)\/(\d+)$/

Reference: DEVELOPMENT_LOG.md, line 245
```

**9:20 AM** - Architect responds
```markdown
**RESPONSE:** ✅
Updated plan: Frontend parsing approach
- Accept "3/4" format in SlimMathKeypad
- Parse with regex
- Validate: denominator !== 0

Decision: Backend unchanged
```

**9:25 AM** - Cycle 1 Summary
```markdown
**CYCLE 1 SUMMARY:**
Decisions made: Frontend parsing
Patterns reused: InputOverlayPanel, validation
Pending: None
Ready for Cycle 2: Yes
```

#### **Cycle 2: Reviews & Approvals**

**9:30 AM** - Tester reviews plan
```markdown
**REVIEW:** 🔍
Question: Improper fractions (5/3)?
Should we validate denominator > numerator?
```

**9:35 AM** - Architect clarifies
```markdown
**RESPONSE:** ✅
Allow all valid fractions (improper OK)
Validation: denominator !== 0, both integers
Updated plan section: "Validation Rules"
```

**9:40 AM** - Konva Specialist (spawned) reviews
```markdown
**REVIEW:** 🔍
Fraction bar animation:
- Need canvas width for proper scaling
- Suggest: Calculate bar width = (canvasWidth - 100) / numBars

Reference: konva_specialist.responsive_sizing pattern
```

**9:45 AM** - Architect incorporates
```markdown
**RESPONSE:** ✅
Added responsive fraction bar sizing
Using pattern from konva_specialist.responsive_sizing ⭐ 4
```

**9:50 AM** - All bots approve
```markdown
Backend Specialist: ✅ Approved
Lesson Developer: ✅ Approved
Tester: ✅ Approved
Konva Specialist: ✅ Approved
```

**9:55 AM** - Cycle 2 Summary & Convergence
```markdown
**CYCLE 2 SUMMARY:**
All bots approved: Yes
Pending items: 0
Total cycles: 2
CONVERGENCE REACHED ✅

Proceeding to Stage 2 (Backend Implementation)
```

---

## Bot Behavior Rules

### 1. **Reading Cycles**
Each bot MUST read all posts from previous cycles before posting:

```javascript
// Before posting, bot reads:
const previousCycles = stage.cycles.slice(0, -1);
const currentCycle = stage.cycles[stage.cycles.length - 1];

// Check for mentions
const mentionedInPosts = currentCycle.posts.filter(post =>
  post.to.includes(myBotRole) ||
  post.tags?.includes(`@${myBotRole}`)
);

// Check for questions needing response
const questionsForMe = currentCycle.posts.filter(post =>
  post.status === "pending_response" &&
  (post.to.includes(myBotRole) || post.to.includes("all"))
);
```

### 2. **Response Obligation**
Bots MUST respond to:
- Direct questions (`to: [myBotRole]`)
- Tagged mentions (`@myBotRole`)
- Posts affecting their domain (`tags: ["backend_impact"]` → Backend Specialist must respond)

### 3. **Approval Timing**
Bots can only post approval AFTER:
- All feedback from Cycle 1 has been addressed
- All their concerns are resolved
- Plan is finalized

### 4. **Escalation**
If convergence fails after 5 cycles:
```markdown
**ESCALATION:**
Stage 1 failed to converge after 5 cycles.
Unresolved issues:
- [List pending items]

Requesting user decision:
[Options for user to choose]
```

---

## Integration with Existing System

### 1. **Update MULTI_BOT_SYSTEM.md**

Add to each workflow stage:

```markdown
**Stage Execution Mode:** Iterative (Multi-Cycle)
**Communication:** `/context/conversations/stages/{workflow_id}/stage_{N}_communication.json`
**Convergence Criteria:** All bots approved + no pending items
**Max Cycles:** 5 per stage
```

### 2. **Update MASTER_BOT_CONVERSATIONS.md**

Add section for each bot:

```markdown
## How to Participate in Multi-Cycle Collaboration

1. **Cycle 1** (Initial Pass):
   - Read proposal from primary bot
   - Provide feedback on concerns/questions
   - Suggest patterns from MASTER_BOT_CONVERSATIONS

2. **Cycle 2+** (Iterative):
   - Review responses to your feedback
   - Approve if satisfied OR request changes
   - Mark ready_to_proceed when approved

3. **Convergence**:
   - All bots approved → Stage complete
   - Unresolved after 5 cycles → Escalate to user
```

### 3. **Rating Integration**

When bot uses another bot's suggestion:

```json
{
  "type": "suggestion",
  "from": "lesson_developer",
  "content": "Pattern from X...",
  "references": {"sections": ["backend_specialist.generator_pattern"]},
  "auto_rate": {
    "section": "backend_specialist.generator_pattern",
    "reason": "Solved frontend parsing issue",
    "helpful": true
  }
}
```

This auto-generates a +1 rating in `bot_ratings.json`.

---

## Benefits

### 1. **Higher Quality Decisions**
- Multiple perspectives before finalizing
- Edge cases caught early
- Domain experts can veto bad approaches

### 2. **Knowledge Sharing**
- Bots learn from each other's feedback
- Patterns are validated by multiple bots
- Cross-domain insights emerge

### 3. **Reduced Rework**
- Catch issues before implementation
- Prevents "I wish I had known X earlier"
- Saves time in long run

### 4. **Transparent Process**
- All decisions documented
- Rationale captured
- Easy to review later

### 5. **Automatic Ratings**
- Helpful patterns get +1 automatically
- Most useful sections rise to top
- Knowledge compounds faster

---

## Implementation Checklist

To activate multi-cycle collaboration:

- [ ] Create `/context/conversations/stages/` directory
- [ ] Update MULTI_BOT_SYSTEM.md with iterative mode
- [ ] Add convergence logic to orchestrator
- [ ] Implement stage communication JSON schema
- [ ] Update each bot's instructions to read previous cycles
- [ ] Add auto-rating on pattern references
- [ ] Create escalation handler for failed convergence
- [ ] Test with simple workflow (2 bots, 2 cycles)
- [ ] Document in MASTER_BOT_CONVERSATIONS.md

---

## Future Enhancements

### Phase 2: Parallel Stage Execution
```
Stage 2 (Backend) + Stage 3 (Frontend) run in parallel
  ↓
Both converge independently
  ↓
Merge at Stage 4 (Integration Testing)
```

### Phase 3: Async Bot Participation
```
Bot can "subscribe" to stage updates
  ↓
Gets notified when mentioned
  ↓
Can join mid-cycle to provide input
```

### Phase 4: AI-Driven Convergence Prediction
```
ML model predicts if current cycle will converge
  ↓
Suggests actions to accelerate convergence
  ↓
Reduces average cycles from 2-3 to 1-2
```

---

**End of Protocol**

This protocol transforms the bot system from a pipeline into a **collaborative team**.
