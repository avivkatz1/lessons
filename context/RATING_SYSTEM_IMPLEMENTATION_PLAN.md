# Bot Rating System - Implementation Plan
**Created:** 2026-02-28
**Status:** Design Complete - Ready for Implementation
**Purpose:** Enable bots to rate helpful sections/patterns for analytics and pruning

---

## Executive Summary

A hybrid rating system where:
- Bots rate sub-sections via simple structured comments
- Scores stored in `bot_ratings.json` (detailed tracking)
- Badges displayed in markdown (⭐ x8 | 👤 5 bots)
- Analytics reveal patterns for pruning and combining ideas
- Links between master document sections and conversation messages

---

## 1. Storage Schema

### File: `bot_ratings.json`

```json
{
  "version": "1.0",
  "last_updated": "2026-02-28T12:00:00Z",
  "master_document_sections": {
    "architect.ipad_optimization": {
      "section_id": "architect.ipad_optimization",
      "section_title": "iPad Optimization Strategy",
      "score": 8,
      "unique_bots": 5,
      "ratings": [
        {
          "bot_role": "engineer",
          "timestamp": "2026-02-23T10:00:00Z",
          "reason": "Helped implement touch affordances in new lesson",
          "task_context": "implementing-area-perimeter-lesson",
          "conversation_ref": "active.json#ipad-optimization-2026-02-18"
        },
        {
          "bot_role": "react_specialist",
          "timestamp": "2026-02-24T14:30:00Z",
          "reason": "useIsTouchDevice hook pattern solved my problem",
          "task_context": "refactoring-symmetry-lesson"
        }
      ]
    },
    "backend_specialist.generator_export_pattern": {
      "section_id": "backend_specialist.generator_export_pattern",
      "section_title": "Generator Export Pattern",
      "score": 12,
      "unique_bots": 6,
      "ratings": [
        {
          "bot_role": "engineer",
          "timestamp": "2026-02-23T15:00:00Z",
          "reason": "Fixed 'generator is not a function' error"
        },
        {
          "bot_role": "backend_specialist",
          "timestamp": "2026-02-25T09:00:00Z"
        },
        {
          "bot_role": "bug_fixer",
          "timestamp": "2026-02-27T11:00:00Z",
          "reason": "Debugged AAS lesson using this pattern"
        }
      ]
    }
  },
  "conversations": {
    "sas-triangle-positioning-2026-02-23.json": {
      "conversation_id": "sas-triangle-positioning-2026-02-23",
      "title": "SAS Congruent Triangles — Dynamic Triangle Positioning",
      "overall_score": 15,
      "unique_bots": 7,
      "ratings": [
        {
          "bot_role": "backend_specialist",
          "timestamp": "2026-02-25T10:00:00Z",
          "reason": "Bounding box pattern reusable for all triangle lessons"
        },
        {
          "bot_role": "konva_specialist",
          "timestamp": "2026-02-26T14:00:00Z",
          "reason": "Positioning helpers saved hours of work"
        }
      ],
      "message_ratings": {
        "message_5": {
          "speaker": "konva_specialist",
          "message_text": "Here's what backend needs to do: Calculate Triangle Bounding Box...",
          "score": 9,
          "ratings": [
            {
              "bot_role": "backend_specialist",
              "timestamp": "2026-02-25T10:05:00Z",
              "reason": "Exact code I needed for bounds calculation"
            }
          ]
        }
      },
      "linked_sections": [
        "backend_specialist.triangle_positioning_helpers",
        "konva_specialist.bounding_box_calculations"
      ]
    },
    "lessons-learned-triangle-congruence-generators.md": {
      "conversation_id": "lessons-learned-triangle-congruence-generators",
      "overall_score": 18,
      "unique_bots": 8,
      "ratings": [
        {
          "bot_role": "engineer",
          "timestamp": "2026-02-23T16:00:00Z",
          "reason": "Complete generator registration checklist - followed exactly"
        }
      ],
      "linked_sections": [
        "backend_specialist.generator_export_pattern",
        "backend_specialist.registration_checklist"
      ]
    }
  },
  "analytics": {
    "top_sections": [
      {
        "section_id": "backend_specialist.generator_export_pattern",
        "score": 12,
        "category": "backend"
      },
      {
        "section_id": "konva_specialist.triangle_rendering",
        "score": 10,
        "category": "frontend"
      }
    ],
    "top_conversations": [
      {
        "conversation_id": "lessons-learned-triangle-congruence-generators",
        "score": 18
      },
      {
        "conversation_id": "sas-triangle-positioning-2026-02-23",
        "score": 15
      }
    ],
    "by_role": {
      "engineer": {
        "total_ratings_given": 23,
        "most_used_sections": [
          "backend_specialist.generator_export_pattern",
          "architect.ipad_optimization"
        ]
      },
      "backend_specialist": {
        "total_ratings_given": 15,
        "most_used_sections": [
          "backend_specialist.triangle_positioning_helpers",
          "backend_specialist.registration_checklist"
        ]
      }
    },
    "zero_rated_sections": [
      "creative.word_problem_contexts",
      "consultant.technical_debt_observations"
    ],
    "pruning_candidates": {
      "low_value": [
        {
          "section_id": "creative.future_enhancement_ideas",
          "score": 0,
          "reason": "Never used by any bot"
        }
      ],
      "combine_candidates": [
        {
          "sections": ["backend_specialist.generator_export_pattern", "backend_specialist.registration_checklist"],
          "reason": "Always used together (12 co-occurrences)",
          "suggested_action": "Merge into single 'Complete Generator Setup Guide'"
        }
      ]
    }
  }
}
```

