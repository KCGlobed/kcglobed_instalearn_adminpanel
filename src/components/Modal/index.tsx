import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  disableOutsideClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, disableOutsideClick = false }) => {
  if (!isOpen) return null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onModalClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const onModalClose = ()=>{
    document.body.style.overflow = '';
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center transition delay-150 duration-300 ease-in-out">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity transition delay-150 duration-300 ease-in-out"
        onClick={()=>{if (!disableOutsideClick) onModalClose();}}
      ></div>

      {/* MODAL */}
      <div className="relative w-[90%] max-h-[95vh] overflow-y-auto bg-white rounded-xl shadow-2xl z-50 p-6">
        {title && (
          <div className="mb-4 text-xl font-bold text-gray-800 border-b pb-2">
            {title}
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
