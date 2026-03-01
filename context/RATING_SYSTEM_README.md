# Bot Rating System - README
**Version:** 1.0
**Last Updated:** 2026-02-28

## Overview

The Bot Rating System allows bots to rate helpful sections and conversations, helping future bots find the most useful patterns and documentation.

## Quick Start

### For Bots: How to Rate Sections

When a section helps you solve a problem, add a rating in your work:

```markdown
**RATING:**
- Section: `backend_specialist.generator_export_pattern`
- Reason: Fixed "generator is not a function" error
- Helpful: Yes
```

### For Bots: How to Rate Conversations

```markdown
**RATING:**
- Conversation: `sas-triangle-positioning-2026-02-23.json`
- Reason: Bounding box pattern solved my positioning problem
- Helpful: Yes
```

### Where to Add Ratings

- In conversation summaries
- In task completion notes
- In debugging logs
- In any documentation you create

## Running the Aggregation Script

### Manual Run

```bash
cd frontends/lessons/context
node scripts/aggregate_ratings.js
```

Or if you set up the npm script:

```bash
npm run aggregate-ratings
```

### What the Script Does

1. Scans all conversation files for new **RATING:** blocks
2. Updates `bot_ratings.json` with new ratings
3. Updates badges (⭐ score | 👤 unique_bots) in `MASTER_BOT_CONVERSATIONS.md`
4. Generates `analytics_report.md` with insights

### Daily Automation (Cron Job)

To run the aggregation script daily at midnight:

```bash
# Edit crontab
crontab -e

# Add this line (adjust paths as needed):
0 0 * * * cd /Users/avivkatz/Desktop/claude_cowork/frontends/lessons/context && /usr/local/bin/node scripts/aggregate_ratings.js >> logs/aggregation.log 2>&1
```

**Note:** Make sure to create the logs directory first:

```bash
mkdir -p frontends/lessons/context/logs
```

## File Structure

```
frontends/lessons/context/
├── MASTER_BOT_CONVERSATIONS.md       # Main document with section IDs and badges
├── bot_ratings.json                  # Detailed rating data (generated)
├── analytics_report.md               # Analytics insights (generated)
├── RATING_SYSTEM_README.md           # This file
├── RATING_SYSTEM_IMPLEMENTATION_PLAN.md  # Design docs
├── scripts/
│   └── aggregate_ratings.js          # Aggregation script
├── conversations/
│   ├── active.json
│   ├── sas-triangle-positioning-2026-02-23.json
│   └── ...                           # All conversation files
└── logs/
    └── aggregation.log               # Cron job logs (optional)
```

## Section IDs Reference

All section IDs are listed in the appendix of `MASTER_BOT_CONVERSATIONS.md`.

Quick copy-paste IDs:

### Architect
- `architect.ipad_optimization`
- `architect.backend_generator_architecture`
- `architect.triangle_positioning_architecture`

### Engineer
- `engineer.system_of_equations_migration`
- `engineer.rounding_lesson`
- `engineer.order_of_operations_lesson`
- `engineer.venn_diagrams_rewrite`
- `engineer.triangle_inequality_rebuild`
- `engineer.triangle_sum_rebuild`
- `engineer.area_lesson`

### Backend Specialist
- `backend_specialist.generator_export_pattern`
- `backend_specialist.registration_checklist`
- `backend_specialist.triangle_positioning_helpers`
- `backend_specialist.common_pitfalls`

### Bug Fixer
- `bug_fixer.aas_lesson_debugging`
- `bug_fixer.aas_frontend_fixes`

### Konva Specialist
- `konva_specialist.triangle_rendering_congruency_markings`
- `konva_specialist.grid_layout_triangle_selection`
- `konva_specialist.bounding_box_calculations`

### React Specialist
- `react_specialist.triangle_positioning_analysis`
- `react_specialist.drawing_canvas_integration`

### Content Specialist
- `content_specialist.progressive_scaffolding`
- `content_specialist.multi_stage_button_selection`
- `content_specialist.triangle_congruence_progression`

### Documenter
- `documenter.interactive_lesson_patterns_guide`
- `documenter.triangle_congruence_documentation`
- `documenter.generator_registration_guide`

### Project Manager
- `project_manager.triangle_positioning_coordination`
- `project_manager.ipad_optimization_project`

### Tester / QA
- `tester.testing_checklist_template`
- `tester.screen_size_testing_matrix`

### Consultant
- `consultant.architecture_patterns_identified`
- `consultant.technical_debt_observations`

### Creative
- `creative.interactive_pattern_ideas`
- `creative.word_problem_contexts`

### Reviewer
- `reviewer.code_review_patterns`
- `reviewer.review_checklist_template`

## Analytics & Insights

After running aggregation, check `analytics_report.md` for:

- **Top sections** - Most highly-rated patterns
- **Zero-rated sections** - Candidates for archiving
- **Top conversations** - Most valuable discussions
- **Pruning candidates** - Suggestions for cleanup

## Troubleshooting

### Script Fails to Run

```bash
# Check Node.js is installed
node --version

# Make script executable
chmod +x scripts/aggregate_ratings.js

# Run with full path
node /Users/avivkatz/Desktop/claude_cowork/frontends/lessons/context/scripts/aggregate_ratings.js
```

### Ratings Not Updating

1. Check rating format matches exactly (see examples above)
2. Make sure file is in `conversations/` directory
3. Run script manually to see error messages
4. Check that section IDs exist in `bot_ratings.json`

### Badges Not Updating

1. Make sure section has `<!-- SECTION_ID: ... -->` comment
2. Check that badge format matches `⭐ X | 👤 Y`
3. Run script and check for update messages

## Future Enhancements

See `RATING_SYSTEM_IMPLEMENTATION_PLAN.md` for planned features:

- V2: Web UI, AI-generated suggestions, bot role recommendations
- V3: Real-time rating, integration with bot decision-making, pattern marketplace

## Support

If you encounter issues:

1. Check this README
2. Review `RATING_SYSTEM_IMPLEMENTATION_PLAN.md`
3. Run aggregation manually to see error messages
4. Check bot_ratings.json structure

---

**Happy Rating!** 🌟
