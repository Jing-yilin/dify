'use client'

import type { FC } from 'react'
import { memo } from 'react'
import Workflow from '@/app/components/workflow'

const initialNodes = [
  {
    id: '1',
    type: 'custom',
    // position: { x: 130, y: 130 },
    data: { type: 'start' },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 434, y: 130 },
    data: { type: 'if-else' },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 738, y: 130 },
    data: { type: 'llm', sortIndexInBranches: 0 },
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 738, y: 330 },
    data: { type: 'llm', sortIndexInBranches: 1 },
  },
  // {
  //   id: '5',
  //   type: 'custom',
  //   position: { x: 1100, y: 130 },
  //   data: { type: 'llm' },
  // },
]

const initialEdges = [
  {
    id: '0',
    type: 'custom',
    source: '1',
    sourceHandle: 'source',
    target: '2',
    targetHandle: 'target',
  },
  {
    id: '1',
    type: 'custom',
    source: '2',
    sourceHandle: 'condition1',
    target: '3',
    targetHandle: 'target',
  },
  {
    id: '2',
    type: 'custom',
    source: '2',
    sourceHandle: 'condition2',
    target: '4',
    targetHandle: 'target',
  },
]

const Page: FC = () => {
  return (
    <div className='min-w-[720px] w-full h-full overflow-x-auto'>
      <Workflow
        nodes={initialNodes}
        edges={initialEdges}
      />
    </div>
  )
}
export default memo(Page)
