# GitLab Issue Fetcher

A Deno CLI tool to fetch and export GitLab issues you've worked on. It scans
projects you've contributed to and generates a JSON report of issues where you
are the author, assignee, or a commenter.

## Features

- **Auto-Discovery**: Automatically finds your User ID and the projects you
  contribute to.
- **Flexible Config**: Use a `.env` file, command-line flags, or interactive
  prompts.
- **Smart Filtering**:
  - `my_issues`: Only issues you created or are assigned to.
  - `all_contributions`: Includes issues where you commented/participated, even
    if not assigned.

## Quick Start (Windows App)

If prefered you can run the app directly with the pre-compiled execuatable

1. **Download** the latest `gitlab-issues.exe` from the **Releases** section.
2. **Generate a Gitlab PAT** with the following scopes:
   - read_api
   - read_user
3. See [CLI Flags](#cli-flags) section for the full list of options 
4. **Double-click** the `.exe` file to run it.
5. **Follow the prompts** on the screen. It will ask for your GitLab URL and
   Token if you haven't set them up beforehand.
6. Once it finishes, look for a new file named `gitlab_issues.json` right next
   to the app.

## Prerequisites

- [Deno](https://deno.com/)
- A GitLab Personal Access Token (PAT)

## Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:dcrendon/gitlab-issues.git
   cd gitlab-issues
   ```

2. **Environment Variables (Optional):** You can create a `.env` file in the
   root directory to save your credentials.
   ```env
   GITLAB_PAT=your_personal_access_token
   GITLAB_URL=https://gitlab.com
   OUT_FILE=gitlab_issues.json
   TIME_RANGE=week
   FETCH_MODE=all_contributions
   ```

## Usage

You can run the tool directly in the CLI:

```bash
deno run main.ts
```

If you haven't set up a `.env` file or provided flags, the tool will
interactively ask for your URL and Token.

### CLI Flags

You can override defaults or environment variables using flags:

| Flag          | Alias     | Description                                               | Default              |
| :------------ | :-------- | :-------------------------------------------------------- | :------------------- |
| `--gitlabPAT` | `--pat`   | Your GitLab Personal Access Token                         | _Interactive_        |
| `--gitlabURL` | `--url`   | GitLab instance URL                                       | _Interactive_        |
| `--outFile`   | `--out`   | Filename for the JSON output                              | `gitlab_issues.json` |
| `--timeRange` | `--range` | Time period to scan (`week`, `month`, `year`, `custom`)   | `week`               |
| `--startDate` | `--start` | Custom start date (`MM-DD-YYYY`) - Required for `custom`  | N/A                  |
| `--endDate`   | `--end`   | Custom end date (`MM-DD-YYYY`) - Required for `custom`    | N/A                  |
| `--fetchMode` | `--mode`  | Scan logic (`my_issues`, `all_contributions`)             | `all_contributions`  |
| `--help`      | `-h`      | Show help message                                         | N/A                  |

**Example:**

```bash
deno run main.ts --range month --mode my_issues --out monthly_report.json
```

## Output

The script generates a JSON file (default: `gitlab_issues.json`) containing the
raw issue data from GitLab, including notes.
