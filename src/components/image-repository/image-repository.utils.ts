import { CobaltError } from '@/lib/http-client';

export async function getSha256Hash(blob: Blob): Promise<string> {
	if (!window.crypto?.subtle) {
		throw CobaltError.fromValidationFailed('There was an error preparing your image.');
	}

	const hashBuffer = await window.crypto.subtle.digest('SHA-256', await blob.arrayBuffer());

	return Array.from(new Uint8Array(hashBuffer))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}
