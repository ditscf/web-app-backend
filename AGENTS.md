# DITSCF-MS — Agent Instructions

## Project Context

This directory is the DITSCF-MS backend only. It is a separate project from the frontend. Do not add frontend code here, and do not turn the parent folder into a monorepo or shared workspace.

DITSCF-MS is a Fellowship Management System being designed for DITSCF.

The project is currently in the requirements and system-design phase. The technology stack and implementation architecture have not yet been finalized.

The project should evolve from documented requirements and team decisions rather than assumptions.

## Source of Truth

Before making decisions or producing artifacts, inspect the relevant project documentation.

Current primary documents:

- `docs/Project Vision.md`
- `docs/Project BRS.md`

Do not invent requirements, business rules, workflows, actors, or technical constraints that are not supported by project documentation or explicitly approved decisions.

When information is unclear or missing:

- identify it as an unknown or assumption;
- do not silently make it a requirement;
- ask for clarification when necessary.

## Engineering Principles

- Keep business requirements separate from technical implementation decisions.
- Prefer simple, maintainable solutions.
- Avoid premature technology or architecture decisions.
- Preserve existing approved business rules.
- Document significant architectural and technical decisions.
- Avoid unrelated changes.
- Verify work before considering a task complete.

## System Design

System design should progress incrementally:

1. Requirements
2. Actors and business capabilities
3. Business workflows and lifecycle states
4. Conceptual system model
5. Architecture
6. Technology selection
7. Detailed technical design
8. Implementation
9. Testing and deployment

Do not skip directly from requirements to implementation.

## AI Agent Behavior

The agent should:

- inspect relevant files before acting;
- explain important assumptions;
- distinguish facts, requirements, decisions, and assumptions;
- identify conflicts or gaps in requirements;
- avoid making architectural decisions without sufficient context;
- keep generated artifacts consistent with approved project decisions.

The human project team remains responsible for approving requirements and architectural decisions.

## MCP Usage

MCP servers may be used to extend the agent's capabilities.

When an MCP provides a suitable capability, use it where appropriate rather than manually reproducing the same workflow.

However:

- do not use an MCP tool simply because it is available;
- inspect the available capability before using it;
- do not assume an MCP supports a capability it does not expose;
- do not fabricate tool results;
- review MCP-generated artifacts before treating them as approved project decisions.

MCP-specific workflows and decisions should be documented under `docs/mcp/`.

## Current Phase

The project is currently focused on understanding the requirements and developing the first conceptual system design.

Do not introduce implementation technologies until the project team has discussed and approved the relevant technical decisions.
