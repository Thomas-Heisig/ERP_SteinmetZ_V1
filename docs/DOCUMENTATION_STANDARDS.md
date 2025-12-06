# Documentation Standards

**Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Status:** Active

This document defines the documentation standards and practices for ERP SteinmetZ, ensuring consistency, quality, and compliance with international standards.

## 📘 International Standards Compliance

ERP SteinmetZ documentation follows these international standards:

### ISO/IEC/IEEE Standards

#### ISO/IEC/IEEE 26514:2022

**Design of user documentation**

Applied principles:

- Audience analysis and user personas
- Clear, consistent language
- Logical information architecture
- Task-oriented content
- Accessibility considerations

#### ISO/IEC/IEEE 26512:2018

**Acquisition and supply of software user documentation**

Applied principles:

- Documentation planning and management
- Quality criteria for documentation
- Documentation deliverables
- Review and approval processes

#### ISO/IEC 25010:2011

**Software quality model**

Documentation quality characteristics:

- **Functional suitability** - Documentation serves its purpose
- **Performance efficiency** - Quick to find information
- **Usability** - Easy to understand and navigate
- **Maintainability** - Easy to update and maintain

### Documentation Frameworks

#### Diátaxis Framework

**Four-category documentation structure**

1. **Tutorials** (Learning-oriented)
   - Step-by-step lessons
   - Complete project examples
   - Building confidence
   - Location: `docs/tutorials/`

2. **How-To Guides** (Problem-oriented)
   - Practical recipes
   - Solving specific problems
   - Goal-oriented
   - Location: `docs/how-to/`

3. **Reference** (Information-oriented)
   - Technical specifications
   - Complete coverage
   - Lookup information
   - Location: `docs/reference/`

4. **Explanation** (Understanding-oriented)
   - Conceptual clarification
   - Background and context
   - Alternative perspectives
   - Location: `docs/explanation/`

**Benefits:**

- Clear separation of concerns
- Users find what they need quickly
- Easier to maintain
- Scales well

### Other Standards

- **OpenAPI 3.0** - API documentation format
- **JSON Schema Draft-07** - Data validation documentation
- **Semantic Versioning** - Documentation versioning
- **Keep a Changelog** - Change documentation format
- **Conventional Commits** - Commit message standards
- **Markdown CommonMark** - Markdown specification

---

## 📁 Documentation Structure

```
ERP_SteinmetZ_V1/
├── README.md                      # Project overview
├── README_COMPREHENSIVE.md        # Complete technical docs
├── CONTRIBUTING.md                # Contribution guidelines
├── CODE_OF_CONDUCT.md            # Community standards
├── SECURITY.md                    # Security policy
├── SUPPORT.md                     # Getting help
├── CHANGELOG.md                   # Version history
├── TODO.md                        # Task list
├── ISSUES.md                      # Known issues
├── ARCHIVE.md                     # Historical records
│
└── docs/
    ├── README.md                  # Documentation hub
    │
    ├── tutorials/                 # Learning-oriented
    │   ├── README.md
    │   └── getting-started.md
    │
    ├── how-to/                    # Problem-oriented
    │   └── README.md
    │
    ├── reference/                 # Information-oriented
    │   ├── README.md
    │   ├── modules-index.md
    │   └── error-codes.md
    │
    ├── explanation/               # Understanding-oriented
    │   └── README.md
    │
    ├── api/                       # API documentation
    │   ├── README.md
    │   └── API_DOCUMENTATION.md
    │
    ├── adr/                       # Architecture decisions
    │   ├── README.md
    │   └── *.md
    │
    ├── concept/                   # Project concept
    │   └── *.md
    │
    ├── archive/                   # Historical docs
    │   └── README.md
    │
    └── *.md                       # Core documentation files
```

---

## ✍️ Writing Guidelines

### Language

- **Primary Language:** English (with German support)
- **Tone:** Professional, friendly, inclusive
- **Voice:** Active voice preferred
- **Person:** Second person ("you") for user-facing docs
- **Tense:** Present tense for current functionality

### Style

#### Headings

```markdown
# H1 - Document Title (One per document)

## H2 - Major Section

### H3 - Subsection

#### H4 - Minor Section
```

#### Code Blocks

Always specify language:

````markdown
```typescript
const example = "Use syntax highlighting";
```
````

````

