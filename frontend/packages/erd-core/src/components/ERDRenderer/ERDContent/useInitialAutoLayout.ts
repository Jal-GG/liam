import {
  addHiddenNodeIds,
  updateActiveTableName,
  updateShowMode,
} from '@/stores'
import {
  getActiveTableNameFromUrl,
  getHiddenNodeIdsFromUrl,
  getShowModeFromUrl,
} from '@/utils'
import { type Node, useReactFlow } from '@xyflow/react'
import { useEffect, useMemo } from 'react'
import { useERDContentContext } from './ERDContentContext'
import { highlightNodesAndEdges } from './highlightNodesAndEdges'
import { useAutoLayout } from './useAutoLayout'

export const useInitialAutoLayout = (
  nodes: Node[],
  shouldFitViewToActiveTable: boolean,
) => {
  const tableNodesInitialized = useMemo(
    () =>
      nodes
        .filter((node) => node.type === 'table')
        .some((node) => node.measured) || nodes.length === 1,
    [nodes],
  )
  const { getEdges } = useReactFlow()

  const {
    state: { initializeComplete },
  } = useERDContentContext()
  const { handleLayout } = useAutoLayout()

  useEffect(() => {
    const initialize = async () => {
      if (initializeComplete) {
        return
      }

      const activeTableName = getActiveTableNameFromUrl()
      updateActiveTableName(activeTableName)
      const hiddenNodeIds = await getHiddenNodeIdsFromUrl()
      addHiddenNodeIds(hiddenNodeIds)
      const edges = getEdges()
      const hiddenNodes = nodes.map((node) => ({
        ...node,
        hidden: hiddenNodeIds.includes(node.id),
      }))
      const { nodes: updatedNodes, edges: updatedEdges } =
        highlightNodesAndEdges(hiddenNodes, edges, { activeTableName })

      const fitViewOptions =
        shouldFitViewToActiveTable && activeTableName
          ? { maxZoom: 1, duration: 300, nodes: [{ id: activeTableName }] }
          : undefined

      const showMode = getShowModeFromUrl()
      updateShowMode(showMode)

      if (tableNodesInitialized) {
        handleLayout(updatedNodes, updatedEdges, fitViewOptions)
      }
    }

    initialize()
  }, [
    tableNodesInitialized,
    initializeComplete,
    handleLayout,
    nodes,
    getEdges,
    shouldFitViewToActiveTable,
  ])
}
