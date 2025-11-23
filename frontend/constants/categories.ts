import { TaskCategory } from '../services/taskService';

export const TASK_CATEGORIES = [
    {
        id: 'deep-work' as TaskCategory,
        label: 'Deep Work',
        icon: 'bulb',
        color: '#6366f1',
        bgColor: 'rgba(99, 102, 241, 0.1)',
        description: 'Focus-intensive tasks requiring concentration'
    },
    {
        id: 'admin' as TaskCategory,
        label: 'Admin',
        icon: 'document-text',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.1)',
        description: 'Administrative and organizational tasks'
    },
    {
        id: 'creative' as TaskCategory,
        label: 'Creative',
        icon: 'color-palette',
        color: '#ec4899',
        bgColor: 'rgba(236, 72, 153, 0.1)',
        description: 'Creative and brainstorming work'
    },
    {
        id: 'physical' as TaskCategory,
        label: 'Physical',
        icon: 'fitness',
        color: '#10b981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        description: 'Physical activities and exercise'
    },
    {
        id: 'personal' as TaskCategory,
        label: 'Personal',
        icon: 'person',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        description: 'Personal errands and life tasks'
    },
];

export const getCategoryConfig = (category?: TaskCategory) => {
    return TASK_CATEGORIES.find(c => c.id === category) || TASK_CATEGORIES[4]; // Default to 'personal'
};
