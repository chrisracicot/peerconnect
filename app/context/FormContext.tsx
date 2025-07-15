// app/context/FormContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import type { RequestItem } from "@models/request";
import { fetchRequests, createRequest } from "@lib/supabase/requestsService";

// Define the context value type
interface FormContextType {
  requests: RequestItem[];
  addRequest: (data: RequestItem) => void;
  setRequests: React.Dispatch<React.SetStateAction<RequestItem[]>>;
}

// Create the context with undefined as initial (for safety)
const FormContext = createContext<FormContextType | undefined>(undefined);

// Props for the provider
interface FormDataProviderProps {
  children: ReactNode;
}

export const FormDataProvider: React.FC<FormDataProviderProps> = ({
  children,
}) => {
  const [requests, setRequests] = useState<RequestItem[]>([]);

  useEffect(() => {
    fetchRequests().then(setRequests).catch(console.error);
  }, []);

  const addRequest = (data: RequestItem | undefined) => {
    if (!data) return;
    setRequests((prev) => [...prev, data]);
  };

  return (
    <FormContext.Provider value={{ requests, addRequest, setRequests }}>
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

export default FormDataProvider;