---

## 2. Bot Interaction Workflow

### Option 1: Structured Comment Format (RECOMMENDED)

Bots add ratings naturally in their work by including structured comments:

```markdown
## Task: Implementing AAS Congruent Triangles Lesson

I followed the backend generator pattern from MASTER_BOT_CONVERSATIONS.md.

**RATING:**
- Section: `backend_specialist.generator_export_pattern`
- Reason: Fixed "generator is not a function" error by following the ✅ correct pattern
- Helpful: Yes

**RATING:**
- Conversation: `lessons-learned-triangle-congruence-generators.md`
- Reason: 5-step registration checklist prevented all common mistakes
- Helpful: Yes
```

A periodic aggregation script parses these and updates `bot_ratings.json`.

### Option 2: Simple JSON Snippet (ALTERNATIVE)

Bots append to a `pending_ratings.jsonl` file:

```jsonl
{"section": "backend_specialist.generator_export_pattern", "bot_role": "engineer", "reason": "Fixed generator export bug", "timestamp": "2026-02-28T10:00:00Z"}
{"conversation": "sas-triangle-positioning-2026-02-23.json", "bot_role": "konva_specialist", "reason": "Bounding box code worked perfectly"}
```

Aggregation script processes and clears this file periodically.

### Option 3: Command-Line Tool (FUTURE)

```bash
# Rate a section
./rate.sh section "backend_specialist.generator_export_pattern" \
  --role engineer \
  --reason "Fixed generator export bug"

# Rate a conversation
./rate.sh conversation "sas-triangle-positioning-2026-02-23.json" \
  --role konva_specialist \
  --reason "Bounding box helpers saved hours"

# Rate a message in a conversation
./rate.sh message "sas-triangle-positioning-2026-02-23.json" 5 \
  --role backend_specialist \
  --reason "Exact bounds calculation code I needed"
```

**RECOMMENDED FOR MVP:** Option 1 (Structured Comments)
- Natural workflow
- Low friction
- Bot can rate multiple things in one summary
- Easy to parse with regex

---

## 3. Badge Display in Markdown

### Master Document Badge Format

```markdown
## 🏗️ ARCHITECT

### 1. iPad Optimization Strategy ⭐ 8 | 👤 5
**Conversation:** active.json → "ipad-optimization-2026-02-18"

[Content...]

### 2. Backend Generator Architecture Pattern ⭐ 12 | 👤 6
**Conversation:** active.json → "soe-backend-migration-2026-02-17"

[Content...]
```

**Badge Elements:**
- ⭐ [score] - Total rating count
- 👤 [unique_bots] - Number of unique bot roles who rated it

**Optional Future Enhancements:**
- 🔥 Hot (rated 3+ times in last 7 days)
- 📈 Trending (50% increase in last 30 days)
- 💎 Gold Standard (score ≥ 15)

### Conversation File Badge Format

For JSON conversations like `sas-triangle-positioning-2026-02-23.json`:

