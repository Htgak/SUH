function toBase64Binary(bytes) {
  let binary = '';
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary);
}

function fromBase64Binary(base64Value) {
  const binary = atob(base64Value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

export function encodeBase64(input) {
  const bytes = new TextEncoder().encode(input);
  return toBase64Binary(bytes);
}

export function decodeBase64(input) {
  const bytes = fromBase64Binary(input.trim());
  return new TextDecoder().decode(bytes);
}
