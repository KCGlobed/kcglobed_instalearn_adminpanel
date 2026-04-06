// src/context/ModalContext.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react"; 

type ModalType = "default" | "success" | "error" | "custom";
type ModalSize = "sm" | "md" | "lg" |"xl"|"xxl";

interface ModalData {
  title?: string;
  content: ReactNode;
  type?: ModalType;
  size?: ModalSize;
}

interface ModalContextType {
  showModal: (data: ModalData) => void;
  hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within ModalProvider");
  return context;
};

const getSizeClass = (size: ModalSize = "md") => {
  switch (size) {
    case "sm":
      return "max-w-sm";
    case "md":
      return "max-w-md";
    case "lg":
      return "max-w-3xl";
    case "xl":
      return "max-w-5xl";
    case "xxl":
      return "max-w-7xl";
    default:
      return "max-w-md";
  }
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalData, setModalData] = useState<ModalData | null>(null);

  const showModal = (data: ModalData) => setModalData(data);
  const hideModal = () => setModalData(null);

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" >
          <div
            className={`bg-white rounded-xl shadow-xl w-full p-6 relative ${getSizeClass(
              modalData.size
            )}`}
          >
            <button
              onClick={hideModal}
              className="absolute cursor-pointer top-2 right-2 text-gray-400 hover:text-black text-xl"
            >
              ✕
            </button>
            {modalData.title && (
              <h2 className="text-xl font-semibold mb-4 text-center">{modalData.title}</h2>
            )}
            <div>{modalData.content}</div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
