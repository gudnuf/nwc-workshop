interface WebLN {
    enable: () => Promise<any>;
    sendPayment: (invoice: string) => Promise<any>;
}

declare global {
    interface Window {
        webln: WebLN;
    }
}

export { }