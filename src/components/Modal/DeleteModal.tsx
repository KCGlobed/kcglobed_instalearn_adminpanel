import { useState } from "react";
import toast from "react-hot-toast";
import { useModal } from "../../context/ModalContext";

type DeleteConfirmationModalProps = {
  id: number | string;
  name: string;
  onDelete: (id: number | string) => Promise<void>;
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  id,
  name,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const { hideModal } = useModal();

  const autoLabel = name?.split(" ")?.[0]?.toLowerCase() || "item"; // e.g., "Chapter 1" -> "chapter"

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete(id);
      toast.success(`${autoLabel} deleted successfully!`);
      hideModal();
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(`Failed to delete ${autoLabel}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Delete Confirmation
      </h2>
      <p className="text-gray-600 mb-4">
        Are you sure you want to delete{" "}
        <span className="font-bold">{name}</span>? This action cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          onClick={hideModal}
          className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white transition cursor-pointer ${loading
              ? "bg-red-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
            }`}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