```json
{
  "id": "sas-triangle-positioning-2026-02-23",
  "title": "SAS Congruent Triangles — Dynamic Triangle Positioning",
  "rating_summary": "⭐ 15 | 👤 7",
  "overall_score": 15,
  "unique_raters": 7,
  "conversation": [...]
}
```

For markdown conversations:

```markdown
# AAS Lesson Debugging ⭐ 18 | 👤 8
**Date:** 2026-02-23
**Status:** ✅ ALL ISSUES FIXED

[Content...]
```

---

## 4. Section ID Assignment

### MASTER_BOT_CONVERSATIONS.md Section IDs

Format: `{role}.{subsection_slug}`

**Examples:**
```
architect.ipad_optimization
architect.backend_generator_architecture
architect.triangle_positioning_architecture
engineer.system_of_equations_migration
engineer.rounding_lesson
engineer.order_of_operations_lesson
backend_specialist.generator_export_pattern
backend_specialist.registration_checklist
backend_specialist.triangle_positioning_helpers
konva_specialist.triangle_rendering_congruency_markings
konva_specialist.grid_layout_triangle_selection
konva_specialist.bounding_box_calculations
```

### Adding Section IDs to Markdown

```markdown
## 💻 ENGINEER

### 1. System of Equations Migration {#engineer.system_of_equations_migration} ⭐ 5 | 👤 3
**Conversation:** active.json → "soe-backend-migration-2026-02-17"
```

Or using HTML comments (cleaner):

```markdown
<!-- SECTION_ID: engineer.system_of_equations_migration -->
### 1. System of Equations Migration ⭐ 5 | 👤 3
**Conversation:** active.json → "soe-backend-migration-2026-02-17"
```

**RECOMMENDED:** HTML comments
- Invisible in rendered markdown
- Easy to parse
- Doesn't clutter headings

---

## 5. Linking System

### Master Document → Conversations

Each section in MASTER_BOT_CONVERSATIONS.md references source conversations:

```markdown
<!-- SECTION_ID: backend_specialist.generator_export_pattern -->
<!-- LINKED_CONVERSATIONS: lessons-learned-triangle-congruence-generators.md, aas-lesson-debugging-2026-02-23.md -->
### Generator Export Pattern ⭐ 12 | 👤 6
**From:** lessons-learned-triangle-congruence-generators.md
```

### Conversations → Master Document

Each conversation file links to related sections:

```json
{
  "id": "lessons-learned-triangle-congruence-generators",
  "linked_master_sections": [
    "backend_specialist.generator_export_pattern",
    "backend_specialist.registration_checklist",
    "bug_fixer.common_pitfalls"
  ]
}
```

### Message-Level Linking

In conversation JSON with per-message ratings:

```json
{
  "conversation": [
    {
      "speaker": "konva_specialist",
      "message": "Here's what backend needs to do...",
      "rating": 9,
      "rated_by": ["backend_specialist", "engineer", "architect"],
      "extracted_to_master": "konva_specialist.bounding_box_calculations"
    }
  ]
}
```

---

## 6. Aggregation Script

### Script: `aggregate_ratings.js` (or `.py`)

**Responsibilities:**
1. Parse structured comments from conversation files
2. Extract RATING blocks
3. Update `bot_ratings.json`
4. Update badges in MASTER_BOT_CONVERSATIONS.md
5. Generate analytics

**Inputs:**
- All files in `frontends/lessons/context/conversations/`
- Current `bot_ratings.json`
- MASTER_BOT_CONVERSATIONS.md

**Outputs:**
- Updated `bot_ratings.json`
- Updated MASTER_BOT_CONVERSATIONS.md (with new badges)
- `analytics_report.md` (optional)

**Run frequency:**
- Manual: After major conversations
- Automated: Daily cron job (optional)
- On-demand: `npm run aggregate-ratings`

### Pseudocode

