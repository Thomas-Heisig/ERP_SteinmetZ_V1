# Explanations

**Understanding-oriented conceptual content**

Explanations clarify and illuminate particular topics. They are understanding-oriented and provide context, background, and alternative perspectives.

## Available Explanations

### Architecture & Design

#### System Architecture Overview

**Path:** [ARCHITECTURE.md](../ARCHITECTURE.md)  
**Topics:** System design, patterns, production-readiness

Deep dive into:

- High-level architecture
- Component interactions
- Data flow patterns
- Resilience patterns (SAGA, Circuit Breaker)
- Production considerations

#### Architecture Decision Records (ADR)

**Path:** [adr/README.md](../adr/README.md)  
**Topics:** Why we made specific technical decisions

Understanding key decisions:

- ADR 001: Monorepo Structure - Why monorepo?
- ADR 002: TypeScript Adoption - Benefits and tradeoffs
- ADR 003: Multi-Provider AI System - AI flexibility
- ADR 004: SQLite for Development - Database choices
- ADR 005: React 19 for Frontend - Modern React

#### Design Patterns

**Status:** Planned  
**Topics:** Patterns used throughout the codebase

Common patterns explained:

- Repository pattern
- Service layer pattern
- Factory pattern
- Observer pattern
- Dependency injection

---

### Advanced Features

#### AI Annotator Workflow

**Path:** [AI_ANNOTATOR_WORKFLOW.md](../AI_ANNOTATOR_WORKFLOW.md)  
**Topics:** How AI annotation works end-to-end

Understanding the AI annotation process:

- 15,472 function nodes processing
- Metadata generation
- PII classification
- Quality assurance
- Batch processing strategies

#### Function Node Transformation

**Path:** [FUNCTION_NODE_TRANSFORMATION.md](../FUNCTION_NODE_TRANSFORMATION.md)  
**Topics:** Markdown to code generation

How functions become executable:

- Instruction-driven ERP concept
- Code generation process
- From specification to implementation
- Testing generated code
- International standards (ISO/IEC 25010)

#### Performance Features

**Path:** [PERFORMANCE_FEATURES.md](../PERFORMANCE_FEATURES.md)  
**Topics:** How performance optimizations work

Understanding optimizations:

- API caching with TTL
- WebSocket real-time updates
- Query performance monitoring
- Frontend lazy loading
- Code splitting strategies

#### Advanced Features

**Path:** [ADVANCED_FEATURES.md](../ADVANCED_FEATURES.md)  
**Topics:** Cutting-edge capabilities

Advanced system features:

- Real-time collaboration
- Advanced search
- AI-powered workflows
- Process automation

---

### Security & Compliance

#### Authentication System

**Path:** [AUTHENTICATION.md](../AUTHENTICATION.md)  
**Topics:** How authentication works

Understanding auth:

- JWT token system
- Role-based access control (RBAC)
- Token refresh flow
- Security considerations

#### Compliance & Security

**Path:** [COMPLIANCE.md](../COMPLIANCE.md)  
**Topics:** GDPR, GoBD, security standards

Understanding compliance:

- Data privacy (GDPR)
- German accounting regulations (GoBD)
- Audit trail
- Security best practices

#### Security Model

**Status:** Planned  
**Topics:** Security architecture

Security concepts:

- Threat model
- Defense in depth
- Authentication vs Authorization
- Data encryption
- Secure communication

---

### Concepts & Philosophy

#### Project Vision & Concept

**Path:** [concept/\_0_KONZEPT.md](../concept/_0_KONZEPT.md)  
**Topics:** Original project vision

Understanding the vision:

- Instruction-driven ERP concept
- AI as moderator philosophy
- Flexible architecture principles
- Self-documenting systems

#### Roadmap & Evolution

**Path:** [concept/\_ROADMAP.md](../concept/_ROADMAP.md)  
**Topics:** Project evolution and future

Understanding the journey:

- Past milestones
- Current status
- Future plans
- Long-term vision

#### Error Handling Philosophy

**Path:** [ERROR_STANDARDIZATION_GUIDE.md](../ERROR_STANDARDIZATION_GUIDE.md)  
**Topics:** Why standardized errors matter

Understanding error design:

- Benefits of standardization
- Error handling patterns
- User experience considerations
- Debugging strategies

---

### AI & Machine Learning

#### AI Concepts

**Status:** Planned  
**Topics:** AI/ML explained for developers

Understanding AI in ERP:

- What is an LLM?
- Prompt engineering basics
- Context windows
- Token limits
- Model selection

#### Multi-Provider AI Strategy

**Status:** Link to ADR  
**See:** [ADR 003](../adr/003-multi-provider-ai-system.md)  
**Topics:** Why support multiple AI providers

Understanding provider diversity:

- Vendor lock-in avoidance
- Cost optimization
- Reliability through redundancy
- Feature availability

---

## How to Use Explanations

Explanations are for understanding, not for doing:

1. **Want to understand WHY?** - Read explanations
2. **Need context** - Explanations provide background
3. **Comparing approaches** - Learn tradeoffs and alternatives
4. **Deeper knowledge** - Go beyond how-to to why-to

## Explanation Format

Each explanation follows this structure:

- **Overview** - What topic is explained
- **Context** - Background and history
- **Concepts** - Key ideas and principles
- **Alternatives** - Other approaches and tradeoffs
- **Implications** - Consequences of decisions
- **Examples** - Concrete illustrations
- **See Also** - Related explanations

## Contributing Explanations

Want to write an explanation? See:

- [Contributing Guide](../../CONTRIBUTING.md#documentation)
- [Documentation Style Guide](../CODE_CONVENTIONS.md#documentation)

**Explanation Guidelines:**

- Focus on understanding, not instructions
- Provide context and background
- Discuss alternatives and tradeoffs
- Use clear, accessible language
- Include diagrams where helpful

---

## Related Documentation

### Tutorials

Learn by doing:

- [Getting Started](../tutorials/getting-started.md)
- [Building Features](../tutorials/README.md)

### How-To Guides

Solve problems:

- [How-To Index](../how-to/README.md)
- [Practical Guides](../how-to/README.md)

### Reference

Look up details:

- [API Reference](../reference/modules-index.md)
- [Error Codes](../reference/error-codes.md)

---

**Version:** 1.0.0  
**Last Updated:** December 6, 2025  
**Format:** Following [Diátaxis Framework](https://diataxis.fr/)  
**Purpose:** Clarify concepts, provide context, explain decisions
