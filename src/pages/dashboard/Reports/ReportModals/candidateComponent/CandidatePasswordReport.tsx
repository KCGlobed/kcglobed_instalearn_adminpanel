import { useState, useMemo, useEffect } from 'react';

import { useModal } from '../../../../../context/ModalContext';
import type { ColumnDefinition } from '../../../../../components/Table/Table';
import DynamicServerTable from '../../../../../components/Table/Table';

import { useAppDispatch } from '../../../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../../../hooks/useRedux';
import { getCandidatePasswordLogReport } from '../../../../../store/slices/candidateLogReport';

const CandidatePasswordReport = (prop:any) => {
    const dispatch = useAppDispatch();
    const { showModal } = useModal();
    const { data, loading, pagination } = useAppSelector((state) => state.candidateLogReport);

    // ------------------- States -------------------
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [flattenedData, setFlattenedData] = useState<any[]>([]);


    // ------------------- Debounce Search -------------------
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim());
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timeout);
    }, [search]);


   console.log("prop password report data",prop);
    // ------------------- Fetch Data -------------------
    useEffect(() => {
        const filters = {
            page: currentPage,
            id: prop?.data?.data?.id || "",
        };
        dispatch(getCandidatePasswordLogReport(filters));
    }, [
        currentPage, debouncedSearch,
    ]);

    // ------------------- Flatten Data -------------------
    useEffect(() => {
        const transformed = data.map((user, index) => ({
            index: (currentPage - 1) * 20 + (index + 1),
            first_name: user.user_detail?.first_name || 'N/A',
            last_name: user.user_detail?.last_name || 'N/A',
            email: user.user_detail?.email || 'N/A',
            is_locked: user.user_detail?.is_locked ? 'Yes' : 'No',
            date_joined: user.user_detail?.date_joined || 'N/A',
            category: user.user_detail?.category || 'N/A',
            phone1: user.user_detail?.phone1 || 'N/A',
            reference_id: user.user_detail?.reference_id || 'N/A',
            student_type: user.user_detail?.student_type || 'N/A',
            user_id: user.user_detail?.user_id,
            unlocked_on: user.user_detail?.unlocked_on || 'N/A',
            // Add other fields as necessary
         
        }));
        setFlattenedData(transformed);
    }, [data]);
    // ------------------- Columns -------------------
    const columns: ColumnDefinition<any>[] = useMemo(() => [
        { key: 'index', title: 'ID', align: 'center' },
        { key: 'first_name', title: 'First Name', align: 'center' },
        { key: 'last_name', title: 'Last Name', align: 'center' },
        { key: 'email', title: 'Email', align: 'center' },
        { key: 'is_locked', title: 'Is Locked', align: 'center' },
        { key: 'date_joined', title: 'Date Joined', align: 'center' },
        { key: 'category', title: 'Category', align: 'center' },
        { key: 'phone1', title: 'Phone', align: 'center' },
        { key: 'reference_id', title: 'Reference ID', align: 'center' },
        { key: 'student_type', title: 'Student Type', align: 'center' },
        { key: 'unlocked_on', title: 'Unlocked On', align: 'center' },


    ], [showModal]);




    return (
        <div className="p-6 space-y-5">
            {/* Table */}
            <DynamicServerTable
                data={flattenedData}
                columns={columns}
                currentPage={currentPage}
                pageSize={5}
                totalCount={pagination.total_results ?? 0}
                onPageChange={setCurrentPage}
                loading={loading}
            />
        </div>
    );
};

export default CandidatePasswordReport;
