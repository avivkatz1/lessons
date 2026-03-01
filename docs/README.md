# Lessons Frontend Documentation
**Comprehensive guide for building interactive math lessons**

---

## 🚀 Quick Start

**New to this codebase? Start here:**
1. Read [MULTI_BOT_SYSTEM.md](MULTI_BOT_SYSTEM.md) - Workflow overview
2. Review [INTERACTIVE_LESSON_PATTERNS.md](INTERACTIVE_LESSON_PATTERNS.md) - **NEW!** Interactive patterns
3. Check [guides/INTERACTIVE_PATTERNS_QUICK_REF.md](guides/INTERACTIVE_PATTERNS_QUICK_REF.md) - Quick reference
4. Explore reference implementation: `SolvingEquationsLesson.jsx`

---

## 📚 Documentation Index

### Core Workflow Documents

| Document | Purpose | Read When |
|----------|---------|-----------|
| **MULTI_BOT_SYSTEM.md** | Workflow orchestration, bot roles, lesson creation process | Starting any task |
| **LESSON_DEVELOPMENT_CHECKLIST.md** | Step-by-step lesson creation guide | Planning a new lesson |
| **DESIGN_CHOICES.md** | ⭐ UI/UX design decisions and patterns | Making design decisions |
| **VISUAL_DESIGN_RULES.md** | Design standards and theming | Styling components |
| **LESSON_TESTING_PROTOCOL.md** | Testing procedures and QA | Before deployment |

### Interactive Patterns (⭐ NEW!)

| Document | Purpose | Read When |
|----------|---------|-----------|
| **INTERACTIVE_LESSON_PATTERNS.md** | **Comprehensive interactive patterns guide** | Building ANY interactive lesson |
| **guides/INTERACTIVE_PATTERNS_QUICK_REF.md** | Quick reference card for common patterns | During development (quick lookup) |
| **CANVAS_KONVA_MIGRATION.md** | Drawing canvas technical implementation | Integrating drawing canvas |
| **CANVAS_ANSWER_BOX_FEATURE.md** | Canvas answer input integration | Adding answer input to canvas |

### Specialized Topics

| Document | Purpose | Read When |
|----------|---------|-----------|
| **RESTRUCTURING_SUMMARY.md** | Backend architecture overview | Creating backend generators |
| **Bot Definitions** (`/docs/bots/`) | Individual bot role specifications | Understanding bot capabilities |
| **Workflow Definitions** (`/context/workflows/`) | Formal workflow JSON definitions | Debugging workflows |

---

## 🎯 Find What You Need

### "I want to build an interactive lesson"

1. **Read:** [INTERACTIVE_LESSON_PATTERNS.md](INTERACTIVE_LESSON_PATTERNS.md)
2. **Reference:** `SolvingEquationsLesson.jsx` (full implementation)
3. **Use:** Code templates from the guide
4. **Quick lookup:** [guides/INTERACTIVE_PATTERNS_QUICK_REF.md](guides/INTERACTIVE_PATTERNS_QUICK_REF.md)

**Patterns available:**
- ✅ Button selection with visual feedback
- ✅ Multi-stage progression (Step 1 → Step 2 → Solve)
- ✅ Drawing canvas integration
- ✅ Progressive scaffolding (fade after mastery)
- ✅ Visual helpers (balance scales, diagrams)
- ✅ Hint systems
- ✅ Answer validation with Redux

### "I want to add a drawing canvas"

1. **Import:** `DrawingCanvas` component from `/shared/components`
2. **Read:** [CANVAS_KONVA_MIGRATION.md](CANVAS_KONVA_MIGRATION.md)
3. **Wire up:** Follow integration guide in INTERACTIVE_LESSON_PATTERNS.md
4. **Features:** Marker, eraser, auto-save, answer input, submit button, dark mode

### "I want to understand the codebase structure"

1. **Read:** [MULTI_BOT_SYSTEM.md](MULTI_BOT_SYSTEM.md) - Workflow overview
2. **Check:** [RESTRUCTURING_SUMMARY.md](RESTRUCTURING_SUMMARY.md) - Backend architecture
3. **Explore:** `/src/features/lessons/lessonTypes/` - Existing lessons

### "I want to create a new lesson from scratch"

1. **Follow:** [MULTI_BOT_SYSTEM.md](MULTI_BOT_SYSTEM.md) → "Create Lesson Workflow"
2. **Plan:** Use [LESSON_DEVELOPMENT_CHECKLIST.md](LESSON_DEVELOPMENT_CHECKLIST.md)
3. **Design:** Review [INTERACTIVE_LESSON_PATTERNS.md](INTERACTIVE_LESSON_PATTERNS.md) for interaction ideas
4. **Implement:** Use code templates and reference implementations
5. **Test:** Follow [LESSON_TESTING_PROTOCOL.md](LESSON_TESTING_PROTOCOL.md)

