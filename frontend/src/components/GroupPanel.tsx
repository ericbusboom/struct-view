import { useModelStore } from '../store/useModelStore'
import { useEditorStore } from '../store/useEditorStore'
import { createGroup } from '../model'

export default function GroupPanel() {
  const groups = useModelStore((s) => s.groups)
  const members = useModelStore((s) => s.members)
  const addGroup = useModelStore((s) => s.addGroup)
  const removeGroup = useModelStore((s) => s.removeGroup)
  const updateNode = useModelStore((s) => s.updateNode)
  const updateMember = useModelStore((s) => s.updateMember)

  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds)
  const selectedGroupId = useEditorStore((s) => s.selectedGroupId)
  const selectGroup = useEditorStore((s) => s.selectGroup)
  const clearSelection = useEditorStore((s) => s.clearSelection)

  const hasSelection = selectedNodeIds.size > 0

  const handleCreateGroup = () => {
    if (!hasSelection) return
    const name = `Group ${groups.length + 1}`
    const nodeIds = [...selectedNodeIds]
    // Include members whose both endpoints are in the selection
    const memberIds = members
      .filter((m) => selectedNodeIds.has(m.start_node) && selectedNodeIds.has(m.end_node))
      .map((m) => m.id)

    const group = createGroup(name, { nodeIds, memberIds })

    // Set groupId on nodes and members
    for (const nid of nodeIds) updateNode(nid, { groupId: group.id })
    for (const mid of memberIds) updateMember(mid, { groupId: group.id })

    addGroup(group)
    selectGroup(group.id)
  }

  const handleDeleteGroup = (id: string) => {
    removeGroup(id)
    if (selectedGroupId === id) clearSelection()
  }

  return (
    <div className="group-panel">
      <div className="group-panel-header">
        <span>Groups</span>
        <button
          className="tool-btn"
          disabled={!hasSelection}
          onClick={handleCreateGroup}
          title="Create group from selected nodes"
        >
          + Group
        </button>
      </div>
      {groups.length === 0 ? (
        <div className="group-panel-empty">
          No groups yet. Select nodes and click "+ Group".
        </div>
      ) : (
        <div className="group-panel-list">
          {groups.map((g) => (
            <div
              key={g.id}
              className={`group-panel-item ${selectedGroupId === g.id ? 'selected' : ''}`}
              onClick={() => selectGroup(g.id)}
            >
              <div className="group-panel-item-info">
                <span className="group-panel-item-name">{g.name}</span>
                <span className="group-panel-item-count">
                  {g.nodeIds.length}N / {g.memberIds.length}M
                </span>
              </div>
              <button
                className="tool-btn group-panel-delete"
                onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id) }}
                title="Delete group"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
