import { useState, useMemo, useEffect } from 'react';

import { useModal } from '../../../../../context/ModalContext';
import type { ColumnDefinition } from '../../../../../components/Table/Table';
import DynamicServerTable from '../../../../../components/Table/Table';
import {userStudyPlanPdfApi,  } from '../../../../../services/ReportService';
import { FiDownload} from 'react-icons/fi';

import toast from 'react-hot-toast';
import GlassButton from '../../../../../components/Button/Button';
import { useAppDispatch } from '../../../../../hooks/useAppDispatch';
import { useAppSelector } from '../../../../../hooks/useRedux';
import { getCandidateLogReport } from '../../../../../store/slices/candidateLogReport';

const CandidateLogReport = (prop:any) => {
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





   console.log("prop data",prop);
    // ------------------- Fetch Data -------------------
    useEffect(() => {
        const filters = {
            page: currentPage,
            id: prop?.data?.data?.id || "",
        };
        dispatch(getCandidateLogReport(filters));
    }, [
        currentPage, debouncedSearch,
    ]);

    // ------------------- Flatten Data -------------------
    useEffect(() => {
        const transformed = data.map((user, index) => ({
            index: (currentPage - 1) * 20 + (index + 1),
            login_IP: user.login_IP || 'N/A',
            device_id: user.device_id   || 'N/A',
            device_type: user.device_type || 'N/A',
            country: user.country || 'N/A',
            // Add other fields as necessary
         
        }));
        setFlattenedData(transformed);
    }, [data]);
    // ------------------- Columns -------------------
    const columns: ColumnDefinition<any>[] = useMemo(() => [
        { key: 'index', title: 'ID', align: 'center' },
        { key: 'login_IP', title: 'Login IP', align: 'center' },
        { key: 'device_id', title: 'Device ID', align: 'center' },
        { key: 'device_type', title: 'Device Type', align: 'center' },
        { key: 'country', title: 'Country', align: 'center' },
        {
            key: 'actions',
            title: 'Actions',
            align: 'center',
            render: (_, row) => (
                <div className="flex space-x-2">
                    <GlassButton
                        icon={<FiDownload className="text-base" />}
                        color="red"
                        title="Delete"
                        onClick={() => {
                            handleIndividualReportPdf(row);

                        }}
                    />
                </div>
            ),
        },


    ], [showModal]);



    const handleIndividualReportPdf = async (data: any) => {
        try {
            const res = await userStudyPlanPdfApi(data.user_id, data.subject_id);;
            const fileUrl = res?.data?.report_url;
            if (fileUrl) window.open(fileUrl, "_blank");
        } finally {
            toast.error("Failed to generate PDF report");
        }
        // Implement individual report PDF download logic here
    }



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

export default CandidateLogReport;
