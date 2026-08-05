# Branch policy

`main` is the production branch. Cloudflare Pages deploys every push to `main`.

## Who can do what

| Actor | `main` | Feature branches |
| --- | --- | --- |
| **Unobtainiumrock** (owner) | Direct push allowed | Push allowed |
| **Collaborators** | Pull request only; owner approval required | Push allowed |

## Workflow for collaborators

1. Branch from `main`: `git checkout -b feature/your-change`
2. Push the feature branch and open a pull request into `main`
3. Wait for **Unobtainiumrock** to review and merge

Direct pushes and force-pushes to `main` are blocked for non-admins.

## Why the repo is public

GitHub Free only enables branch protection on public repositories. The site itself is already public at [fuckmycofounder.com](https://fuckmycofounder.com).
