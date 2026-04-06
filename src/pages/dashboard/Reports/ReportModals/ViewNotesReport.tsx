import { useEffect, useState } from "react";
import { noteReportViewApi } from "../../../../services/ReportService";

const referenceTypeMap: any = {
  1: "Video",
  2: "Assessment",
  3: "Practice",
  4: "Mock",
};

const ViewNotesReport = ({ student, subject }: { student: any; subject: any }) => {
  const [viewNotesData, setViewNotesData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleViewNotes = async () => {
    try {
      setLoading(true);
      const res = await noteReportViewApi(student, subject);
      setViewNotesData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleViewNotes();
  }, []);

  return (
    <div className="max-h-[70vh] p-6 bg-white rounded-xl shadow-md">

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && (
        <div className="space-y-3">
          <p><span className="font-semibold">Course:</span> {viewNotesData?.course}</p>
          <p><span className="font-semibold">Subject:</span> {viewNotesData?.subject}</p>
          <p><span className="font-semibold">User ID:</span> {viewNotesData?.user_id}</p>
        </div>
      )}

      <div className="mt-6 max-h-[40vh] overflow-y-auto pr-2 space-y-4">
        {viewNotesData?.user_notes?.map((note: any, index: number) => (
          <div key={index} className="p-4 bg-gray-50 border border-gray-300 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold mb-2 text-blue-700">Note {index + 1}</h3>

            <p className="mb-1">
              <span className="font-semibold">Reference Type:</span> {referenceTypeMap[note.reference_type] || "Unknown"}
            </p>

            <p className="mb-1">
              <span className="font-semibold">Note Content:</span>
                    <div
                        dangerouslySetInnerHTML={{ __html: note.note_content }}
                    />
            </p>

            <p className="mb-1">
              <span className="font-semibold">Created At:</span> {new Date(note.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewNotesReport;