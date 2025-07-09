// reusable RequestItem type
export interface RequestItem {
  id: number;
  title: string;
  description: string;
  course: string;
  tags: string[];
  week?: string;
  status?: "pending" | "booked" | "completed";
  userId?: string;
}
