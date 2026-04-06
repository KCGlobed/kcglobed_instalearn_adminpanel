import { useEffect, useState } from "react";
import { userStudyPlanViewApi } from "../../../../services/ReportService";

const ViewStudentStudyPlan = ({ student, subject }: any) => {
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleViewStudyPlan = async () => {
    try {
      setLoading(true);
      const res = await userStudyPlanViewApi(student, subject);
      setStudyPlan(res?.data || null);
    } catch (err: any) {
      setError("Failed to load study plan. Please try again!");
      console.error("Study Plan Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleViewStudyPlan();
  }, []);

  if (loading) return <p style={{ padding: "20px" }}>Loading...</p>;
  if (error) return <p style={{ padding: "20px", color: "red" }}>{error}</p>;
  if (!studyPlan) return <p style={{ padding: "20px" }}>No data found</p>;

  const { uncompleted_study_plan = [], completed_study_plan = [] } = studyPlan;

  const renderCard = (item: any, completed = false) => (
    <div
      key={item?.id}
      style={{
        border: "1px solid #ddd",
        marginBottom: "10px",
        padding: "10px",
        borderRadius: "8px",
        background: completed ? "#eaffea" : "white",
      }}
    >
      <p><b>Chapter:</b> {item?.chapter?.chapter_detail?.name || "-"}</p>
      <p><b>Topic:</b> {item?.topic?.topic_detail?.name || "-"}</p>
      <p><b>Start:</b> {item?.start_date || "-"}</p>
      <p><b>End:</b> {item?.end_date || "-"}</p>
      <p>
        <b>Status:</b> {completed ? "✔ Completed" : "❌ Not Completed"}
      </p>
    </div>
  );

  return (
    <div
      style={{
        padding: "20px",
        maxHeight: "80vh",
        overflowY: "auto",        // ✅ overflow scroll
      }}
    >
      <h2>📘 Student Study Plan</h2>

      {/* Uncompleted Section */}
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ color: "red" }}>⏳ Uncompleted Study Plan</h3>
        {uncompleted_study_plan.length === 0 ? (
          <p>No Uncompleted Tasks</p>
        ) : (
          uncompleted_study_plan.map((item: any) => renderCard(item, false))
        )}
      </div>

      {/* Completed Section */}
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ color: "green" }}>✅ Completed Study Plan</h3>
        {completed_study_plan.length === 0 ? (
          <p>No Completed Tasks</p>
        ) : (
          completed_study_plan.map((item: any) => renderCard(item, true))
        )}
      </div>
    </div>
  );
};

export default ViewStudentStudyPlan;
