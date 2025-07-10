// reusable RequestItem type
export interface RequestItem {
  request_id: number;
  user_id: string;
  course_id: string;
  title: string;
  description: string;
  tags: string[];
  status: "pending" | "booked" | "completed";
  create_date: string;
  assigned_to?: string;
}

// This type is for inserting new requests before a request_id is assigned by DB
export type NewRequest = Omit<RequestItem, "request_id" | "assigned_to">;
