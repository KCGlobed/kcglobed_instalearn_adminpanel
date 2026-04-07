import type { FilterField } from "../components/common/DynamicFilter";

export const filterConfig: FilterField[] = [
    { type: 'text', label: 'Category Name', name: 'name', placeholder: 'Filter by name...' },
    { type: 'text', label: 'Description', name: 'description', placeholder: 'Filter by description...', gridCols: 'md:col-span-2' },
    {
        type: 'status',
        label: 'Status',
        name: 'status',
        options: [
            { label: 'All', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Deactive', value: 'deactive' }
        ]
    }
];