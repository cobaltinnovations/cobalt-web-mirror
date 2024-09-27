(function (context, analyticsName) {
	// TODO: use data- attribute to prefix/namespace
	const ACCOUNT_ID_STORAGE_KEY = 'ACCOUNT_ID';
	const SESSION_ID_STORAGE_KEY = 'SESSION_ID';
	const FINGERPRINT_STORAGE_KEY = 'FINGERPRINT';

	// TODO: use data- attribute to disable logging
	function _log() {
		const logArguments = ['[ANALYTICS]'];
		logArguments.push(...arguments);
		console.log.apply(this, logArguments);
	}

	function _initialize() {
		// TODO: enable access to data attributes via document.currentScript.dataset
		// Examples are:
		// * API base URL
		// * Logging enabled/disabled
		// * Namespace for local/session storage keys
		const fingerprint = _getFingerprint();

		if (!_getFingerprint()) _setFingerprint(window.crypto.randomUUID());

		_setSessionId(window.crypto.randomUUID());

		_persistEvent('URL_CHANGED', { url: window.location.href });

		// TODO: have internal event types like these that clients cannot use
		document.addEventListener('visibilitychange', (event) => {
			if (document.visibilityState === 'visible') {
				_persistEvent('BROWSER_VISIBLE');
			} else if (document.visibilityState === 'hidden') {
				_persistEvent('BROWSER_HIDDEN');
			}
		});

		window.navigation.addEventListener('navigate', (event) => {
			_persistEvent('URL_CHANGED', { url: event.destination.url });
		});
	}

	function _persistEvent(type, data) {
		const timestampOrigin = window.performance.timeOrigin;
		const timestamp = window.performance.timeOrigin + window.performance.now();
		const event = {
			type: type,
			data: data,
			accountId: _getAccountId(),
			fingerprint: _getFingerprint(),
			sessionId: _getSessionId(),
			sessionStartedTimestamp: timestampOrigin,
			timestamp: timestamp,
			url: window.location.href,
		};

		_log('TODO: persist event', event);

		// const apiBaseUrl = "http://localhost:9999";

		// window.fetch(`${apiBaseUrl}/event`, {
		//     method: "POST",
		//     headers: {
		//         "Content-Type": "application/json",
		//     },
		//     body: JSON.stringify(event),
		//     keepalive: true,
		// })
		// .catch((error) => {
		//     _log("*** ERROR PERSISTING EVENT ***", event, error);
		// });
	}

	function _getAccountId() {
		return window.localStorage.getItem(ACCOUNT_ID_STORAGE_KEY);
	}

	function _setAccountId(accountId) {
		if (accountId) {
			_log(`Setting account ID ${accountId}`);
			window.localStorage.setItem(ACCOUNT_ID_STORAGE_KEY, accountId);
		} else {
			_log('Clearing account ID');
			window.localStorage.removeItem(ACCOUNT_ID_STORAGE_KEY);
		}
	}

	function _getFingerprint() {
		return window.localStorage.getItem(FINGERPRINT_STORAGE_KEY);
	}

	function _setFingerprint(fingerprint) {
		if (fingerprint) {
			_log(`Setting fingerprint ${fingerprint}`);
			window.localStorage.setItem(FINGERPRINT_STORAGE_KEY, fingerprint);
		} else {
			_log('Clearing fingerprint');
			window.localStorage.removeItem(FINGERPRINT_STORAGE_KEY);
		}
	}

	function _getSessionId() {
		return window.sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
	}

	function _setSessionId(sessionId) {
		if (sessionId) {
			_log(`Setting session ID ${sessionId}`);
			window.sessionStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId);
		} else {
			_log('Clearing session ID');
			window.sessionStorage.removeItem(SESSION_ID_STORAGE_KEY);
		}
	}

	// Public interface
	context[analyticsName] = {
		// Sends a log event to the backend
		persistEvent: _persistEvent,
		// Sets/clears the account identifier to be included in events.
		// This identifier persists when the browser is closed.
		setAccountId: _setAccountId,
		getAccountId: _getAccountId,
		// Sets/clears the session identifier to be included in events.
		// This identifier is cleared when the browser is closed.
		setSessionId: _setSessionId,
		getSessionId: _getSessionId,
		getFingerprint: _getFingerprint,
	};

	_initialize();
})(window, '__analytics');