### "I want to fix a bug or add a feature"

1. **Read:** [MULTI_BOT_SYSTEM.md](MULTI_BOT_SYSTEM.md) → "Fix Bug" or "Add Feature" workflows
2. **Check:** `/context/conversations/` - See if similar issue was solved before
3. **Reference:** Existing implementations for patterns

---

## 🌟 Highlighted Resources

### NEW: Interactive Lesson Patterns (2026-02-24)

**What:** Comprehensive guide documenting proven interactive patterns from Solving Equations lesson

**Why Important:** Defines best practices for engagement, scaffolding, and UX across all future lessons

**Key Patterns:**
- Progressive scaffolding fade (heavy → light as student progresses)
- Multi-stage button selection with visual feedback
- Drawing canvas with integrated answer input + submission
- Immediate visual feedback (green/red, animations)
- Redux state management for shared answer validation

**Files:**
- Main guide: [INTERACTIVE_LESSON_PATTERNS.md](INTERACTIVE_LESSON_PATTERNS.md) (~800 lines)
- Quick ref: [guides/INTERACTIVE_PATTERNS_QUICK_REF.md](guides/INTERACTIVE_PATTERNS_QUICK_REF.md) (~300 lines)
- Conversation: `/context/conversations/solving_equations_interactive_patterns.md`

**Impact:** Every new interactive lesson should reference this guide

---

## 📂 File Organization

```
/frontends/lessons/docs/
  README.md                                    ← You are here
  MULTI_BOT_SYSTEM.md                          Core workflow orchestration
  INTERACTIVE_LESSON_PATTERNS.md               ⭐ Interactive patterns guide
  LESSON_DEVELOPMENT_CHECKLIST.md              Development checklist
  VISUAL_DESIGN_RULES.md                       Design standards
  LESSON_TESTING_PROTOCOL.md                   Testing procedures
  RESTRUCTURING_SUMMARY.md                     Backend architecture
  CANVAS_KONVA_MIGRATION.md                    Canvas implementation
  CANVAS_ANSWER_BOX_FEATURE.md                 Canvas answer input

  /guides/
    INTERACTIVE_PATTERNS_QUICK_REF.md          ⭐ Quick reference card
    [other active guides]

  /bots/
    /core/                                     Always-needed bots
    /specialized/                              Task-specific bots
    /meta/                                     System management bots

  /archived/
    [deprecated documentation]

/frontends/lessons/context/
  project.json                                 Project metadata

  /conversations/
    active.json                                Current conversations
    important.json                             Permanent conversations
    solving_equations_interactive_patterns.md  ⭐ Recent discovery
    archived_YYYY-MM.json                      Monthly archives

  /workflows/
    create_lesson.json                         Lesson creation workflow
    fix_bug.json                               Bug fixing workflow
    add_feature.json                           Feature implementation
```

---

## 🎓 Learning Path

### For Bot Developers (First Time)

**Day 1: Orientation**
1. Read MULTI_BOT_SYSTEM.md (30 min)
2. Skim INTERACTIVE_LESSON_PATTERNS.md (45 min)
3. Explore `SolvingEquationsLesson.jsx` (30 min)
4. Review `/context/conversations/` recent discoveries (15 min)

**Day 2: Deep Dive**
1. Read LESSON_DEVELOPMENT_CHECKLIST.md (20 min)
2. Study code templates in INTERACTIVE_LESSON_PATTERNS.md (60 min)
3. Review DrawingCanvas.jsx implementation (30 min)
4. Check VISUAL_DESIGN_RULES.md for styling (30 min)

**Day 3: Practice**
1. Follow "Create Lesson Workflow" for simple lesson (2-3 hours)
2. Use INTERACTIVE_PATTERNS_QUICK_REF.md for lookups
3. Test with LESSON_TESTING_PROTOCOL.md (30 min)

### For Experienced Developers

**Quick Refresh:**
- INTERACTIVE_PATTERNS_QUICK_REF.md (5 min)
- Latest `/context/conversations/` entries (10 min)
- Reference implementation review (15 min)

**Before Building:**
- [ ] Pattern matches known pattern? Use template.
- [ ] New pattern? Document it after implementation.
- [ ] Check `/context/conversations/` for similar work.

---

## 🔄 Keeping Documentation Current

### When You Discover Something New

**If you find a new pattern:**
1. Implement and test it
2. Add to INTERACTIVE_LESSON_PATTERNS.md (with code examples)
3. Update INTERACTIVE_PATTERNS_QUICK_REF.md (condensed version)
4. Create conversation summary in `/context/conversations/`
5. Update this README if major discovery

