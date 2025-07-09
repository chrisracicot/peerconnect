import React, { createContext, useContext, useState, ReactNode } from "react";
import type { RequestItem } from "@models/request";

// Define the context value type
interface FormContextType {
  requests: RequestItem[];
  addRequest: (data: RequestItem) => void;
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
  //dummy data
  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 1,
      title: "Web Development",
      description: "Need help with assignment 1 on responsive layouts.",
      course: "CPRG 306",
      tags: ["HTML", "CSS", "Flexbox"],
      status: "booked",
    },
    {
      id: 2,
      title: "OOP Basics",
      description: "Confused about constructors and inheritance.",
      course: "CPRG 211",
      tags: ["Java", "Classes", "Inheritance"],
      status: "pending",
    },
    {
      id: 3,
      title: "Database Joins",
      description: "Practice problems on LEFT and INNER JOIN.",
      course: "CPRG 250",
      tags: ["SQL", "Joins"],
      status: "booked",
    },
    {
      id: 4,
      title: "UX Wireframes",
      description: "Review my Figma wireframes for a project.",
      course: "CPSY 202",
      tags: ["Figma", "UX", "Design"],
      status: "pending",
    },
    {
      id: 5,
      title: "Technical Writing",
      description: "Proofread my document for COMM 238.",
      course: "COMM 238",
      tags: ["Writing", "Reports"],
      status: "completed",
    },
  ]);

  const addRequest = (data: RequestItem) => {
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
