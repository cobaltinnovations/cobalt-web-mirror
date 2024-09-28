(function (analyticsConfig) {
	const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
	const SESSION_ID_STORAGE_KEY = 'SESSION_ID';
	const FINGERPRINT_STORAGE_KEY = 'FINGERPRINT';

	function _log() {
		if (analyticsConfig.debuggingEnabled !== 'true') return;

		const logArguments = ['[ANALYTICS]'];
		logArguments.push(...arguments);
		console.log.apply(this, logArguments);
	}

	function _initialize() {
		if (!analyticsConfig.context) throw new Error('Missing context in analytics config');
		if (!analyticsConfig.objectName) throw new Error('Missing object name in analytics config');
		if (!analyticsConfig.storageNamespace) throw new Error('Missing storage namespace in analytics config');
		if (!analyticsConfig.apiBaseUrl) throw new Error('Missing API base URL in analytics config');

		// Generate and store fingerprint if one doesn't already exist
		const fingerprint = _getFingerprint();
		if (!fingerprint) _setFingerprint(window.crypto.randomUUID());

		// Generate and store a session identifier if one doesn't already exist
		const sessionId = _getSessionId();
		if (!sessionId) {
			_setSessionId(window.crypto.randomUUID());
			// Let backend know this is a fresh session
			_persistEvent('SESSION_STARTED');
		}

		// TODO: have internal event types like these that clients cannot use
		document.addEventListener('visibilitychange', (event) => {
			if (document.visibilityState === 'visible') {
				_persistEvent('BROUGHT_TO_FOREGROUND');
			} else if (document.visibilityState === 'hidden') {
				_persistEvent('SENT_TO_BACKGROUND');
			}
		});

		// Let router handle URL changes instead of tracking them here

		// window.navigation.addEventListener('navigate', (event) => {
		// 	_persistEvent('URL_CHANGED', { url: event.destination.url });
		// });

		//_persistEvent('URL_CHANGED', { url: window.location.href });
	}

	function _persistEvent(analyticsNativeEventTypeId, data) {
		const timestamp = window.performance.timeOrigin + window.performance.now();
		const accessToken = _getAccessToken();
		console.log('accessToken', accessToken);

		const event = {
			analyticsNativeEventTypeId: analyticsNativeEventTypeId,
			data: data ? data : {},
			fingerprint: _getFingerprint(),
			sessionId: _getSessionId(),
			timestamp: timestamp,
			url: window.location.href,
			userAgent: window.navigator.userAgent,
			screenColorDepth: window.screen.colorDepth,
			screenPixelDepth: window.screen.pixelDepth,
			screenWidth: window.screen.width,
			screenHeight: window.screen.height,
			screenOrientation: window.screen.orientation ? window.screen.orientation.type : undefined,
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight,
			windowDevicePixelRatio: window.devicePixelRatio,
		};

		_log('TODO: persist event', event);

		// const apiBaseUrl = "http://localhost:9999";

		window
			.fetch(`${analyticsConfig.apiBaseUrl}/analytics-native-events`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Cobalt-Access-Token': accessToken ? accessToken : '',
					'X-Cobalt-Webapp-Current-Url': window.location.href,
					'X-Cobalt-Analytics': 'true',
				},
				body: JSON.stringify(event),
				keepalive: true,
			})
			.catch((error) => {
				_log('*** ERROR PERSISTING EVENT ***', event, error);
			});
	}

	function _getAccessToken() {
		return _getCookie(ACCESS_TOKEN_COOKIE_NAME);
	}

	function _getFingerprint() {
		return window.localStorage.getItem(_namespacedKeyValue(FINGERPRINT_STORAGE_KEY));
	}

	function _setFingerprint(fingerprint) {
		if (fingerprint) {
			_log(`Setting fingerprint ${fingerprint}`);
			window.localStorage.setItem(_namespacedKeyValue(FINGERPRINT_STORAGE_KEY), fingerprint);
		} else {
			_log('Clearing fingerprint');
			window.localStorage.removeItem(_namespacedKeyValue(FINGERPRINT_STORAGE_KEY));
		}
	}

	function _getSessionId() {
		return window.sessionStorage.getItem(_namespacedKeyValue(SESSION_ID_STORAGE_KEY));
	}

	function _setSessionId(sessionId) {
		if (sessionId) {
			_log(`Setting session ID ${sessionId}`);
			window.sessionStorage.setItem(_namespacedKeyValue(SESSION_ID_STORAGE_KEY), sessionId);
		} else {
			_log('Clearing session ID');
			window.sessionStorage.removeItem(_namespacedKeyValue(SESSION_ID_STORAGE_KEY));
		}
	}

	function _namespacedKeyValue(nonNamespacedKeyValue) {
		return `${analyticsConfig.storageNamespace}.${nonNamespacedKeyValue}`;
	}

	// Thanks to https://stackoverflow.com/a/52235935
	function _getCookie(name) {
		return (document.cookie.match('(?:^|;)\\s*' + name.trim() + '\\s*=\\s*([^;]*?)\\s*(?:;|$)') || [])[1];
	}

	// Public interface
	analyticsConfig.context[analyticsConfig.analyticsObjectName] = {
		// Sends a log event to the backend
		persistEvent: _persistEvent,
		// Gets the session identifier to be included in events.
		// This identifier is cleared when the browser is closed.
		getSessionId: _getSessionId,
		// Gets the fingerprint to be included in events.
		// The fingerprint persists until the user clears localstorage.
		getFingerprint: _getFingerprint,
	};

	_initialize();
})({
	context: window,
	objectName: document.currentScript.dataset.objectname,
	storageNamespace: document.currentScript.dataset.storagenamespace,
	apiBaseUrl: document.currentScript.dataset.apibaseurl,
	debuggingEnabled: document.currentScript.dataset.debuggingenabled,
});