**If you find a better way:**
1. Update relevant documentation with "Lessons Learned" section
2. Mark old approach as deprecated
3. Provide migration guide if breaking change
4. Notify in `/context/conversations/active.json`

**If documentation is outdated:**
1. Move to `/docs/archived/`
2. Update references in other documents
3. Add deprecation note with replacement link

---

## 🤝 Collaboration

### Multi-Bot Workflow

**Bots work together through:**
- Conversation summaries in `/context/conversations/`
- Formal workflows in `/context/workflows/`
- Shared documentation in `/docs/`

**When starting work:**
1. Check `/context/conversations/active.json` - Is someone working on this?
2. Review related conversations - Has this been solved before?
3. Update active.json when starting new work
4. Document discoveries for future bots

### Knowledge Sharing

**After completing work:**
1. Summarize in `/context/conversations/`
2. Update relevant guides with new patterns
3. Add code examples to documentation
4. Flag important conversations in `important.json`

---

## 📊 Documentation Quality Standards

### All Documents Should Have:
- ✅ Date and status at top
- ✅ Clear purpose/overview
- ✅ Table of contents (if >200 lines)
- ✅ Code examples with explanations
- ✅ "When to use" guidance
- ✅ Related files section
- ✅ Last updated date

### Interactive Pattern Documentation Should Include:
- ✅ Visual examples or diagrams
- ✅ Complete code snippets (copy-paste ready)
- ✅ "Why it works" explanations
- ✅ Common pitfalls section
- ✅ Reference implementations
- ✅ Performance considerations

---

## 🎯 Success Metrics

**Documentation is successful when:**
- New bots can build lessons without asking basic questions
- Patterns are reused across multiple lessons
- Development time decreases for similar features
- Code quality and consistency improves
- Fewer bugs in interactive features

**This documentation has succeeded if:**
- You found what you needed quickly ✅
- Code examples worked without modification ✅
- You understood WHY not just HOW ✅
- You can now teach another bot ✅

---

## 🚦 Status Indicators

| Symbol | Meaning |
|--------|---------|
| ⭐ | New or recently updated |
| ✅ | Stable and reliable |
| 🚧 | Work in progress |
| 📦 | Archived/deprecated |
| 🔥 | Critical/high priority |

---

## 📞 Getting Help

**Stuck? Try this order:**

1. **Search documentation:** Use Ctrl+F across these guides
2. **Check conversations:** `/context/conversations/` - similar issue solved?
3. **Review reference code:** `SolvingEquationsLesson.jsx`, `DrawingCanvas.jsx`
4. **Ask in conversation:** Document your question in `/context/conversations/active.json`
5. **Experiment:** Build MVP, document learnings

---

## 🎉 Recent Wins

**2026-03-01: Design Choices Documentation + First Orientation Feature**
- Created DESIGN_CHOICES.md - living document for UI/UX decisions
- Implemented first orientation-based feature (AddingIntegersLesson)
- "Need help" button adapts: top-right (landscape) vs below input (portrait)
- Smooth 300ms transitions between orientations
- Impact: Template for future orientation-aware UI patterns

**2026-02-24: Interactive Lesson Patterns Documentation**
- Created comprehensive INTERACTIVE_LESSON_PATTERNS.md guide
- Documented proven patterns from Solving Equations lesson
- Added quick reference card for fast lookups
- Updated MULTI_BOT_SYSTEM.md with pattern references
- Impact: Future lessons can reuse battle-tested patterns

**2026-02-16: Multi-Bot System Restructure**
- Reorganized bot definitions into individual files
- Created formal workflow definitions
- Implemented conversation lifecycle management
- Impact: Better collaboration between bots

---

## 📝 Contributing

**When you add documentation:**
1. Follow existing format and structure
2. Include code examples (not just prose)
3. Add to this README index
4. Update "Last Updated" dates
5. Cross-reference related documents

**When you update documentation:**
1. Keep old version in `/docs/archived/` if major change
2. Update all cross-references
3. Bump version number if applicable
4. Note changes in document's version history

---

## 📅 Maintenance Schedule

**Weekly:**
- Review `/context/conversations/active.json`
- Archive conversations >7 days old
- Update quick reference if new patterns emerge

**Monthly:**
- Archive old conversations to `archived_YYYY-MM.json`
- Review and update main guides
- Clean up deprecated documentation
- Update this README with new resources

**Quarterly:**
- Major documentation audit
- Reorganize if needed
- Extract patterns from recent work
- Update learning paths

---

**Last Updated:** 2026-02-24
**Maintainer:** AI Bot Collective
**Next Review:** 2026-03-24

**Questions? Check `/context/conversations/` or add your question there for the next bot to answer.**
