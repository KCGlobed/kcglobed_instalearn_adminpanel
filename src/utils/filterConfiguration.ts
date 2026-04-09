import type { FilterField } from "../components/common/DynamicFilter";

export const filterConfig: FilterField[] = [
    { type: 'text', label: 'Category Name', name: 'name', placeholder: 'Filter by name...' },
    {
        type: 'text',
        label: 'Description ',
        name: 'description',
        placeholder: 'Filter by description...',
        gridCols: "col-span-2"
    },
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

export const ebookFilterConfig: FilterField[] = [
    { type: 'text', label: 'Ebook Name', name: 'name', placeholder: 'Filter by name...' },
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