```javascript
// 1. Parse all conversation files
const conversations = glob('frontends/lessons/context/conversations/**/*');
const ratings = [];

for (const file of conversations) {
  const content = readFile(file);

  // Extract structured RATING blocks
  const ratingMatches = content.matchAll(/\*\*RATING:\*\*\n- Section: `(.+?)`\n- Reason: (.+?)\n/g);

  for (const match of ratingMatches) {
    ratings.push({
      section: match[1],
      reason: match[2],
      bot_role: inferBotRole(file),  // or extract from file
      timestamp: extractTimestamp(file),
      source_file: file
    });
  }
}

// 2. Update bot_ratings.json
const ratingsData = JSON.parse(readFile('bot_ratings.json'));

for (const rating of ratings) {
  if (!ratingsData.master_document_sections[rating.section]) {
    ratingsData.master_document_sections[rating.section] = {
      section_id: rating.section,
      score: 0,
      unique_bots: 0,
      ratings: []
    };
  }

  const section = ratingsData.master_document_sections[rating.section];
  section.ratings.push(rating);
  section.score = section.ratings.length;
  section.unique_bots = new Set(section.ratings.map(r => r.bot_role)).size;
}

// 3. Generate analytics
ratingsData.analytics = generateAnalytics(ratingsData);

// 4. Update badges in markdown
let markdown = readFile('MASTER_BOT_CONVERSATIONS.md');

for (const [sectionId, data] of Object.entries(ratingsData.master_document_sections)) {
  // Find section in markdown and update badge
  const regex = new RegExp(`<!-- SECTION_ID: ${sectionId} -->\\n### (.+?) ⭐ \\d+ \\| 👤 \\d+`);
  const replacement = `<!-- SECTION_ID: ${sectionId} -->\n### $1 ⭐ ${data.score} | 👤 ${data.unique_bots}`;
  markdown = markdown.replace(regex, replacement);
}

writeFile('MASTER_BOT_CONVERSATIONS.md', markdown);

// 5. Save updated ratings
writeFile('bot_ratings.json', JSON.stringify(ratingsData, null, 2));
```

---

## 7. Analytics & Insights

### Analytics Report: `analytics_report.md`

Generated automatically by aggregation script.

```markdown
# Bot Rating System - Analytics Report
**Generated:** 2026-02-28T15:00:00Z

## 📊 Overview
- Total sections: 42
- Total rated sections: 28 (67%)
- Total ratings: 156
- Unique bots who rated: 9
- Total conversations: 12
- Rated conversations: 8 (67%)

## 🌟 Top Sections (by score)
1. **backend_specialist.generator_export_pattern** - ⭐ 18 | 👤 8
   - Most helpful for: engineer, backend_specialist, bug_fixer
   - Common reasons: "Fixed generator export bug", "Prevented common mistakes"

2. **konva_specialist.triangle_rendering** - ⭐ 15 | 👤 6
   - Most helpful for: engineer, konva_specialist, react_specialist
   - Common reasons: "Tick marks implementation", "Arc marks code"

3. **architect.ipad_optimization** - ⭐ 12 | 👤 5
   - Most helpful for: engineer, react_specialist
   - Common reasons: "Touch affordances pattern", "MathKeypad integration"

## 🔥 Trending (last 7 days)
1. backend_specialist.triangle_positioning_helpers - 8 new ratings
2. backend_specialist.generator_export_pattern - 5 new ratings

## 📈 Most Used by Role
### Engineer
- backend_specialist.generator_export_pattern (6 times)
- architect.ipad_optimization (4 times)
- konva_specialist.triangle_rendering (3 times)

### Backend Specialist
- backend_specialist.generator_export_pattern (5 times)
- backend_specialist.triangle_positioning_helpers (4 times)

## ⚠️ Zero-Rated Sections (never used)
1. creative.future_enhancement_ideas
2. consultant.technical_debt_observations
3. creative.word_problem_contexts

**Recommendation:** Consider pruning or moving to archive.

## 🔗 Co-occurrence Analysis (sections used together)
1. **backend_specialist.generator_export_pattern** + **backend_specialist.registration_checklist**
   - Used together: 12 times
   - Recommendation: Merge into "Complete Generator Setup Guide"

2. **konva_specialist.triangle_rendering** + **konva_specialist.bounding_box_calculations**
   - Used together: 8 times
   - Recommendation: Consider combining or cross-linking more explicitly

## 📚 Conversation Rankings
1. **lessons-learned-triangle-congruence-generators.md** - ⭐ 18 | 👤 8
2. **sas-triangle-positioning-2026-02-23.json** - ⭐ 15 | 👤 7
3. **triangle-congruence-level3-lessons-learned-2026-02-23.md** - ⭐ 12 | 👤 5

