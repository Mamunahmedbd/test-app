import React, { FormEvent, useState } from 'react';
import { MindMapData, FormData } from '@/types/mindmap';

interface MindMapNode {
    title?: string;
    content: string;
    children?: MindMapNode[];
}

interface MindMapData {
    id: number;
    title: string;
    content: string;
    structure: MindMapNode;
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

interface MindMapFormProps {
    onMindMapGenerated: (data: MindMapData) => void;
    formData: FormData;
    setFormData: (data: FormData) => void;
}

const demoContent = {
    title: 'UI/UX Design Principles',
    content: `UI/UX Design Principles including basic principles, key components, applications, and practical examples.

Key areas to cover:
1. Basic Principles
   - User-Centered Design
   - Consistency
   - Accessibility
   - Visual Hierarchy

2. Key Components
   - Navigation
   - Layout
   - Color Scheme
   - Typography

3. Applications
   - Web Design
   - Mobile Apps
   - Desktop Software

4. Best Practices
   - User Testing
   - Iterative Design
   - Feedback Collection`
};

export default function MindMapForm({ onMindMapGenerated, formData, setFormData }: MindMapFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/mindmap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to generate mind map');
            }

            const data = await response.json();
            onMindMapGenerated(data);
        } catch (error) {
            console.error('Error generating mind map:', error);
            // You might want to add error handling UI here
        } finally {
            setIsLoading(false);
        }
    };

    const handleExampleClick = () => {
        setFormData({
            ...formData,
            title: demoContent.title,
            content: demoContent.content
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4">
            <div className="flex justify-end mb-4">
                <button
                    type="button"
                    onClick={handleExampleClick}
                    className="inline-flex items-center px-4 py-2 border border-indigo-200 text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Fill Example Content
                </button>
            </div>
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                </label>
                <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating Mind Map...
                        </div>
                    ) : (
                        'Generate Mind Map'
                    )}
                </button>
            </div>
        </form>
    );
}