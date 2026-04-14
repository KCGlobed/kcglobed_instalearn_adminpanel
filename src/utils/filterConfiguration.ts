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

export const instructorFilterConfig: FilterField[] = [
    {
        name: 'first_name',
        label: 'First Name',
        type: 'text',
        placeholder: 'Filter by first name...',
    },
    {
        name: 'last_name',
        label: 'Last Name',
        type: 'text',
        placeholder: 'Filter by last name...',
    },
    {
        name: 'location',
        label: 'Location',
        type: 'text',
        placeholder: 'Filter by location...',
    },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { label: 'All', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'deactive' },
        ],
    },
]

//------------------------------Abhishek Faq Topics Start------------//



//------------------------------Abhishek Faq Topics End------------//


export const faqFilterConfig: FilterField[] = [
    { type: 'text', label: 'FAQ Title', name: 'title', placeholder: 'Filter by title...' },
    {
        type: 'text',
        label: 'Description',
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


//----himanshu mcq filter config start------------//

export const mcqFilterConfig: FilterField[] = [
    { type: 'text', label: 'MCQ ID', name: 'id_number', placeholder: 'Filter by MCQ ID...' },
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



//----himanshu mcq filter config end------------//