## 🗑️ Pruning Candidates
### Low Value (score 0, age > 30 days)
- creative.future_enhancement_ideas (created 45 days ago, 0 ratings)
- consultant.refactoring_opportunities (created 30 days ago, 0 ratings)

### Duplicate/Overlap Detected
- backend_specialist.common_pitfalls (score 3)
- bug_fixer.common_pitfalls (score 8)
- **Recommendation:** Merge into bug_fixer.common_pitfalls (higher score)

## 💡 Suggestions
1. **Promote:** backend_specialist.generator_export_pattern to top of document (highest score)
2. **Archive:** creative.future_enhancement_ideas (0 usage in 45 days)
3. **Combine:** generator_export_pattern + registration_checklist (12 co-occurrences)
4. **Enhance:** Add more examples to architect.ipad_optimization (high demand)
```

---

## 8. Pruning Workflow

### Automatic Pruning Suggestions

Script generates `pruning_suggestions.json`:

```json
{
  "pruning_date": "2026-02-28",
  "candidates": [
    {
      "type": "archive",
      "section_id": "creative.future_enhancement_ideas",
      "reason": "Zero ratings in 45 days",
      "age_days": 45,
      "score": 0,
      "action": "Move to archive/future_ideas.md"
    },
    {
      "type": "merge",
      "sections": [
        "backend_specialist.generator_export_pattern",
        "backend_specialist.registration_checklist"
      ],
      "reason": "Used together 12 times",
      "co_occurrence_count": 12,
      "combined_score": 25,
      "suggested_title": "Complete Generator Setup Guide",
      "action": "Merge content, redirect old section IDs"
    },
    {
      "type": "duplicate",
      "sections": [
        "backend_specialist.common_pitfalls",
        "bug_fixer.common_pitfalls"
      ],
      "reason": "90% content overlap",
      "overlap_percentage": 90,
      "keep": "bug_fixer.common_pitfalls",
      "archive": "backend_specialist.common_pitfalls",
      "action": "Merge into bug_fixer section, add cross-reference"
    }
  ]
}
```

### Manual Review Process

1. **Review `pruning_suggestions.json`** quarterly
2. **Approve/reject** each suggestion
3. **Execute approved actions:**
   - Archive: Move to `archive/` folder
   - Merge: Combine sections, update IDs, add redirects
   - Duplicate: Keep higher-scored version, add cross-reference
4. **Update `bot_ratings.json`** with redirects/merges
5. **Regenerate analytics**

---

## 9. Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create `bot_ratings.json` schema
- [ ] Add section IDs to MASTER_BOT_CONVERSATIONS.md (HTML comments)
- [ ] Add initial badges (all ⭐ 0 | 👤 0)
- [ ] Document rating workflow for bots

### Phase 2: Aggregation Script (Week 1-2)
- [ ] Implement structured comment parser
- [ ] Build aggregation logic
- [ ] Update badge system
- [ ] Test with sample data

### Phase 3: Conversation Integration (Week 2)
- [ ] Add rating fields to existing conversation JSONs
- [ ] Link conversations to master sections
- [ ] Enable message-level ratings

### Phase 4: Analytics (Week 3)
- [ ] Implement analytics generation
- [ ] Create `analytics_report.md` template
- [ ] Build co-occurrence detection
- [ ] Generate pruning suggestions

### Phase 5: Automation (Week 4)
- [ ] Set up daily aggregation cron job (optional)
- [ ] Create manual run script (`npm run aggregate-ratings`)
- [ ] Build pruning workflow
- [ ] Documentation and bot training

---

## 10. Bot Training & Documentation

### For Bots: How to Rate Sections

Add to MASTER_BOT_CONVERSATIONS.md introduction:

```markdown
## How to Rate Sections

When a section helps you solve a problem, add a rating:

**Format:**
```
**RATING:**
- Section: `{role}.{subsection_slug}`
- Reason: [Optional - why it was helpful]
- Helpful: Yes
```

**Example:**
```
**RATING:**
- Section: `backend_specialist.generator_export_pattern`
- Reason: Fixed "generator is not a function" error
- Helpful: Yes
```

**Where to add:**
- In your conversation summary
- In task completion notes
- In debugging logs

