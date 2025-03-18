import { useState } from 'react';
import { Head } from '@inertiajs/react';
import MindMapForm from '@/components/MindMap/MindMapForm';
import MindMapViewer from '@/components/MindMap/MindMapViewer';
import { MindMapData, FormData } from '@/types/mindmap';

export default function MindMap() {
    const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        content: '',
        settings: {
            maxDepth: 3,
            style: {
                centralNode: { color: '#4A90E2' },
                primaryNodes: { color: '#50C878' },
                secondaryNodes: { color: '#FFB366' },
                tertiaryNodes: { color: '#FF7F7F' }
            }
        }
    });

    const handleMindMapGenerated = (data: MindMapData) => {
        setMindMapData(data);
    };

    return (
        <>
            <Head title="Mind Map Generator" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h1 className="text-2xl font-semibold mb-6">Mind Map Generator</h1>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg">
                                    <MindMapForm
                                        onMindMapGenerated={handleMindMapGenerated}
                                        formData={formData}
                                        setFormData={setFormData}
                                    />
                                </div>
                                <div className="bg-gray-50 rounded-lg">
                                    {mindMapData && <MindMapViewer data={mindMapData} />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}