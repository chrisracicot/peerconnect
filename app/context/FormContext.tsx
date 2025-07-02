// FormContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "lib/supabase"; 
import { Alert } from "react-native";

// Define the shape of a form submission request
export interface RequestData {
  id?: number;
  request_id?: number;
  title: string;
  description: string;
  course: string;
  user_id: number;
  course_id: string;
  create_date: string;
  created_at?: string;
}

// Define the context value type
interface FormContextType {
  requests: RequestData[];
  activeRequests: RequestData[];
  expiredRequests: RequestData[];
  addRequest: (
    data: Omit<
      RequestData,
      "id" | "request_id" | "user_id" | "course_id" | "create_date"
    >
  ) => Promise<void>;
  deleteRequest: (requestId: number) => Promise<void>;
  fetchRequests: () => Promise<void>;
  loading: boolean;
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
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to check if a request is expired (15 days)
  const isExpired = (createDate: string): boolean => {
    const created = new Date(createDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 15;
  };

  // Separate active and expired requests
  const activeRequests = requests.filter((req) => !isExpired(req.create_date));
  const expiredRequests = requests.filter((req) => isExpired(req.create_date));

  // Fetch requests from Supabase
  const fetchRequests = async () => {
    try {
      setLoading(true);
      // For now, we'll get all requests. In a real app, you'd filter by user_id
      const { data, error } = await supabase
        .from("Request")
        .select("*")
        .order("create_date", { ascending: false });

      if (error) {
        console.error("Error fetching requests:", error);
        Alert.alert("Error", "Failed to fetch requests");
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      Alert.alert("Error", "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  // Add a new request to Supabase
  const addRequest = async (
    data: Omit<
      RequestData,
      "id" | "request_id" | "user_id" | "course_id" | "create_date"
    >
  ) => {
    try {
      setLoading(true);

      // In a real app, you'd get the actual user_id from authentication
      // For now, using a placeholder
      const requestData = {
        title: data.title,
        description: data.description,
        course_id: data.course, // Using course as course_id
        user_id: 1, // Placeholder - replace with actual user ID
        create_date: new Date().toISOString().split("T")[0], // Today's date in YYYY-MM-DD format
      };

      const { data: newRequest, error } = await supabase
        .from("Request")
        .insert([requestData])
        .select()
        .single();

      if (error) {
        console.error("Error adding request:", error);
        Alert.alert("Error", "Failed to create request");
        return;
      }

      // Add the new request to local state
      setRequests((prev) => [newRequest, ...prev]);
      Alert.alert("Success", "Request created successfully!");
    } catch (error) {
      console.error("Error adding request:", error);
      Alert.alert("Error", "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  // Delete a request from Supabase
  const deleteRequest = async (requestId: number) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("Request")
        .delete()
        .eq("request_id", requestId);

      if (error) {
        console.error("Error deleting request:", error);
        Alert.alert("Error", "Failed to delete request");
        return;
      }

      // Remove the request from local state
      setRequests((prev) => prev.filter((req) => req.request_id !== requestId));
      Alert.alert("Success", "Request deleted successfully!");
    } catch (error) {
      console.error("Error deleting request:", error);
      Alert.alert("Error", "Failed to delete request");
    } finally {
      setLoading(false);
    }
  };

  // Fetch requests on component mount
  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <FormContext.Provider
      value={{
        requests,
        activeRequests,
        expiredRequests,
        addRequest,
        deleteRequest,
        fetchRequests,
        loading,
      }}
    >
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
