# OpenCode Workspace Template

A universal, self-contained, portable developer environment for **OpenCode AI** agents.

Drop this repository into any project, customize a single configuration file, run one script, and your AI agent is instantly equipped with custom role-based prompts, project context, safety rules, local/vendored MCP tools, and project-specific skills.

---

## Features

- **Single Source of Truth**: Define project details, tech stack, deploy scripts, and active agents in `workspace.config.json`.
- **Mustache-based Template Engine**: All agent prompt files (`.opencode/agents/`), custom skills (`.opencode/skills/`), tools (`.opencode/tools/`), and system config files (`opencode.json` & `AGENTS.md`) are generated automatically.
- **Offline / Portable MCPs**: Installs standard MCP servers locally in `.opencode/node_modules/` to prevent version drift and enable offline work.
- **Conditional Scaffolding**: Only generates active agents (e.g. `@deploy`, `@qa`, `@db`) and custom tools that match your project settings.

---

## Installation & Setup

### Step 1: Install OpenCode (if not already installed)
```bash
curl -fsSL https://opencode.ai/install | sh
```

### Step 2: Clone this template as `.opencode` in your project
```bash
cd your-project
git clone git@github.com:Michaelhehelmy/opencode-workspace.git .opencode
```

### Step 3: Create and edit your config
Copy the template configuration file to the root of your project:
```bash
cp .opencode/workspace.config.json workspace.config.json
```

Open `workspace.config.json` in your editor and adjust it for your project:
```json
{
  "project": {
    "name": "MyProject",
    "slug": "myproject",
    "description": "A cool web application",
    "author": "Your Name",
    "github": "username/repo"
  },
  "tech": {
    "framework": "Next.js 14 App Router",
    "language": "TypeScript",
    "database": "SQLite",
    "db_file": "app.db",
    "styling": "Tailwind CSS v3",
    "test_unit": "Vitest",
    "test_e2e": "Playwright",
    "package_manager": "npm"
  }
}
```

### Step 4: Run the Bootstrap Script
```bash
bash .opencode/setup.sh
```

This will:
1. Install template rendering utilities and MCP servers.
2. Render and output `opencode.json` and `AGENTS.md` in the project root.
3. Scaffold your customized `.opencode/agents`, `.opencode/prompts`, `.opencode/skills`, and `.opencode/tools`.

### Step 5: Start Coding
```bash
opencode
```

---

## Managing Your Repository's GitIgnore

Add the following to your project's `.gitignore` file to keep the repository clean while preserving the workspace configuration:

```gitignore
# OpenCode Workspace Runtime Files
.opencode/node_modules/
.opencode/package-lock.json
.opencode/bun.lock
.opencode/ocx.jsonc
```

This keeps all prompts, skills, tools, and setup scripts tracked in git, while ignoring local build artifacts and node_modules.

---

## Author
Developed and maintained by **Michael Helmy**.