Ratings are aggregated daily and update the ⭐ scores you see.
```

### Section ID Reference

Add appendix to MASTER_BOT_CONVERSATIONS.md:

```markdown
## Appendix: Section IDs for Rating

Copy-paste these IDs when rating:

### Architect
- `architect.ipad_optimization`
- `architect.backend_generator_architecture`
- `architect.triangle_positioning_architecture`

### Engineer
- `engineer.system_of_equations_migration`
- `engineer.rounding_lesson`
- `engineer.order_of_operations_lesson`
[...]

### Backend Specialist
- `backend_specialist.generator_export_pattern`
- `backend_specialist.registration_checklist`
- `backend_specialist.triangle_positioning_helpers`
[...]
```

---

## 11. Success Metrics

After 30 days of usage, measure:

1. **Adoption Rate**
   - % of bots who rated at least once
   - Target: 70%+

2. **Coverage**
   - % of sections with at least 1 rating
   - Target: 80%+

3. **Data Quality**
   - % of ratings with reasons
   - Target: 50%+

4. **Actionability**
   - Number of pruning actions taken
   - Number of sections merged/combined
   - Target: 3-5 improvements per month

5. **Bot Efficiency**
   - Time to find relevant pattern (before vs after ratings)
   - Target: 30% reduction

---

## 12. Future Enhancements

### V2 Features (3-6 months)
- [ ] Web UI for browsing ratings
- [ ] AI-generated suggestions based on ratings
- [ ] Automatic pattern extraction from highly-rated sections
- [ ] Bot role recommendations ("If you're a backend_specialist, read these first")
- [ ] Version history of sections (track changes after high ratings)

### V3 Features (6-12 months)
- [ ] Real-time rating during bot execution
- [ ] Integration with bot decision-making (prioritize highly-rated patterns)
- [ ] Community voting system (human developers can also rate)
- [ ] Pattern marketplace (export/import highly-rated patterns)

---

## Appendix A: File Structure

```
frontends/lessons/context/
├── MASTER_BOT_CONVERSATIONS.md (with section IDs and badges)
├── bot_ratings.json (detailed rating data)
├── analytics_report.md (generated)
├── pruning_suggestions.json (generated)
├── scripts/
│   ├── aggregate_ratings.js (or .py)
│   ├── generate_analytics.js
│   └── rate.sh (CLI tool - future)
└── conversations/
    ├── active.json (with rating fields)
    ├── sas-triangle-positioning-2026-02-23.json (with ratings)
    ├── lessons-learned-triangle-congruence-generators.md (with ratings)
    └── ...
```

---

## Appendix B: Sample Structured Comment

```markdown
## Engineer Bot - Task Completion Summary
**Task:** Implement ASA Congruent Triangles Lesson
**Date:** 2026-02-28
**Status:** Complete

### What I Did
1. Created backend generator following the pattern from backend_specialist section
2. Used the registration checklist - no mistakes!
3. Applied triangle positioning helpers from SAS/SSS lessons
4. Frontend uses useLessonState() hook

### Issues Encountered
- Initially exported object instead of function
- Fixed by referencing backend_specialist.generator_export_pattern

### Ratings

**RATING:**
- Section: `backend_specialist.generator_export_pattern`
- Reason: Prevented "generator is not a function" error by following ✅ correct pattern
- Helpful: Yes

**RATING:**
- Section: `backend_specialist.registration_checklist`
- Reason: 5-step checklist ensured I didn't miss any registration steps
- Helpful: Yes

**RATING:**
- Conversation: `lessons-learned-triangle-congruence-generators.md`
- Reason: Complete reference guide - used as step-by-step manual
- Helpful: Yes

**RATING:**
- Conversation: `sas-triangle-positioning-2026-02-23.json`
- Message: 5 (konva_specialist's bounding box code)
- Reason: Copy-pasted bounds calculation function - worked perfectly
- Helpful: Yes
```

---

## Questions for User Before Implementation

1. **Scripting language preference?** JavaScript (Node.js) or Python for aggregation script?
2. **Automation?** Should aggregation run automatically (cron) or manual only?
3. **Initial setup?** Should I start by adding section IDs to existing MASTER_BOT_CONVERSATIONS.md?
4. **Conversation backfill?** Should we retroactively add rating fields to existing conversations (like sas-triangle-positioning)?

---

**Ready to implement once you approve!**
