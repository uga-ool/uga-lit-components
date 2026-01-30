import { Routes, Route } from "react-router-dom";
import { QuizPage } from "./pages/QuizPage";
import { HomePage } from "./pages/HomePage";

function App() {
  return (
    <div className="obj-container">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz" element={<QuizPage />} />
      </Routes>
    </div>
  );
}

export default App;
