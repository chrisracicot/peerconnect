// FormContext.jsx
import React, { createContext, useContext, useState } from "react";

const FormContext = createContext();

export const FormDataProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);

  const addRequest = (request) => {
    setRequests((prev) => [...prev, request]);
  };

  return (
    <FormContext.Provider value={{ requests, addRequest }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormData = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormData must be used within a FormDataProvider");
  }
  return context;
};

// ✅ Add a default export for routing compatibility
export default FormDataProvider;
