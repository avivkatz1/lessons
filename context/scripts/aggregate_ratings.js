#!/usr/bin/env node

/**
 * Bot Rating System - Aggregation Script
 *
 * This script:
 * 1. Parses structured RATING comments from conversation files
 * 2. Updates bot_ratings.json with new ratings
 * 3. Updates badges in MASTER_BOT_CONVERSATIONS.md
 * 4. Generates analytics report
 *
 * Usage: node aggregate_ratings.js
 * Or: npm run aggregate-ratings
 */

const fs = require('fs');
const path = require('path');

// Paths
const CONTEXT_DIR = path.join(__dirname, '..');
const CONVERSATIONS_DIR = path.join(CONTEXT_DIR, 'conversations');
const RATINGS_FILE = path.join(CONTEXT_DIR, 'bot_ratings.json');
const MASTER_DOC_FILE = path.join(CONTEXT_DIR, 'MASTER_BOT_CONVERSATIONS.md');
const ANALYTICS_FILE = path.join(CONTEXT_DIR, 'analytics_report.md');

console.log('🤖 Bot Rating System - Aggregation Script');
console.log('==========================================\n');

// Load current ratings data
function loadRatingsData() {
  if (fs.existsSync(RATINGS_FILE)) {
    return JSON.parse(fs.readFileSync(RATINGS_FILE, 'utf8'));
  }

  // Return empty structure if file doesn't exist
  return {
    version: '1.0',
    last_updated: new Date().toISOString(),
    master_document_sections: {},
    conversations: {},
    analytics: {
      top_sections: [],
      top_conversations: [],
      by_role: {},
      zero_rated_sections: [],
      pruning_candidates: { low_value: [], combine_candidates: [] }
    }
  };
}

