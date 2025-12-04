# Architecture Decision Records (ADR)

This directory contains Architecture Decision Records (ADRs) for the ERP SteinmetZ project.

## What is an ADR?

An Architecture Decision Record (ADR) is a document that captures an important architectural decision made along with its context and consequences.

## ADR Format

Each ADR follows this structure:

```markdown
# [Number]. [Title]

Date: YYYY-MM-DD
Status: [Proposed | Accepted | Deprecated | Superseded]

## Context

What is the issue that we're seeing that is motivating this decision or change?

## Decision

What is the change that we're proposing and/or doing?

## Consequences

What becomes easier or more difficult to do because of this change?

### Positive

- Benefits of this decision

### Negative

- Drawbacks or costs

### Risks

- Potential risks
```

## ADR List

| ADR                                      | Title                                  | Status   | Date       |
| ---------------------------------------- | -------------------------------------- | -------- | ---------- |
| [001](./001-monorepo-structure.md)       | Monorepo Structure with npm Workspaces | Accepted | 2024-12-04 |
| [002](./002-typescript-adoption.md)      | TypeScript for All New Code            | Accepted | 2024-12-04 |
| [003](./003-multi-provider-ai-system.md) | Multi-Provider AI System with Fallback | Accepted | 2024-12-04 |
| [004](./004-sqlite-for-development.md)   | SQLite for Development Database        | Accepted | 2024-12-04 |
| [005](./005-react-19-adoption.md)        | React 19 for Frontend                  | Accepted | 2024-12-04 |

## Creating a New ADR

1. Copy the template from `000-template.md`
2. Number it sequentially (next available number)
3. Fill in all sections
4. Submit for review via pull request
5. Update this README with the new ADR

## ADR Lifecycle

- **Proposed**: Under discussion
- **Accepted**: Approved and implemented
- **Deprecated**: No longer recommended but still in use
- **Superseded**: Replaced by a newer ADR

---

**Last Updated:** December 4, 2024  
**Maintainer:** Thomas Heisig
