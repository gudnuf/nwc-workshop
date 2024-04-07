import NDK, { NDKEvent, NDKFilter, NDKPrivateKeySigner, NDKSubscriptionOptions } from '@nostr-dev-kit/ndk';
import { generateSecretKey, getPublicKey } from 'nostr-tools';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { hexToUint8Array } from '@/utils/misc';

// define types for return value
let NDKContext: React.Context<
    {
        ndk: NDK,
        keyPair: {
            privateKey: string,
            publicKey: string,
        },
        subscribeAndHandle: (
            filter: NDKFilter,
            handler: (event: NDKEvent) => void,
            opts?: NDKSubscriptionOptions
        ) => void
    }
>;

export const NDKProvider = ({ relays, children }: { relays: string[]; children: React.ReactNode }) => {
    const [privateKey, setPrivateKey] = useState<string>("");
    const [publicKey, setPublicKey] = useState<string>("");
    const seenEvents = new Set<string>();

    // create a new instance of NDK
    const ndk = useRef(new NDK({ explicitRelayUrls: relays }));

    // connect to relays
    useEffect(() => {
        ndk.current.connect()
            .then(() => console.log("NDK connected"))
            .catch(console.error);
    });

    // initialize wallet's private key
    useEffect(() => {
        // check if we've already generated a keypair
        const storedPK = localStorage.getItem('privateKey');

        if (storedPK) {
            setPrivateKey(storedPK);
            setPublicKey(getPublicKey(hexToUint8Array(storedPK)));
        } else {
            // generate a random hex string as private key
            const newPK = Buffer.from(generateSecretKey()).toString('hex');

            console.log("PK", newPK)

            // set and save
            setPrivateKey(newPK);
            const pKBytes = hexToUint8Array(newPK)
            setPublicKey(getPublicKey(pKBytes));
            localStorage.setItem('privateKey', newPK);
        }
    })

    useEffect(() => {
        if (!privateKey) {
            return;
        }
        
        const pkSigner = new NDKPrivateKeySigner(privateKey);

        ndk.current.signer = pkSigner;
    }, [privateKey])

    const handleEvent = (event: NDKEvent, handler: (event: NDKEvent) => void) => {
        const seen = seenEvents.has(event.id);

        if (seen) {
            return;
        } else { 
            seenEvents.add(event.id); 
        }

        handler(event);
    }

    const subscribeAndHandle = (
        filter: NDKFilter,
        handler: (event: NDKEvent) => void,
        opts?: NDKSubscriptionOptions
    ) => {
        // subscribe to the filter
        const sub = ndk.current.subscribe(filter, opts);

        // handle the filter
        sub.on('event', (e: NDKEvent) => handleEvent(e, handler));
    }

    // this is what will be returned by the hook
    const contextValue = {
        ndk: ndk.current,
        keyPair: {
            privateKey,
            publicKey
        },
        subscribeAndHandle,
    };

    // set the value of the context
    NDKContext = createContext(contextValue);

    // sets context value and returns a "provider"
    return (
        <NDKContext.Provider value={contextValue}>{children}</NDKContext.Provider>
    );
}

// gives all components access to what's defined in `contextValue`
export const useNdk = () => useContext(NDKContext);