// Parse structured RATING comments from markdown/text files
function parseRatingsFromText(content, sourceFile) {
  const ratings = [];

  // Regex to match RATING blocks:
  // **RATING:**
  // - Section: `section_id`
  // - Reason: optional reason
  // - Helpful: Yes
  const ratingRegex = /\*\*RATING:\*\*\s*\n\s*-\s*Section:\s*`([^`]+)`\s*\n\s*-\s*Reason:\s*(.+?)\s*\n\s*-\s*Helpful:\s*Yes/gi;

  let match;
  while ((match = ratingRegex.exec(content)) !== null) {
    const sectionId = match[1];
    const reason = match[2];

    ratings.push({
      type: 'section',
      section_id: sectionId,
      reason: reason || '',
      source_file: path.basename(sourceFile),
      timestamp: new Date().toISOString()
    });
  }

  // Also match conversation ratings:
  // **RATING:**
  // - Conversation: `conversation_id`
  // - Reason: optional reason
  // - Helpful: Yes
  const convRatingRegex = /\*\*RATING:\*\*\s*\n\s*-\s*Conversation:\s*`?([^`\n]+)`?\s*\n\s*-\s*Reason:\s*(.+?)\s*\n\s*-\s*Helpful:\s*Yes/gi;

  while ((match = convRatingRegex.exec(content)) !== null) {
    const conversationId = match[1];
    const reason = match[2];

    ratings.push({
      type: 'conversation',
      conversation_id: conversationId,
      reason: reason || '',
      source_file: path.basename(sourceFile),
      timestamp: new Date().toISOString()
    });
  }

  return ratings;
}

// Scan all conversation files for new ratings
function scanConversationsForRatings() {
  console.log('📂 Scanning conversation files for new ratings...\n');

  const allRatings = [];
  const files = fs.readdirSync(CONVERSATIONS_DIR);

  for (const file of files) {
    if (!file.endsWith('.md') && !file.endsWith('.json')) continue;

    const filePath = path.join(CONVERSATIONS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Parse ratings from markdown files
    if (file.endsWith('.md')) {
      const ratings = parseRatingsFromText(content, filePath);
      if (ratings.length > 0) {
        console.log(`  ✓ Found ${ratings.length} rating(s) in ${file}`);
        allRatings.push(...ratings);
      }
    }
  }

  console.log(`\n✅ Total new ratings found: ${allRatings.length}\n`);
  return allRatings;
}

// Update ratings data with new ratings
function updateRatingsData(ratingsData, newRatings) {
  console.log('📝 Updating ratings data...\n');

  for (const rating of newRatings) {
    if (rating.type === 'section') {
      const sectionId = rating.section_id;

      if (!ratingsData.master_document_sections[sectionId]) {
        console.log(`  ⚠️  Section "${sectionId}" not found, skipping`);
        continue;
      }

      const section = ratingsData.master_document_sections[sectionId];

      // Add new rating
      section.ratings.push({
        bot_role: 'unknown',  // Could be inferred from source file
        timestamp: rating.timestamp,
        reason: rating.reason,
        source_file: rating.source_file
      });

      // Update score and unique bots
      section.score = section.ratings.length;
      const uniqueBots = new Set(section.ratings.map(r => r.bot_role));
      section.unique_bots = uniqueBots.size;

      console.log(`  ✓ Updated ${sectionId}: score ${section.score}, unique_bots ${section.unique_bots}`);
    }

    if (rating.type === 'conversation') {
      const convId = rating.conversation_id;

      if (!ratingsData.conversations[convId]) {
        ratingsData.conversations[convId] = {
          conversation_id: convId,
          overall_score: 0,
          unique_bots: 0,
          ratings: [],
          linked_sections: []
        };
      }

      const conv = ratingsData.conversations[convId];

      // Add new rating
      conv.ratings.push({
        bot_role: 'unknown',
        timestamp: rating.timestamp,
        reason: rating.reason,
        source_file: rating.source_file
      });

      // Update score
      conv.overall_score = conv.ratings.length;
      const uniqueBots = new Set(conv.ratings.map(r => r.bot_role));
      conv.unique_bots = uniqueBots.size;

      console.log(`  ✓ Updated conversation ${convId}: score ${conv.overall_score}`);
    }
  }

  ratingsData.last_updated = new Date().toISOString();
  console.log('\n✅ Ratings data updated\n');

  return ratingsData;
}

// Update badges in MASTER_BOT_CONVERSATIONS.md
function updateBadges(ratingsData) {
  console.log('🏷️  Updating badges in MASTER_BOT_CONVERSATIONS.md...\n');

  let content = fs.readFileSync(MASTER_DOC_FILE, 'utf8');
  let updatesCount = 0;

  for (const [sectionId, data] of Object.entries(ratingsData.master_document_sections)) {
    const score = data.score || 1;
    const uniqueBots = data.unique_bots || 1;

    // Update badge: ⭐ X | 👤 Y
    // Find pattern: <!-- SECTION_ID: section_id -->\n### Title ⭐ X | 👤 Y
    const regex = new RegExp(
      `(<!-- SECTION_ID: ${sectionId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} -->\\s*\\n### .+?) ⭐ \\d+ \\| 👤 \\d+`,
      'g'
    );

    const replacement = `$1 ⭐ ${score} | 👤 ${uniqueBots}`;
    const newContent = content.replace(regex, replacement);

    if (newContent !== content) {
      content = newContent;
      updatesCount++;
      console.log(`  ✓ Updated badge for ${sectionId}: ⭐ ${score} | 👤 ${uniqueBots}`);
    }
  }

  fs.writeFileSync(MASTER_DOC_FILE, content, 'utf8');
  console.log(`\n✅ Updated ${updatesCount} badges\n`);
}

// Generate analytics
function generateAnalytics(ratingsData) {
  console.log('📊 Generating analytics...\n');

  const sections = Object.values(ratingsData.master_document_sections);
  const conversations = Object.values(ratingsData.conversations);

  // Top sections
  const topSections = sections
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(s => ({
      section_id: s.section_id,
      title: s.section_title,
      score: s.score,
      unique_bots: s.unique_bots
    }));

  // Top conversations
  const topConversations = conversations
    .sort((a, b) => b.overall_score - a.overall_score)
    .slice(0, 10);

  // Zero-rated sections
  const zeroRated = sections
    .filter(s => s.score === 1)  // Still at initial value
    .map(s => s.section_id);

  // By role (simplified for now)
  const byRole = {};

  ratingsData.analytics = {
    top_sections: topSections,
    top_conversations: topConversations,
    zero_rated_sections: zeroRated,
    by_role: byRole,
    pruning_candidates: {
      low_value: zeroRated.slice(0, 5),  // Top 5 never-rated sections
      combine_candidates: []
    }
  };

  console.log(`  ✓ Top 10 sections identified`);
  console.log(`  ✓ ${zeroRated.length} zero-rated sections found`);
  console.log('\n✅ Analytics generated\n');

  return ratingsData;
}

// Write analytics report
function writeAnalyticsReport(ratingsData) {
  console.log('📄 Writing analytics report...\n');

  const { analytics } = ratingsData;
  const timestamp = new Date().toISOString();

  let report = `# Bot Rating System - Analytics Report
**Generated:** ${timestamp}

## 📊 Overview
- Total sections: ${Object.keys(ratingsData.master_document_sections).length}
- Zero-rated sections: ${analytics.zero_rated_sections.length}
- Total conversations: ${Object.keys(ratingsData.conversations).length}

## 🌟 Top 10 Sections (by score)

`;

  analytics.top_sections.forEach((section, i) => {
    report += `${i + 1}. **${section.title}** - ⭐ ${section.score} | 👤 ${section.unique_bots}\n`;
    report += `   - ID: \`${section.section_id}\`\n\n`;
  });

  report += `## 📚 Top Conversations\n\n`;

  analytics.top_conversations.forEach((conv, i) => {
    report += `${i + 1}. **${conv.conversation_id}** - ⭐ ${conv.overall_score}\n\n`;
  });

  report += `## ⚠️ Zero-Rated Sections (never used)\n\n`;

  if (analytics.zero_rated_sections.length > 0) {
    analytics.zero_rated_sections.forEach(sectionId => {
      report += `- \`${sectionId}\`\n`;
    });
  } else {
    report += `*All sections have been rated!*\n`;
  }

  report += `\n---\n\n**Last Updated:** ${timestamp}\n`;

  fs.writeFileSync(ANALYTICS_FILE, report, 'utf8');
  console.log(`✅ Analytics report written to ${path.basename(ANALYTICS_FILE)}\n`);
}

// Main execution
function main() {
  try {
    // 1. Load current ratings
    let ratingsData = loadRatingsData();
    console.log(`📥 Loaded ${Object.keys(ratingsData.master_document_sections).length} sections from ratings file\n`);

    // 2. Scan for new ratings
    const newRatings = scanConversationsForRatings();

    // 3. Update ratings data
    if (newRatings.length > 0) {
      ratingsData = updateRatingsData(ratingsData, newRatings);
    } else {
      console.log('ℹ️  No new ratings found, skipping update\n');
    }

    // 4. Generate analytics
    ratingsData = generateAnalytics(ratingsData);

    // 5. Save updated ratings
    fs.writeFileSync(RATINGS_FILE, JSON.stringify(ratingsData, null, 2), 'utf8');
    console.log(`💾 Saved updated ratings to ${path.basename(RATINGS_FILE)}\n`);

    // 6. Update badges
    updateBadges(ratingsData);

    // 7. Write analytics report
    writeAnalyticsReport(ratingsData);

    console.log('✅ Aggregation complete!\n');
    console.log('Summary:');
    console.log(`  - Sections tracked: ${Object.keys(ratingsData.master_document_sections).length}`);
    console.log(`  - Conversations tracked: ${Object.keys(ratingsData.conversations).length}`);
    console.log(`  - New ratings processed: ${newRatings.length}`);
    console.log(`  - Zero-rated sections: ${ratingsData.analytics.zero_rated_sections.length}`);

  } catch (error) {
    console.error('\n❌ Error during aggregation:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
