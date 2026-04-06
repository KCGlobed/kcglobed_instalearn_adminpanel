import React, { createContext, useContext, useState, type ReactNode } from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface Alert {
  id: number;
  message: string;
  type: AlertType;
}

interface ConfirmOptions {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AlertContextProps {
  alerts: Alert[];
  showAlert: (message: string, type?: AlertType) => void;
  showConfirm: (options: ConfirmOptions) => void;
  removeAlert: (id: number) => void;
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined);

export const AlertProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);

  const showAlert = (message: string, type: AlertType = "info") => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeAlert(id), 2000);
  };

  const showConfirm = (options: ConfirmOptions) => {
    setConfirm(options);
  };

  const removeAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleConfirm = () => {
    confirm?.onConfirm();
    setConfirm(null);
  };

  const handleCancel = () => {
    confirm?.onCancel?.();
    setConfirm(null);
  };

  return (
    <AlertContext.Provider value={{ alerts, showAlert, showConfirm, removeAlert }}>
      {children}

      {/* Toast Alerts */}
      <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 space-y-3 w-full max-w-md px-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`w-full rounded px-4 py-3 text-white shadow-lg animate-fade-slide
              ${alert.type === "success" ? "bg-green-500" : ""}
              ${alert.type === "error" ? "bg-red-500" : ""}
              ${alert.type === "warning" ? "bg-yellow-500 text-black" : ""}
              ${alert.type === "info" ? "bg-blue-500" : ""}
            `}
          >
            <div className="flex items-center justify-between">
              <span>{alert.message}</span>
              <button
                onClick={() => removeAlert(alert.id)}
                className="ml-4 text-sm underline"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="w-full max-w-sm rounded bg-white p-6 shadow-lg animate-fade-slide">
            <p className="mb-4 text-gray-800">{confirm.message}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="rounded bg-gray-300 px-4 py-2 text-sm text-gray-800 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
};
