import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SecureLS from "secure-ls";

// Fallback UI
import { fallback } from "./code-spliting/fallback-ui";

//Protected route
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
const Home = lazy(() => import("./pages/Home"));
const Book = lazy(() => import("./pages/Book"));
const BookManagement = lazy(() => import("./pages/BookManagement"));
const NotAuthorized = lazy(() => import("./pages/NotAuthorized"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Local Storage export
export const ls = new SecureLS({ encodingType: "aes" });

// API Endpoint
export const api = "https://bebm75gygc.execute-api.us-west-1.amazonaws.com/v1";

const App = () => {
  return (
    <Router>
      <Suspense fallback={fallback}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:isbn" element={<Book />} />
          <Route
            path="/book-management"
            element={<ProtectedRoute element={BookManagement} />}
          />
          <Route path="/not-authorized" element={<NotAuthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
