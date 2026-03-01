import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import AddPatient from "./components/AddPatient";
import AddSessionForm from "./components/AddSessionForm";
import Home from "./components/Home";
import SessionDetails from "./components/SessionDetails";
import Navbar from "./components/Navbar";

const App: React.FC = () => {
  const [patientId, setPatientId] = React.useState<string>("");

  const handleSuccess = () => {
    setPatientId("");
  };

  const handleCancel = () => {
    setPatientId("");
  };

  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patients" element={<AddPatient />} />
        <Route path="/add-session" element={<AddSessionForm  onSuccess={handleSuccess} onCancel={handleCancel} />} />
        <Route path="/session/:sessionId" element={<SessionDetails />} />
      </Routes>
    </Router>
  );
};

export default App;