// lib/utils/requestUtils.ts

/**
 * Check if a request is expired (older than 15 days)
 */
export const isRequestExpired = (createDate: string): boolean => {
  const created = new Date(createDate);
  const now = new Date();
  const daysDiff = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysDiff > 15;
};

/**
 * Get the number of days since request creation
 */
export const getDaysSinceCreation = (createDate: string): number => {
  const created = new Date(createDate);
  const now = new Date();
  return Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );
};

/**
 * Get status badge color based on request status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "#ffc107";
    case "booked":
      return "#28a745";
    case "completed":
      return "#6c757d";
    default:
      return "#666";
  }
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};
