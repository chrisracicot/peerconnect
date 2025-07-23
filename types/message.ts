export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  safety_analysis?: {
    hate?: number;
    selfHarm?: number;
    sexual?: number;
    violence?: number;
  };
}
