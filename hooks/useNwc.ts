import NDK, { NDKEvent, NostrEvent } from '@nostr-dev-kit/ndk';
import { generateSecretKey, getPublicKey, nip04 } from 'nostr-tools';

enum ErrorCodes {
    NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
    UNAUTHORIZED = 'UNAUTHORIZED',
    INTERNAL = 'INTERNAL',
    OTHER = 'OTHER',
    // TODO: add remaining nip47 error
}

enum NWCMethods {
    payInvoice = 'pay_invoice',
    makeInvoice = 'make_invoice',
    payKeysend = 'pay_keysend',
    listTransactions = 'list_transactions',
    lookupInvoice = 'lookup_invoice',
    getBalance = 'get_balance',
    getInfo = 'get_info',
    multiPayInvoice = 'multi_pay_invoice',
    multiPayKeysend = 'multi_pay_keysend'
}

type NWCResponseContent = {
    result_type: NWCMethods;
    result?: {
        invoice?: string;
        // TODO: fill in other potential result data types
    }
    error?: {
        code: string;
        message?: string;
    };
}

export class NWCError extends Error {
    constructor(public readonly code: ErrorCodes, message?: string) {
        super(message)
    }
}

interface UseNwcProps {
    ndk: NDK;
    privateKey: string;
    publicKey: string;
}

const useNwc = ({ ndk, privateKey, publicKey }: UseNwcProps) => {
    /**
     * Generate and store a new connection uri
     * @param opts - `budget` to set max amount spendable and `expiryUnix` to set when connection in invalid
     * @returns new uri string
    */
    const generateNwcUri = (opts?: { budgetSat?: number, expiryUnix?: number }): string => {
        // generate a new secret (private key)

        // assemble uri: nostr+walletconnect://<wallet_pubkey>?secret=<generated_secret>&relay=<listening_relay>
        const uri = "I'm not implemented"

        // save uri pubkey, budget, expiry to local storage

        return uri
    }

    /**
     * Use NIP04 to decrypt
     * @param appPubkey The public key of the app the nwc connection was issued to
     * @param encryptedContent Encrypted event content that contains nip47 request data
     * @returns nip47 method and corresponding params
     */
    const decryptNwcRequest = async (
        appPubkey: string, encryptedContent: string
    ): Promise<{ method: NWCMethods; params: object }> => {
        // use NIP04 for decrypt with app's pubkey and OUR private key

        // parse decrypted content ie JSON.parse...

        // validate request format: `{method: nwc_method, params: {method_params}}`

        // NOTE: if the request is bad just ignore it because we may not have method or even been able to decrypt 

        return {
            method: "" as NWCMethods,
            params: {}
        }
    }

    /**
     * Checks that our wallet issued this connection and that budget not exceeded nore is connection expired
     * @param appPubkey - the pubkey of the request event
     * @param params - optional params to validate
     * @throws Error if invalid connection
     * @returns nothing if valid connection
     */
    const validateConnection = (appPubkey: string, params?: { invoice?: string }) => {
        // pull connection out of storage
        const connection = localStorage.getItem(appPubkey)

        // if we never issued a connection for this pubkey, do not proceed
        if (!connection) {
            throw new NWCError(ErrorCodes.UNAUTHORIZED)
        }

        // TODO:
        // 1. make sure not expired
        // 2. if there is an invoice, make sure there is a sufficient remaining budget

        // NOTE: No need to validate a signature because if we can decrypt the event content with app's pubkey, 
        // then they obviously had a private key

        // return void if everything checks out
        return;
    }

    /**
     * Broadcast kind 23195 response event to nostr
     * @param method nip 47 method
     * @param requestEvent incoming kind 23194 request event
     * @param result result to return if no error (optional)
     * @param error error to return if no result (optional)
     */
    const sendNwcResponse = async (method: NWCMethods, requestEvent: NDKEvent, result?: object, error?: NWCError) => {
        const requestId = requestEvent.id;
        const appPubkey = requestEvent.pubkey;

        const content: NWCResponseContent = {
            "result_type": method,
        }

        if (result) {
            content["result"] = result;
        } else if (error) {
            content["error"] = { code: error.code, message: error.message };
        } else {
            throw new Error("sendNwcResponse requires a result or an NWCError")
        }

        console.log("Sending Response: ", content)

        // TODO: use nip04 to encrypt the content with app's pubkey and our private key
        const encryptedResponse = "";

        // construct the kind 23195 response
        const responseEvent = new NDKEvent(ndk, {
            kind: 23195,
            tags: [["e", ""], ["p", ""]], // TODO: add e  and p tags,
            content: encryptedResponse,
        } as NostrEvent)

        try {
            console.log("Publishing: ", responseEvent.rawEvent())
            
            // could throw if ndk doesn't have a signer or if rejected by relays
            await responseEvent.publish();
        } catch (e) {
            console.error(
                "Error publishing response event. Make sure your are signed in and connected to relays...",
                e
            )
        }
    }

    const getBalance = async () => {
        return { balance: 0}
    }

    /**
     * Pay invoice using webln
     * @param params - Input data corresponding to the nip 47 method
     */
    const payInvoice = async (params: any) => {
        const invoice: string = params.invoice;

        if (!invoice) {
            console.error('Invalid nwc request. Recieved params: ', params);
            throw new NWCError(ErrorCodes.OTHER);
        }

        // use webln to pay invoices
        // NOTE: this requires you to have something like Alby browser extension
        try {
            await window.webln.enable();

            const preimage = await window.webln.sendPayment(invoice);
            return { preimage };
        } catch (e) {
            console.error("Error paying invoice", e);
            throw new NWCError(ErrorCodes.INTERNAL);
        }
    }

    const requestHandlers = new Map<NWCMethods, (params: any) => Promise<any>>([
        [NWCMethods.payInvoice, payInvoice],
        [NWCMethods.getBalance, getBalance]
        // TODO: implement the remaining methods
    ]);

    /**
     * Decrypts and processes incoming requests
     * @param event NDKEvent 
     */
    const handleNwcRequest = async (event: NDKEvent) => {
        const { method, params } = await decryptNwcRequest(event.pubkey, event.content);

        console.log("method", method, "\nParams:", params)

        try {
            // will cause error response to be sent if invalid
            validateConnection(event.pubkey, params);

            const handler = requestHandlers.get(method);

            if (!handler) {
                throw new NWCError(ErrorCodes.NOT_IMPLEMENTED);
            }

            // process and then broadcast kind 23195 result to nostr
            await handler(params)
                .then(result => sendNwcResponse(method, event, result));
        } catch (e) {
            if (e instanceof NWCError) {
                sendNwcResponse(method, event, undefined, e);
            } else {
                console.error("Error handling nwc request", e);
            }
        }
    }

    return {
        generateNwcUri,
        handleNwcRequest
    }
}

export default useNwc;