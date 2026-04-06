import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/store";
import AppRoutes from "./routes";
import './index.css'
import { AlertProvider } from "./context/AlertContext";
import { LoadingProvider } from "./context/LoadingContext";
import { ModalProvider } from "./context/ModalContext";
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <LoadingProvider>
        <AlertProvider>
          <ModalProvider>
             <AppRoutes />
           </ModalProvider>
          <Toaster position="top-right" reverseOrder={false} />
        </AlertProvider>
      </LoadingProvider>
    </BrowserRouter>
  </Provider>
);
