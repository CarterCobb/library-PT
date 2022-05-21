import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SecureLS from "secure-ls";

// Error Boundary
import ErrorBoundary from "./code-spliting/error-boundary";

// Fallback UI
import { fallback } from "./code-spliting/fallback-ui";

// Pages
const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Local Storage export
export const ls = new SecureLS({ encodingType: "aes" });

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={fallback}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
