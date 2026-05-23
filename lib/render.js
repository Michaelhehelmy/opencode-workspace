const fs = require('fs');
const path = require('path');
const Mustache = require('mustache');

// Resolve directories
const WORKSPACE_DIR = path.resolve(__dirname, '..');
const PROJECT_DIR = path.resolve(WORKSPACE_DIR, '..');

// Load config (check parent first, then fallback to local directory for development/testing)
let configPath = path.join(PROJECT_DIR, 'workspace.config.json');
let targetProjectDir = PROJECT_DIR;

if (!fs.existsSync(configPath)) {
  const fallbackPath = path.join(WORKSPACE_DIR, 'workspace.config.json');
  if (fs.existsSync(fallbackPath)) {
    configPath = fallbackPath;
    targetProjectDir = WORKSPACE_DIR;
  } else {
    console.error(`❌ Error: workspace.config.json not found at ${configPath} or ${fallbackPath}`);
    process.exit(1);
  }
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Format some values for Mustache helpers
const view = {
  ...config,
  // Tech helper flags
  nextjs: config.tech.framework?.toLowerCase().includes('next.js') || config.tech.framework?.toLowerCase().includes('nextjs'),
  tailwind: config.tech.styling?.toLowerCase().includes('tailwind'),
  sqlite: config.tech.database?.toLowerCase().includes('sqlite'),
  drizzle: config.tech.database?.toLowerCase().includes('drizzle') || config.tech.framework?.toLowerCase().includes('drizzle') || true,

  // Flat helpers for template simplicity
  projectName: config.project.name,
  projectSlug: config.project.slug,
  projectDescription: config.project.description,
  projectAuthor: config.project.author,
  projectGithub: config.project.github,
  projectUrl: config.project.url,

  techFramework: config.tech.framework,
  techLanguage: config.tech.language,
  techDatabase: config.tech.database,
  techDbFile: config.tech.db_file,
  techStyling: config.tech.styling,
  techUnit: config.tech.test_unit,
  techE2e: config.tech.test_e2e,
  techPackageManager: config.tech.package_manager,

  deployMethod: config.deploy?.method,
  deployScript: config.deploy?.script,
  deploySshKey: config.deploy?.ssh_key,
  deployRemoteUser: config.deploy?.remote_user,
  deployRemoteHost: config.deploy?.remote_host,
  deployPm2App: config.deploy?.pm2_app,
  deployLogFile: config.deploy?.log_file,

  rulesList: (config.rules || []).map(r => `- ${r}`).join('\n')
};

// Define template maps: [Template Path relative to WORKSPACE_DIR/templates, Dest Path relative to PROJECT_DIR]
const templateFiles = [
  ['opencode.json.tmpl', 'opencode.json'],
  ['AGENTS.md.tmpl', 'AGENTS.md'],
  ['AGENT_LOGBOOK.md.tmpl', 'AGENT_LOGBOOK.md'],
  
  // Prompts
  ['prompts/project-context.md.tmpl', '.opencode/prompts/project-context.md'],
  ['prompts/safety-rules.md.tmpl', '.opencode/prompts/safety-rules.md'],

  // Skills
  ['skills/db-migration/SKILL.md.tmpl', '.opencode/skills/db-migration/SKILL.md'],
  ['skills/deploy-to-server/SKILL.md.tmpl', '.opencode/skills/deploy-to-server/SKILL.md'],
  ['skills/create-feature/SKILL.md.tmpl', '.opencode/skills/create-feature/SKILL.md'],
  ['skills/new-e2e-test/SKILL.md.tmpl', '.opencode/skills/new-e2e-test/SKILL.md'],
  ['skills/fix-failing-test/SKILL.md.tmpl', '.opencode/skills/fix-failing-test/SKILL.md'],
  ['skills/frontend-feature/SKILL.md.tmpl', '.opencode/skills/frontend-feature/SKILL.md'],
];

// Conditionally render agents based on workspace.config.json
if (config.agents?.deploy) {
  templateFiles.push(['agents/deploy.md.tmpl', '.opencode/agents/deploy.md']);
}
if (config.agents?.qa) {
  templateFiles.push(['agents/qa.md.tmpl', '.opencode/agents/qa.md']);
}
if (config.agents?.db) {
  templateFiles.push(['agents/db.md.tmpl', '.opencode/agents/db.md']);
}
if (config.agents?.['plugin-dev']) {
  templateFiles.push(['agents/plugin-dev.md.tmpl', '.opencode/agents/plugin-dev.md']);
}
if (config.agents?.frontend) {
  templateFiles.push(['agents/frontend.md.tmpl', '.opencode/agents/frontend.md']);
}

// Conditionally render tools
if (config.deploy?.remote_host) {
  templateFiles.push(['tools/check-server.ts.tmpl', '.opencode/tools/check-server.ts']);
}
if (config.tech?.test_unit || config.tech?.test_e2e) {
  templateFiles.push(['tools/run-tests.ts.tmpl', '.opencode/tools/run-tests.ts']);
}

console.log('🔄 Rendering templates...');

for (const [tmplRel, destRel] of templateFiles) {
  const tmplPath = path.join(WORKSPACE_DIR, 'templates', tmplRel);
  const destPath = path.join(targetProjectDir, destRel);

  if (!fs.existsSync(tmplPath)) {
    console.warn(`⚠️ Warning: Template not found: ${tmplPath}`);
    continue;
  }

  // Skip AGENT_LOGBOOK.md if it already exists to preserve agent memory/history
  if (destRel === 'AGENT_LOGBOOK.md' && fs.existsSync(destPath)) {
    console.log(`  ℹ️ Skipped (already exists): ${destRel}`);
    continue;
  }

  // Read template
  const templateContent = fs.readFileSync(tmplPath, 'utf8');

  // Render content
  let renderedContent = Mustache.render(templateContent, view);

  // If destination is a JSON file, clean up trailing commas and empty items
  if (destRel.endsWith('.json')) {
    // Remove trailing commas before closing braces/brackets
    renderedContent = renderedContent.replace(/,(\s*[\]}])/g, '$1');
    // Remove double commas or leading commas
    renderedContent = renderedContent.replace(/\[\s*,/g, '[').replace(/\{\s*,/g, '{');
    // Try to format it for neatness
    try {
      renderedContent = JSON.stringify(JSON.parse(renderedContent), null, 2);
    } catch (e) {
      console.warn(`⚠️ Warning: Generated JSON for ${destRel} is invalid: ${e.message}`);
    }
  }

  // Ensure target directory exists
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(destPath, renderedContent, 'utf8');
  console.log(`  ✅ Generated: ${destRel}`);
}

console.log('🎉 Templates successfully rendered!');
