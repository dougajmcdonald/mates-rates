import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover', // Matching installed SDK version
})

export class PaymentService {
    // 1. Create a Stripe Express Account for a Seller
    static async createConnectedAccount() {
        const account = await stripe.accounts.create({
            type: 'express',
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        })
        return account.id
    }

    // 2. Create an Account Link for Onboarding (Redirects user to Stripe)
    static async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string) {
        return await stripe.accountLinks.create({
            account: accountId,
            refresh_url: refreshUrl,
            return_url: returnUrl,
            type: 'account_onboarding',
        })
    }

    // 3. Create a Payment Intent (Buyer pays -> Platform fee -> Seller)
    static async createPaymentIntent(params: {
        amount: number;
        currency: string;
        destinationAccountId: string
    }) {
        // Platform Fee: 1%
        const fee = Math.round(params.amount * 0.01)

        const session = await stripe.paymentIntents.create({
            amount: params.amount,
            currency: params.currency,
            // "Destination Charge" flow
            application_fee_amount: fee,
            transfer_data: {
                destination: params.destinationAccountId,
            },
        })
        return session.client_secret
    }

    static async getAccountStatus(accountId: string) {
        const account = await stripe.accounts.retrieve(accountId)
        return {
            detailsSubmitted: account.details_submitted,
            chargesEnabled: account.charges_enabled,
        }
    }
}
