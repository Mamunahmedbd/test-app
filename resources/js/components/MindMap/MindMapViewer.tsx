import React, { useCallback, useState } from 'react';
import { MindMapData } from '@/types/mindmap';
import ReactFlow, {
    Node,
    Edge,
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    ReactFlowProvider,
    useStoreApi,
    useReactFlow,
    Position,
    ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface MindMapViewerProps {
    data: MindMapData;
}

const MIN_DISTANCE = 150;

// Custom node styles for different levels
const getNodeStyle = (level: number, color: string) => {
    const baseStyle = {
        padding: '12px 20px',
        borderRadius: '8px',
        backgroundColor: color,
        border: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: 'auto',
        minHeight: '40px',
        fontSize: level === 0 ? '24px' : '14px',
        fontWeight: level === 0 ? 'bold' : 'normal',
        color: '#fff',
        textAlign: 'left' as const,
        whiteSpace: 'normal' as const,
        maxWidth: level === 0 ? '300px' : level === 1 ? '200px' : '280px',
    };

    if (level === 0) {
        return {
            ...baseStyle,
            backgroundColor: '#1a1a1a',
            padding: '20px 30px',
        };
    } else if (level === 1) {
        return {
            ...baseStyle,
            backgroundColor: color,
        };
    } else {
        return {
            ...baseStyle,
            backgroundColor: '#f0f0f0',
            color: '#333',
            padding: '10px 15px',
            fontSize: '13px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        };
    }
};

const nodeTypes = {
    mindmap: ({ data }: { data: { label: string; color: string; level: number; description?: string } }) => (
        <div
            className="transition-transform hover:scale-105"
            style={getNodeStyle(data.level, data.color)}
        >
            <div>{data.label}</div>
            {data.description && (
                <div style={{
                    fontSize: '12px',
                    marginTop: '8px',
                    opacity: 0.9,
                    lineHeight: '1.4'
                }}>
                    {data.description}
                </div>
            )}
        </div>
    ),
};

const Flow = ({ data }: MindMapViewerProps) => {
    const store = useStoreApi();
    const [isExpanded, setIsExpanded] = useState(false);
    const { getInternalNode } = useReactFlow();

    const processInitialNodes = (data: MindMapData) => {
        if (!data?.structure?.nodes[0]) return [];
        const processedNodes: Node[] = [];

        const processNode = (
            node: MindMapData['structure']['nodes'][0],
            level = 0,
            index = 0,
            totalSiblings = 1
        ) => {
            const currentId = `node-${level}-${index}`;
            let color;
            if (level === 0) {
                color = '#1a1a1a';
            } else if (level === 1) {
                const colors = ['#6366f1', '#ef4444', '#10b981', '#8b5cf6'];
                color = colors[index % colors.length];
            } else {
                color = '#f0f0f0';
            }

            // Calculate position
            let x = 0, y = 0;
            const horizontalSpacing = 300;
            const verticalSpacing = 120;

            if (level === 0) {
                x = 0;
                y = 0;
            } else if (level === 1) {
                x = horizontalSpacing;
                const totalHeight = (totalSiblings - 1) * verticalSpacing;
                y = -totalHeight / 2 + index * verticalSpacing;
            } else {
                x = horizontalSpacing * 2;
                y = index * verticalSpacing;
            }

            processedNodes.push({
                id: currentId,
                type: 'mindmap',
                position: { x, y },
                data: {
                    label: node.title,
                    color,
                    level,
                    description: node.description
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            });

            if (node.children) {
                node.children.forEach((child, idx) => {
                    processNode(child, level + 1, idx, node.children!.length);
                });
            }
        };

        processNode(data.structure.nodes[0]);
        return processedNodes;
    };

    const [nodes, setNodes, onNodesChange] = useNodesState(processInitialNodes(data));
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const getClosestEdge = useCallback((node: Node) => {
        const { nodeLookup } = store.getState();
        const internalNode = getInternalNode(node.id);

        const closestNode = Array.from(nodeLookup.values()).reduce(
            (res: { distance: number; node: any }, n: any) => {
                if (n.id !== internalNode.id) {
                    const dx = n.internals.positionAbsolute.x - internalNode.internals.positionAbsolute.x;
                    const dy = n.internals.positionAbsolute.y - internalNode.internals.positionAbsolute.y;
                    const d = Math.sqrt(dx * dx + dy * dy);

                    if (d < res.distance && d < MIN_DISTANCE) {
                        res.distance = d;
                        res.node = n;
                    }
                }
                return res;
            },
            {
                distance: Number.MAX_VALUE,
                node: null,
            },
        );

        if (!closestNode.node) {
            return null;
        }

        const closeNodeIsSource =
            closestNode.node.internals.positionAbsolute.x < internalNode.internals.positionAbsolute.x;

        return {
            id: closeNodeIsSource
                ? `${closestNode.node.id}-${node.id}`
                : `${node.id}-${closestNode.node.id}`,
            source: closeNodeIsSource ? closestNode.node.id : node.id,
            target: closeNodeIsSource ? node.id : closestNode.node.id,
            style: {
                stroke: '#6366f1',
                strokeWidth: 2,
            },
            type: 'smoothstep',
        };
    }, []);

    const onNodeDrag = useCallback(
        (_: any, node: Node) => {
            const closeEdge = getClosestEdge(node);

            setEdges((es) => {
                const nextEdges = es.filter((e) => e.className !== 'temp');

                if (
                    closeEdge &&
                    !nextEdges.find(
                        (ne) =>
                            ne.source === closeEdge.source && ne.target === closeEdge.target,
                    )
                ) {
                    closeEdge.className = 'temp';
                    nextEdges.push(closeEdge);
                }

                return nextEdges;
            });
        },
        [getClosestEdge, setEdges],
    );

    const onNodeDragStop = useCallback(
        (_: any, node: Node) => {
            const closeEdge = getClosestEdge(node);

            setEdges((es) => {
                const nextEdges = es.filter((e) => e.className !== 'temp');

                if (
                    closeEdge &&
                    !nextEdges.find(
                        (ne) =>
                            ne.source === closeEdge.source && ne.target === closeEdge.target,
                    )
                ) {
                    nextEdges.push(closeEdge);
                }

                return nextEdges;
            });
        },
        [getClosestEdge],
    );

    return (
        <div className={`relative ${isExpanded ? 'fixed inset-0 z-50 bg-white' : 'w-full h-[700px]'} bg-white rounded-lg shadow-inner overflow-hidden`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDrag={onNodeDrag}
                onNodeDragStop={onNodeDragStop}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Loose}
                fitView
                minZoom={0.1}
                maxZoom={4}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                style={{ backgroundColor: '#F7F9FB' }}
            >
                <Background color="#f8f8f8" gap={16} />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default function MindMapViewer(props: MindMapViewerProps) {
    return (
        <ReactFlowProvider>
            <Flow {...props} />
        </ReactFlowProvider>
    );
}