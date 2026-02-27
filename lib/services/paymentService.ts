export interface Transaction {
    id: string;
    sender_id: string;
    receiver_id: string;
    amount: number;
    status: "pending" | "completed" | "failed";
    created_at: string;
    reference_id?: string; // e.g., Booking ID
}

/**
 * Simulates a payment delay and potential failure.
 */
export async function processPseudoPayment(
    senderId: string,
    receiverId: string,
    amount: number,
    referenceId?: string
): Promise<Transaction> {
    return new Promise((resolve, reject) => {
        // Simulate network delay of 1.5 seconds
        setTimeout(() => {
            // 90% success rate simulation
            const isSuccess = Math.random() > 0.1;

            if (isSuccess) {
                resolve({
                    id: `txn_${Math.random().toString(36).substring(2, 9)}`,
                    sender_id: senderId,
                    receiver_id: receiverId,
                    amount,
                    status: "completed",
                    created_at: new Date().toISOString(),
                    reference_id: referenceId,
                });
            } else {
                reject(new Error("Payment declined by the pseudo-bank."));
            }
        }, 1500);
    });
}
