const ViewAttachment = ({ row }: any) => {
  const attachment =
    row?.attachment?.[0]?.url || row?.attachment || ""; // handle string or array

  if (!attachment) {
    return <p>No attachment found</p>;
  }

  return (
    <div style={{ textAlign: "center" }} className="flex justify-center ">
      <img
        src={attachment}
        alt="attachment"
        style={{
          
          borderRadius: "8px",
        }}
        className="w-[600px] h-[600px]"
      />
    </div>
  );
};

export default ViewAttachment;
