import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of a form submission request
export interface RequestData {
  id: number;
  title: string;
  description: string;
  course: string;
  tags: string[];
}

// Define the context value type
interface FormContextType {
  requests: RequestData[];
  addRequest: (data: RequestData) => void;
}

// Create the context with undefined as initial (for safety)
const FormContext = createContext<FormContextType | undefined>(undefined);

// Props for the provider
interface FormDataProviderProps {
  children: ReactNode;
}

export const FormDataProvider: React.FC<FormDataProviderProps> = ({ children }) => {
  const [requests, setRequests] = useState<RequestData[]>([]);

  const addRequest = (data: RequestData) => {
    setRequests((prev) => [...prev, data]);
  };

  return (
    <FormContext.Provider value={{ requests, addRequest }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormData = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormData must be used within a FormDataProvider");
  }
  return context;
};

// ✅ Default export for Expo Router compatibility
export default FormDataProvider;
