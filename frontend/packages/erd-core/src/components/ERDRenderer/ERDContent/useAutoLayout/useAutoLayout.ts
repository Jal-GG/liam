import { useReactFlow } from '@xyflow/react'
import type { Edge, FitViewOptions, Node } from '@xyflow/react'
import { useCallback, useEffect, useState } from 'react'
import { useERDContentContext } from '../ERDContentContext'
import { getElkLayout } from './getElkLayout'

export const useAutoLayout = () => {
  const { setNodes, fitView } = useReactFlow()
  const {
    actions: { setLoading, setInitializeComplete },
  } = useERDContentContext()

  const [layoutComplete, setLayoutComplete] = useState(false)
  const [pendingFitViewOptions, setPendingFitViewOptions] =
    useState<FitViewOptions | null>(null)

  const handleLayout = useCallback(
    async (
      nodes: Node[],
      edges: Edge[],
      fitViewOptions: FitViewOptions = {},
    ) => {
      setLoading(true)
      setPendingFitViewOptions(fitViewOptions)

      const hiddenNodes: Node[] = []
      const visibleNodes: Node[] = []
      for (const node of nodes) {
        if (node.hidden) {
          hiddenNodes.push(node)
        } else {
          visibleNodes.push(node)
        }
      }

      // NOTE: Only include edges where both the source and target are in the nodes
      const nodeMap = new Map(visibleNodes.map((node) => [node.id, node]))
      const visibleEdges = edges.filter((edge) => {
        return nodeMap.get(edge.source) && nodeMap.get(edge.target)
      })

      const newNodes = await getElkLayout({
        nodes: visibleNodes,
        edges: visibleEdges,
      })

      setNodes([...hiddenNodes, ...newNodes])
      setLayoutComplete(true)
    },
    [setNodes, setLoading],
  )

  useEffect(() => {
    if (layoutComplete) {
      // The use of `window.requestAnimationFrame` aligns with practices demonstrated in React Flow examples.
      // ref: https://reactflow.dev/learn/layouting/layouting
      window.requestAnimationFrame(() => {
        fitView(pendingFitViewOptions ?? {})
        setLoading(false)
        setInitializeComplete(true)
        setLayoutComplete(false)
      })
    }
  }, [
    layoutComplete,
    pendingFitViewOptions,
    fitView,
    setLoading,
    setInitializeComplete,
  ])

  return { handleLayout }
}