#### Links
Use descriptive link text:
```markdown
❌ Click [here](link) for more info
✅ See [Contributing Guide](CONTRIBUTING.md) for details
````

#### Lists

- Use `-` for unordered lists
- Use `1.` for ordered lists
- Indent consistently (2 spaces)

#### Emphasis

- `**bold**` for strong emphasis
- `*italic*` for mild emphasis
- `` `code` `` for inline code

### Accessibility

- ✅ Use descriptive link text
- ✅ Provide alt text for images
- ✅ Use proper heading hierarchy
- ✅ Avoid color-only indicators
- ✅ Keep language clear and simple
- ✅ Use inclusive examples

---

## 📊 Documentation Quality Metrics

### Coverage

| Category         | Target | Current |
| ---------------- | ------ | ------- |
| API Endpoints    | 100%   | 95%+    |
| Modules          | 100%   | 95%+    |
| Public Functions | 80%+   | 75%     |
| Error Codes      | 100%   | 100%    |

### Freshness

- **Review Cycle:** Monthly
- **Update Triggers:**
  - Code changes
  - API changes
  - User feedback
  - Version releases

### Quality Indicators

✅ **Clear Navigation** - Users find what they need  
✅ **Accurate** - Information is correct and current  
✅ **Complete** - All features documented  
✅ **Consistent** - Follows standards  
✅ **Accessible** - Works for all users

---

## 🔄 Documentation Workflow

### Creating Documentation

1. **Plan**
   - Identify documentation need
   - Determine category (tutorial/how-to/reference/explanation)
   - Define audience and goals

2. **Write**
   - Follow templates
   - Use clear language
   - Include examples
   - Add code samples

3. **Review**
   - Self-review for clarity
   - Check links and code
   - Verify examples work
   - Test with target audience

4. **Publish**
   - Submit PR
   - Address review comments
   - Merge to main

### Updating Documentation

1. **Identify Change**
   - Code change
   - User feedback
   - Bug fix
   - New feature

2. **Update Docs**
   - Find affected documentation
   - Update content
   - Update examples
   - Check cross-references

3. **Verify**
   - Test updated examples
   - Check links
   - Verify accuracy

4. **Track**
   - Update CHANGELOG.md
   - Update version dates
   - Note what changed

---

## 📝 Templates

### New Tutorial Template

```markdown
# Tutorial: [Title]

**Estimated Time:** X minutes  
**Level:** Beginner/Intermediate/Advanced  
**Prerequisites:** List prerequisites

## What You'll Learn

- Objective 1
- Objective 2

## Step 1: [Action]

Instructions...

## Step 2: [Action]

Instructions...

## Summary

You've learned...

## Next Steps

- [Related Tutorial]
- [Related Guide]
```

### New How-To Guide Template

```markdown
# How to [Task]

**Problem:** What problem this solves  
**Prerequisites:** What you need

## Steps

1. First step
2. Second step
3. Third step

## Verification

How to verify it works

## Troubleshooting

Common issues and solutions

## See Also

- [Related Guide]
- [Reference]
```

### New Reference Template

````markdown
# [Component] Reference

**Version:** X.Y.Z  
**Status:** Stable/Beta

## Overview

Brief description

## API

### Function/Endpoint Name

**Parameters:**

- `param1` (type): Description
- `param2` (type): Description

**Returns:** Return type and description

**Example:**

```typescript
// Code example
```
````

## See Also

- [Related Reference]

````

### New Explanation Template

```markdown
# Understanding [Topic]

**Complexity:** Basic/Intermediate/Advanced

## Overview

What is this about?

## Context

Background and history

## Concepts

Key ideas explained

## Implications

What does this mean for...

## See Also

- [Related Explanation]
- [Architecture Decision]
````

---

## 🎯 Best Practices

### Do's ✅

- ✅ Write for your audience
- ✅ Use concrete examples
- ✅ Keep it updated
- ✅ Link related docs
- ✅ Test all code examples
- ✅ Use proper formatting
- ✅ Include version information
- ✅ Date your documents

### Don'ts ❌

- ❌ Assume prior knowledge
- ❌ Use jargon without explanation
- ❌ Write overly long paragraphs
- ❌ Forget to update with code changes
- ❌ Break links between docs
- ❌ Mix different doc types
- ❌ Use ambiguous pronouns
- ❌ Skip examples

---

## 📚 Resources

### Internal

- [Contributing Guide](../CONTRIBUTING.md)
- [Code Conventions](./CODE_CONVENTIONS.md)
- [Documentation Hub](./README.md)

### External

- [Diátaxis Framework](https://diataxis.fr/)
- [ISO/IEC/IEEE 26514](https://www.iso.org/standard/43073.html)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Markdown Guide](https://www.markdownguide.org/)

---

## 🤝 Contributing

Help improve our documentation:

1. **Report Issues**
   - Outdated information
   - Broken links
   - Unclear explanations
   - Missing examples

2. **Submit Improvements**
   - Fix typos
   - Add examples
   - Clarify content
   - Add translations

3. **Create New Docs**
   - Follow templates
   - Follow standards
   - Get feedback
   - Iterate

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

---

## 📧 Contact

**Documentation Questions?**

- Check [SUPPORT.md](../SUPPORT.md)
- Open an [issue](https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/issues)
- Contact: Thomas Heisig

---

**Document Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Next Review:** March 2026  
**Maintainer:** Thomas Heisig

**Standard Compliance:**  
✅ ISO/IEC/IEEE 26514:2022  
✅ ISO/IEC/IEEE 26512:2018  
✅ Diátaxis Framework  
✅ GitHub Community Standards
