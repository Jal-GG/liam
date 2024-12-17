import {
  BaseEdge,
  type Edge,
  type EdgeProps,
  getBezierPath,
} from '@xyflow/react'

import { useUserEditingActiveStore } from '@/stores'
import clsx from 'clsx'
import type { FC } from 'react'
import styles from './RelationshipEdge.module.css'

type Data = {
  isHighlighted: boolean
}

export type RelationshipEdgeType = Edge<Data, 'relationship'>

type Props = EdgeProps<RelationshipEdgeType>

export const RelationshipEdge: FC<Props> = ({
  source,
  sourceX,
  sourceY,
  sourcePosition,
  target,
  targetX,
  targetY,
  targetPosition,
  id,
  data,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })
  const { tableName } = useUserEditingActiveStore()
  const isHighlighted =
    data?.isHighlighted || source === tableName || target === tableName

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        className={clsx(styles.edge, isHighlighted && styles.hovered)}
      />
    </>
  )
}
