// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastProvider } from "./hooks/useToast.jsx";
import { store } from "./app/store";
import { fetchUser } from "./services/authSlice.js";
import { fetchSubjects } from "./services/subjectSlice";
import { fetchAcademicPrograms } from "./services/academicProgramSlice.ts";
import { fetchCurriculums } from "./services/curriculumSlice.ts";

store.dispatch(fetchUser());
store.dispatch(fetchSubjects());
store.dispatch(fetchAcademicPrograms());
store.dispatch(fetchCurriculums());

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <Provider store={store}>
    <Router>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Router>
  </Provider>

  // </StrictMode>
);
