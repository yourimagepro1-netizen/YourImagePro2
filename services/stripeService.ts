
// CRITICAL: These functions now interact with a live backend.
// Ensure your backend is deployed and configured correctly at the '/api/' endpoints.

interface VerifiedSession {
    success: boolean;
    productId: 'prod_T9TD33RLHNcb15' | 'prod_T9TFRxXWhEntzu' | 'prod_T9TIhN8PTQHK4w' | 'prod_T9T0AxuPBbXbCC' | 'prod_T9T6Hb6xasuL4i' | 'prod_T9T9VkAt19oEv5' | null;
    stripeCustomerId?: string;
    error?: string;
}

const API_BASE = process.env.API_BASE_URL || '';

/**
 * Creates a Stripe Checkout session by calling the backend API.
 * @param priceId The ID of the price the user wants to purchase.
 * @param userEmail The email of the user making the purchase.
 * @returns An object containing the checkout URL to redirect the user to.
 */
export const createCheckoutSession = async (priceId: string, userEmail: string): Promise<{ url: string }> => {
    console.log(`[Stripe] Creating checkout for priceId: ${priceId} for user: ${userEmail}`);

    // This endpoint must point to your deployed backend service.
    // e.g., 'https://your-backend.yourdomain.com/api/create-checkout-session'
    const API_ENDPOINT = `${API_BASE}/api/create-checkout-session`;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ priceId, userEmail }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
            throw new Error(errorData.error || 'Failed to create checkout session.');
        }

        const session = await response.json();
        if (!session.url) {
            throw new Error('Server did not return a checkout URL.');
        }
        return { url: session.url };

    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
};

/**
 * Verifies a Stripe Checkout session's status by calling the backend API.
 * @param sessionId The ID of the session to verify.
 * @returns An object indicating success, the product purchased, and customer ID.
 */
export const verifyCheckoutSession = async (sessionId: string): Promise<VerifiedSession> => {
    console.log(`[Stripe] Verifying session_id: ${sessionId}`);
    
    // This endpoint must point to your deployed backend service.
    const API_ENDPOINT = `${API_BASE}/api/verify-checkout-session`;

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Verification failed.' }));
            return { success: false, productId: null, error: errorData.error };
        }

        const verificationData = await response.json();

        return {
            success: verificationData.success,
            productId: verificationData.productId || null,
            stripeCustomerId: verificationData.stripeCustomerId,
        };

    } catch (error) {
        console.error("Error verifying checkout session:", error);
        return { success: false, productId: null, error: (error as Error).message };
    }
};

/**
 * Creates a Stripe Customer Portal session for a user to manage their subscription.
 * @param stripeCustomerId The Stripe Customer ID for the user.
 * @returns An object containing the portal URL to redirect the user to.
 */
export const createPortalSession = async (stripeCustomerId: string): Promise<{ url: string }> => {
    console.log(`[Stripe] Creating portal session for customer: ${stripeCustomerId}`);
    const API_ENDPOINT = `${API_BASE}/api/create-portal-session`;
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId: stripeCustomerId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
            throw new Error(errorData.error || 'Failed to create portal session.');
        }
        
        const session = await response.json();
        if (!session.url) {
            throw new Error('Server did not return a portal URL.');
        }
        return { url: session.url };
    } catch (error) {
        console.error("Error creating portal session:", error);
        throw error;
    }
};