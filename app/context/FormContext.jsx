// context/FormContext.js
import React, { createContext, useContext, useState } from "react";

const FormContext = createContext();

export const FormDataProvider = ({ children }) => {
  const [requests, setRequests] = useState([]);

  const addRequest = (data) => {
    setRequests((prev) => [...prev, data]);
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
    throw new Error("useFormData must be used within a FormProvider");
  }
  return context;
};
