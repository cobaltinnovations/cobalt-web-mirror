function fallbackCopyTextToClipboard(text: string, successCallback?: () => void, errorCallback?: (error: any) => void) {
	if (typeof document === 'undefined' || !document.body) {
		errorCallback?.(new Error('Clipboard fallback unavailable: no document.'));
		return;
	}

	const textarea = document.createElement('textarea');
	textarea.value = text;

	// Avoid mobile keyboard and visual disruption
	textarea.setAttribute('readonly', '');
	textarea.style.position = 'fixed';
	textarea.style.top = '0';
	textarea.style.left = '0';
	textarea.style.width = '1px';
	textarea.style.height = '1px';
	textarea.style.opacity = '0';
	textarea.style.pointerEvents = 'none';
	textarea.style.zIndex = '-1';

	const activeElement = document.activeElement as HTMLElement | null;

	document.body.appendChild(textarea);

	let succeeded = false;
	let caughtError: any | null = null;

	try {
		textarea.focus();
		textarea.select();

		// execCommand can return false instead of throwing
		succeeded = !!document.execCommand && document.execCommand('copy');
	} catch (error) {
		caughtError = error;
	} finally {
		document.body.removeChild(textarea);

		// Try to restore focus to whatever had it before
		if (activeElement && typeof activeElement.focus === 'function') {
			try {
				activeElement.focus();
			} catch {
				// ignore focus errors
			}
		}
	}

	if (succeeded) {
		successCallback?.();
	} else {
		const error = caughtError ?? new Error('document.execCommand("copy") did not succeed.');
		errorCallback?.(error);
	}
}

export function copyTextToClipboard(text: string, successCallback?: () => void, errorCallback?: (error: any) => void) {
	// Non-browser / SSR guard
	if (typeof window === 'undefined' || typeof navigator === 'undefined') {
		errorCallback?.(new Error('Clipboard not available in this environment.'));
		return;
	}

	const hasAsyncClipboard = !!navigator.clipboard && typeof navigator.clipboard.writeText === 'function';

	// Async Clipboard API only works in secure contexts; fall back otherwise
	if (!hasAsyncClipboard || !window.isSecureContext) {
		fallbackCopyTextToClipboard(text, successCallback, errorCallback);
		return;
	}

	try {
		navigator.clipboard
			.writeText(text)
			.then(() => {
				successCallback?.();
			})
			.catch((err) => {
				// If async API fails (permissions, user gesture, etc.),
				// try the legacy fallback as a second chance
				fallbackCopyTextToClipboard(text, successCallback, (fallbackErr) => {
					// Prefer the fallback error if present, but keep the original as a backup
					errorCallback?.(fallbackErr ?? err);
				});
			});
	} catch (err) {
		// Some older implementations may throw synchronously
		fallbackCopyTextToClipboard(text, successCallback, errorCallback);
	}
}
