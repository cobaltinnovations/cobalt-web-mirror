function fallbackCopyTextToClipboard(text: string, successCallback?: () => void, errorCallback?: (error: any) => void) {
	const tempInput = document.createElement('input');

	tempInput.value = text;

	document.body.appendChild(tempInput);
	tempInput.select();

	try {
		// document.execCommand is depricated,
		// but not all browsers support navigator.clipboard,
		// so we need this fallback
		document.execCommand('copy');

		if (successCallback) {
			successCallback();
		}
	} catch (error) {
		if (errorCallback) {
			errorCallback(error);
		}
	}

	document.body.removeChild(tempInput);
}

export function copyTextToClipboard(text: string, successCallback?: () => void, errorCallback?: (error: any) => void) {
	if (!navigator.clipboard) {
		fallbackCopyTextToClipboard(text, successCallback, errorCallback);
		return;
	}

	navigator.clipboard.writeText(text).then(successCallback, errorCallback);
}
