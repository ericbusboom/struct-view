---
status: pending
---

# MCP Server for AI Model Interface

Add an HTTP-based MCP server that exposes StructView's model as tools for AI
agents. This is expected to be a full sprint due to scope.

## Tools needed

- **Read tools**: Get a description of all nodes, members/beams, and their
  properties (positions, materials, sections, supports, groups, loads).
- **Write tools**: Place nodes and beams, edit properties (position, material,
  section, support type), move nodes, delete nodes/members.
- **Query tools**: Get node by ID, get members connected to a node, get group
  contents, get model summary/stats.

## Key considerations

- HTTP-based transport (not stdio) so external AI agents can connect.
- Server should expose the same model store that the frontend uses, or
  synchronize with it.
- Need to handle concurrent access (AI editing while user is viewing).
- Tool schemas should follow MCP spec for tool definitions with JSON Schema
  input/output.
- Consider whether the server runs as part of the Vite dev server or as a
  separate process.
