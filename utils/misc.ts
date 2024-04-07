export const hexToUint8Array = (hexString: string) => {
    if (hexString.length % 2 !== 0) {
      throw new Error("The hex string must have an even number of characters.");
    }
  
    const numBytes = hexString.length / 2;
    const uint8Array = new Uint8Array(numBytes);
  
    for (let i = 0; i < numBytes; i++) {
      const byteHex = hexString.substring(i * 2, i * 2 + 2);
      uint8Array[i] = parseInt(byteHex, 16);
    }
  
    return uint8Array;
  }