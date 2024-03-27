import {
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import dayjs from 'dayjs'
import { uniqBy } from 'lodash-es'
import { useContext } from 'use-context-selector'
import useSWR from 'swr'
import produce from 'immer'
import {
  getIncomers,
  getOutgoers,
  useReactFlow,
  useStoreApi,
} from 'reactflow'
import type {
  Connection,
  Viewport,
} from 'reactflow'
import {
  generateNewNode,
  getLayoutByDagre,
  initialEdges,
  initialNodes,
} from '../utils'
import type {
  Edge,
  Node,
  ValueSelector,
} from '../types'
import {
  BlockEnum,
  WorkflowRunningStatus,
} from '../types'
import {
  useStore,
  useWorkflowStore,
} from '../store'
import {
  AUTO_LAYOUT_OFFSET,
  START_INITIAL_POSITION,
  SUPPORT_OUTPUT_VARS_NODE,
} from '../constants'
import { findUsedVarNodes, getNodeOutputVars, updateNodeVars } from '../nodes/_base/components/variable/utils'
import {
  useNodesExtraData,
  useNodesInitialData,
} from './use-nodes-data'
import { useNodesSyncDraft } from './use-nodes-sync-draft'
import { useStore as useAppStore } from '@/app/components/app/store'
import {
  fetchNodesDefaultConfigs,
  fetchPublishedWorkflow,
  fetchWorkflowDraft,
  syncWorkflowDraft,
} from '@/service/workflow'
import {
  fetchAllBuiltInTools,
  fetchAllCustomTools,
} from '@/service/tools'
import I18n from '@/context/i18n'
export const useIsChatMode = () => {
  const appDetail = useAppStore(s => s.appDetail)

  return appDetail?.mode === 'advanced-chat'
}

export const useWorkflow = () => {
  const { locale } = useContext(I18n)
  const store = useStoreApi()
  const reactflow = useReactFlow()
  const workflowStore = useWorkflowStore()
  const nodesExtraData = useNodesExtraData()
  const { handleSyncWorkflowDraft } = useNodesSyncDraft()

  const handleLayout = useCallback(async () => {
    workflowStore.setState({ nodeAnimation: true })
    const {
      getNodes,
      edges,
      setNodes,
    } = store.getState()
    const { setViewport } = reactflow
    const nodes = getNodes()
    const layout = getLayoutByDagre(nodes, edges)

    const newNodes = produce(nodes, (draft) => {
      draft.forEach((node) => {
        const nodeWithPosition = layout.node(node.id)
        node.position = {
          x: nodeWithPosition.x + AUTO_LAYOUT_OFFSET.x,
          y: nodeWithPosition.y + AUTO_LAYOUT_OFFSET.y,
        }
      })
    })
    setNodes(newNodes)
    const zoom = 0.7
    setViewport({
      x: 0,
      y: 0,
      zoom,
    })
    setTimeout(() => {
      handleSyncWorkflowDraft()
    })
  }, [store, reactflow, handleSyncWorkflowDraft, workflowStore])

  const getTreeLeafNodes = useCallback((nodeId: string) => {
    const {
      getNodes,
      edges,
    } = store.getState()
    const nodes = getNodes()
    const startNode = nodes.find(node => node.data.type === BlockEnum.Start)

    if (!startNode)
      return []

    const list: Node[] = []
    const preOrder = (root: Node, callback: (node: Node) => void) => {
      if (root.id === nodeId)
        return
      const outgoers = getOutgoers(root, nodes, edges)

      if (outgoers.length) {
        outgoers.forEach((outgoer) => {
          preOrder(outgoer, callback)
        })
      }
      else {
        if (root.id !== nodeId)
          callback(root)
      }
    }
    preOrder(startNode, (node) => {
      list.push(node)
    })

    const incomers = getIncomers({ id: nodeId } as Node, nodes, edges)

    list.push(...incomers)

    return uniqBy(list, 'id').filter((item) => {
      return SUPPORT_OUTPUT_VARS_NODE.includes(item.data.type)
    })
  }, [store])

  const getBeforeNodesInSameBranch = useCallback((nodeId: string) => {
    const {
      getNodes,
      edges,
    } = store.getState()
    const nodes = getNodes()
    const currentNode = nodes.find(node => node.id === nodeId)
    const list: Node[] = []

    if (!currentNode)
      return list

    const traverse = (root: Node, callback: (node: Node) => void) => {
      if (root) {
        const incomers = getIncomers(root, nodes, edges)

        if (incomers.length) {
          incomers.forEach((node) => {
            callback(node)
            traverse(node, callback)
          })
        }
      }
    }
    traverse(currentNode, (node) => {
      list.push(node)
    })

    const length = list.length
    if (length) {
      return uniqBy(list, 'id').reverse().filter((item) => {
        return SUPPORT_OUTPUT_VARS_NODE.includes(item.data.type)
      })
    }

    return []
  }, [store])

  const getAfterNodesInSameBranch = useCallback((nodeId: string) => {
    const {
      getNodes,
      edges,
    } = store.getState()
    const nodes = getNodes()
    const currentNode = nodes.find(node => node.id === nodeId)!

    if (!currentNode)
      return []
    const list: Node[] = [currentNode]

    const traverse = (root: Node, callback: (node: Node) => void) => {
      if (root) {
        const outgoers = getOutgoers(root, nodes, edges)

        if (outgoers.length) {
          outgoers.forEach((node) => {
            callback(node)
            traverse(node, callback)
          })
        }
      }
    }
    traverse(currentNode, (node) => {
      list.push(node)
    })

    return uniqBy(list, 'id')
  }, [store])

  const handleOutVarRenameChange = useCallback((nodeId: string, oldValeSelector: ValueSelector, newVarSelector: ValueSelector) => {
    const { getNodes, setNodes } = store.getState()
    const afterNodes = getAfterNodesInSameBranch(nodeId)
    const effectNodes = findUsedVarNodes(oldValeSelector, afterNodes)
    // console.log(effectNodes)
    if (effectNodes.length > 0) {
      const newNodes = getNodes().map((node) => {
        if (effectNodes.find(n => n.id === node.id))
          return updateNodeVars(node, oldValeSelector, newVarSelector)

        return node
      })
      setNodes(newNodes)
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store])

  const isVarUsedInNodes = useCallback((varSelector: ValueSelector) => {
    const nodeId = varSelector[0]
    const afterNodes = getAfterNodesInSameBranch(nodeId)
    const effectNodes = findUsedVarNodes(varSelector, afterNodes)
    return effectNodes.length > 0
  }, [getAfterNodesInSameBranch])

  const removeUsedVarInNodes = useCallback((varSelector: ValueSelector) => {
    const nodeId = varSelector[0]
    const { getNodes, setNodes } = store.getState()
    const afterNodes = getAfterNodesInSameBranch(nodeId)
    const effectNodes = findUsedVarNodes(varSelector, afterNodes)
    if (effectNodes.length > 0) {
      const newNodes = getNodes().map((node) => {
        if (effectNodes.find(n => n.id === node.id))
          return updateNodeVars(node, varSelector, [])

        return node
      })
      setNodes(newNodes)
    }
  }, [getAfterNodesInSameBranch, store])

  const isNodeVarsUsedInNodes = useCallback((node: Node, isChatMode: boolean) => {
    const outputVars = getNodeOutputVars(node, isChatMode)
    const isUsed = outputVars.some((varSelector) => {
      return isVarUsedInNodes(varSelector)
    })
    return isUsed
  }, [isVarUsedInNodes])

  const isValidConnection = useCallback(({ source, target }: Connection) => {
    const { getNodes } = store.getState()
    const nodes = getNodes()
    const sourceNode: Node = nodes.find(node => node.id === source)!
    const targetNode: Node = nodes.find(node => node.id === target)!

    if (sourceNode && targetNode) {
      const sourceNodeAvailableNextNodes = nodesExtraData[sourceNode.data.type].availableNextNodes
      const targetNodeAvailablePrevNodes = [...nodesExtraData[targetNode.data.type].availablePrevNodes, BlockEnum.Start]
      if (!sourceNodeAvailableNextNodes.includes(targetNode.data.type))
        return false

      if (!targetNodeAvailablePrevNodes.includes(sourceNode.data.type))
        return false
    }

    return true
  }, [store, nodesExtraData])

  const formatTimeFromNow = useCallback((time: number) => {
    return dayjs(time).locale(locale === 'zh-Hans' ? 'zh-cn' : locale).fromNow()
  }, [locale])

  const getValidTreeNodes = useCallback(() => {
    const {
      getNodes,
      edges,
    } = store.getState()
    const nodes = getNodes()

    const startNode = nodes.find(node => node.data.type === BlockEnum.Start)

    if (!startNode) {
      return {
        validNodes: [],
        maxDepth: 0,
      }
    }

    const list: Node[] = [startNode]
    let maxDepth = 1

    const traverse = (root: Node, depth: number) => {
      if (depth > maxDepth)
        maxDepth = depth

      const outgoers = getOutgoers(root, nodes, edges)

      if (outgoers.length) {
        outgoers.forEach((outgoer) => {
          list.push(outgoer)
          traverse(outgoer, depth + 1)
        })
      }
      else {
        list.push(root)
      }
    }

    traverse(startNode, maxDepth)

    return {
      validNodes: uniqBy(list, 'id'),
      maxDepth,
    }
  }, [store])

  const renderTreeFromRecord = useCallback((nodes: Node[], edges: Edge[], viewport?: Viewport) => {
    const { setNodes } = store.getState()
    const { setViewport, setEdges } = reactflow

    setNodes(initialNodes(nodes, edges))
    setEdges(initialEdges(edges, nodes))

    if (viewport)
      setViewport(viewport)
  }, [store, reactflow])

  return {
    handleLayout,
    getTreeLeafNodes,
    getBeforeNodesInSameBranch,
    getAfterNodesInSameBranch,
    handleOutVarRenameChange,
    isVarUsedInNodes,
    removeUsedVarInNodes,
    isNodeVarsUsedInNodes,
    isValidConnection,
    formatTimeFromNow,
    getValidTreeNodes,
    renderTreeFromRecord,
  }
}

export const useFetchToolsData = () => {
  const workflowStore = useWorkflowStore()

  const handleFetchAllTools = useCallback(async (type: string) => {
    if (type === 'builtin') {
      const buildInTools = await fetchAllBuiltInTools()

      workflowStore.setState({
        buildInTools: buildInTools || [],
      })
    }
    if (type === 'custom') {
      const customTools = await fetchAllCustomTools()

      workflowStore.setState({
        customTools: customTools || [],
      })
    }
  }, [workflowStore])

  return {
    handleFetchAllTools,
  }
}

export const useWorkflowInit = () => {
  const workflowStore = useWorkflowStore()
  const nodesInitialData = useNodesInitialData()
  const { handleFetchAllTools } = useFetchToolsData()
  const appDetail = useAppStore(state => state.appDetail)!
  const { data, isLoading, error, mutate } = useSWR(`/apps/${appDetail.id}/workflows/draft`, fetchWorkflowDraft)

  const handleFetchPreloadData = useCallback(async () => {
    try {
      const nodesDefaultConfigsData = await fetchNodesDefaultConfigs(`/apps/${appDetail?.id}/workflows/default-workflow-block-configs`)
      const publishedWorkflow = await fetchPublishedWorkflow(`/apps/${appDetail?.id}/workflows/publish`)
      workflowStore.setState({
        nodesDefaultConfigs: nodesDefaultConfigsData.reduce((acc, block) => {
          if (!acc[block.type])
            acc[block.type] = { ...block.config }
          return acc
        }, {} as Record<string, any>),
      })
      workflowStore.getState().setPublishedAt(publishedWorkflow?.created_at)
    }
    catch (e) {

    }
  }, [workflowStore, appDetail])

  useEffect(() => {
    handleFetchPreloadData()
    handleFetchAllTools('builtin')
    handleFetchAllTools('custom')
  }, [handleFetchPreloadData, handleFetchAllTools])

  useEffect(() => {
    if (data)
      workflowStore.getState().setDraftUpdatedAt(data.updated_at)
  }, [data, workflowStore])

  if (error && error.json && !error.bodyUsed && appDetail) {
    error.json().then((err: any) => {
      if (err.code === 'draft_workflow_not_exist') {
        workflowStore.setState({ notInitialWorkflow: true })
        syncWorkflowDraft({
          url: `/apps/${appDetail.id}/workflows/draft`,
          params: {
            graph: {
              nodes: [generateNewNode({
                data: {
                  ...nodesInitialData.start,
                  selected: true,
                },
                position: START_INITIAL_POSITION,
              })],
              edges: [],
            },
            features: {},
          },
        }).then((res) => {
          workflowStore.getState().setDraftUpdatedAt(res.updated_at)
          mutate()
        })
      }
    })
  }

  return {
    data,
    isLoading,
  }
}

export const useWorkflowReadOnly = () => {
  const workflowStore = useWorkflowStore()
  const workflowRunningData = useStore(s => s.workflowRunningData)

  const getWorkflowReadOnly = useCallback(() => {
    return workflowStore.getState().workflowRunningData?.result.status === WorkflowRunningStatus.Running
  }, [workflowStore])

  return {
    workflowReadOnly: workflowRunningData?.result.status === WorkflowRunningStatus.Running,
    getWorkflowReadOnly,
  }
}
export const useNodesReadOnly = () => {
  const workflowStore = useWorkflowStore()
  const workflowRunningData = useStore(s => s.workflowRunningData)
  const historyWorkflowData = useStore(s => s.historyWorkflowData)
  const isRestoring = useStore(s => s.isRestoring)

  const getNodesReadOnly = useCallback(() => {
    const {
      workflowRunningData,
      historyWorkflowData,
      isRestoring,
    } = workflowStore.getState()

    return workflowRunningData || historyWorkflowData || isRestoring
  }, [workflowStore])

  return {
    nodesReadOnly: !!(workflowRunningData || historyWorkflowData || isRestoring),
    getNodesReadOnly,
  }
}

export const useToolIcon = (data: Node['data']) => {
  const buildInTools = useStore(s => s.buildInTools)
  const customTools = useStore(s => s.customTools)
  const toolIcon = useMemo(() => {
    if (data.type === BlockEnum.Tool) {
      if (data.provider_type === 'builtin')
        return buildInTools.find(toolWithProvider => toolWithProvider.id === data.provider_id)?.icon

      return customTools.find(toolWithProvider => toolWithProvider.id === data.provider_id)?.icon
    }
  }, [data, buildInTools, customTools])

  return toolIcon
}
