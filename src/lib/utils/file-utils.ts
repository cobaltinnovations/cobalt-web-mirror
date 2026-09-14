export function filenameFromContentDisposition(contentDisposition: string | undefined, fallbackFilename: string) {
	if (!contentDisposition) {
		return fallbackFilename;
	}

	const utf8FilenameMatch = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
	if (utf8FilenameMatch?.[1]) {
		try {
			return decodeURIComponent(utf8FilenameMatch[1].trim().replace(/^"|"$/g, ''));
		} catch (ignored) {
			// Continue on to the standard filename parameter.
		}
	}

	const quotedFilenameMatch = contentDisposition.match(/filename\s*=\s*"([^"]+)"/i);
	if (quotedFilenameMatch?.[1]) {
		return quotedFilenameMatch[1];
	}

	const filenameMatch = contentDisposition.match(/filename\s*=\s*([^;]+)/i);
	return filenameMatch?.[1]?.trim() || fallbackFilename;
}

export function downloadBlob(blob: Blob, filename: string) {
	const objectUrl = URL.createObjectURL(blob);
	const link = document.createElement('a');

	try {
		link.href = objectUrl;
		link.download = filename;
		link.style.display = 'none';
		document.body.appendChild(link);
		link.click();
	} finally {
		link.remove();
		URL.revokeObjectURL(objectUrl);
	}
}
