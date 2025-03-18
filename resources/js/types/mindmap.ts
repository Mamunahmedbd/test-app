export interface MindMapNode {
    title: string;
    children?: MindMapNode[];
}

export interface MindMapData {
    id: number;
    title: string;
    content: string;
    structure: {
        nodes: MindMapNode[];
    };
    settings: {
        maxDepth: number;
        style: {
            centralNode: { color: string };
            primaryNodes: { color: string };
            secondaryNodes: { color: string };
            tertiaryNodes: { color: string };
        };
    };
}

export interface FormData {
    title: string;
    content: string;
    settings: {
        maxDepth: number;
        style: {
            centralNode: { color: string };
            primaryNodes: { color: string };
            secondaryNodes: { color: string };
            tertiaryNodes: { color: string };
        };
    };
}