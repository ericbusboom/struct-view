---
status: draft
---

# Sprint 006 Technical Plan

## Architecture Overview

This sprint extends the CoordinatePanel from Sprint 003 with node creation
capability and adds file import utilities. No new stores are needed; all data
flows through useModelStore. The file parsing logic is pure functions with no
external dependencies.

```
New Files:
  src/io/csvImport.ts              -- CSV file parser
  src/io/textImport.ts             -- Text file parser
  src/components/ImportButton.tsx   -- File picker button + import dialog

Modified Files:
  src/components/CoordinatePanel.tsx -- Add create mode (Return to add node),
                                       extend +/- adjustment parsing
  src/App.tsx                       -- Mount ImportButton in sidebar
```

## Component Design

### Component: CoordinatePanel Extension (`components/CoordinatePanel.tsx`)

**Use Cases**: SUC-006-01, SUC-006-02, SUC-006-03

The CoordinatePanel from Sprint 003 operates in two modes:

**Create mode** (no node selected):
- x, y, z fields are empty or retain last-entered values
- Return key triggers: parse all three fields, call
  `useModelStore.addNode({x, y, z})`, clear fields, re-focus x field
- Fields show placeholder text ("x", "y", "z")

**Edit mode** (node selected):
- Fields populate with the selected node's coordinates
- On blur or Return, parse the value:
  - If it starts with `+` or `-` and the rest is numeric, apply relative
    adjustment to the current value
  - Otherwise, treat as absolute value
- Call `useModelStore.updateNode(id, newPosition)`
- After applying a relative adjustment, replace the field contents with the
  resulting absolute value

```ts
function parseCoordinateInput(input: string, currentValue: number): number {
  const trimmed = input.trim()
  if (trimmed.startsWith('+') || trimmed.startsWith('-')) {
    const offset = parseFloat(trimmed)
    if (!isNaN(offset)) return currentValue + offset
  }
  const absolute = parseFloat(trimmed)
  if (!isNaN(absolute)) return absolute
  return currentValue  // invalid input, keep current
}
```

### Component: CSV Import (`io/csvImport.ts`)

**Use Cases**: SUC-006-04

```ts
interface ImportResult {
  nodes: Array<{ x: number, y: number, z: number }>
  skipped: number
  errors: string[]
}

function parseCSV(content: string): ImportResult
```

Logic:
1. Split content by newlines
2. Check first row for header ("x", "y", "z" case-insensitive)
3. For each subsequent row (or all rows if no header):
   - Split by comma
   - Trim whitespace, handle quoted values
   - Parse three numbers
   - If fewer than 3 values or non-numeric, add to skipped count
4. Return parsed nodes and error summary

### Component: Text Import (`io/textImport.ts`)

**Use Cases**: SUC-006-05

```ts
function parseTextFile(content: string): ImportResult
```

Logic:
1. Split content by newlines
2. For each line:
   - Skip blank lines and lines starting with `#` (comments)
   - Split by comma or whitespace (regex: `/[,\s]+/`)
   - Parse three numbers
   - If fewer than 3 values or non-numeric, add to skipped count
3. Return parsed nodes and error summary

### Component: ImportButton (`components/ImportButton.tsx`)

**Use Cases**: SUC-006-04, SUC-006-05

A button in the sidebar that opens a file picker. On file selection:
1. Read file contents via FileReader
2. Detect format (CSV if extension is .csv, otherwise text)
3. Call appropriate parser
4. For each parsed coordinate, call `useModelStore.addNode()`
5. Show a toast or inline message with import summary ("12 nodes imported,
   2 rows skipped")

```tsx
function ImportButton() {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const content = await file.text()
    const result = file.name.endsWith('.csv')
      ? parseCSV(content)
      : parseTextFile(content)
    for (const { x, y, z } of result.nodes) {
      useModelStore.getState().addNode({ x, y, z })
    }
    // Show summary to user
  }
  return <input type="file" accept=".csv,.txt,.dat" onChange={handleFileChange} />
}
```

## Data Flow

```
Coordinate Entry (Create):
  User types x, y, z -> presses Return
  -> parseCoordinateInput() for each field
  -> useModelStore.addNode({x, y, z})
  -> Clear fields, focus x
  -> SceneModel re-renders with new node

Coordinate Entry (Edit):
  User selects node -> fields populate
  -> User edits field -> on blur/Return
  -> parseCoordinateInput(input, currentValue)
  -> useModelStore.updateNode(id, newPosition)

File Import:
  User clicks Import -> selects file
  -> FileReader reads content
  -> parseCSV() or parseTextFile()
  -> Loop: useModelStore.addNode() for each
  -> Show summary toast
  -> SceneModel re-renders with all new nodes
```

## Open Questions

- Should imported nodes be automatically grouped?
  (Recommendation: yes, create a group named after the imported filename)
- Should there be a preview before committing the import?
  (Recommendation: for simplicity, no preview in this sprint. Import and show
  results. User can undo if needed once undo is implemented.)
- Should the coordinate entry support unit suffixes (e.g., "8ft", "2.4m")?
  (Recommendation: defer to a future sprint that implements unit switching)
