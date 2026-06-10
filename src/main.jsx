import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ContentProvider } from "./context/ContentProvider.jsx";
import { AdminAuthProvider } from "./admin/AdminAuthContext.jsx";
import { LanguageProvider } from "./i18n/LanguageProvider.jsx";
import ErrorBoundary from "./ui/ErrorBoundary.jsx";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <ContentProvider>
          <AdminAuthProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </AdminAuthProvider>
        </ContentProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
);
