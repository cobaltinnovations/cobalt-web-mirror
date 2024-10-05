(function (analyticsConfig) {
	const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
	const SESSION_ID_STORAGE_KEY = 'SESSION_ID';
	const REFERRING_MESSAGE_ID_STORAGE_KEY = 'REFERRING_MESSAGE_ID';
	const REFERRING_CAMPAIGN_ID_STORAGE_KEY = 'REFERRING_CAMPAIGN_ID';
	const FINGERPRINT_STORAGE_KEY = 'FINGERPRINT';

	// Some browsers will intermittently "forget" session storage during same-tab redirect flows.
	// This appears to be a race condition related to prefetching.
	// This has the undesirable effect of sometimes causing new sessions to be created even though the user has not closed the tab.
	// To work around, we keep "last used" session storage data in more durable localstorage
	// and then if the "last used" time is within a threshold, we can assume a redirect occurred that wiped the session data.
	// This isn't perfect but generally what we want - e.g. it's possible to break this by having multiple browser tabs open
	// and simultaneously redirecting in both, but that is an unlikely scenario.
	// See https://stackoverflow.com/a/77454640
	// const MOST_RECENT_SESSION_STORAGE_KEY = 'MOST_RECENT_SESSION';

	let hasPersistedSessionStartedEvent = false;

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
		if (!analyticsConfig.appVersion) throw new Error('Missing app version in analytics config');
		if (!analyticsConfig.apiBaseUrl) throw new Error('Missing API base URL in analytics config');

		// In local environments, use a hardcoded default.
		// This avoids a lengthy React build process.
		if (analyticsConfig.apiBaseUrl === '%ANALYTICS_API_BASE_URL%') {
			analyticsConfig.apiBaseUrl = 'http://localhost:8080';
		}

		if (analyticsConfig.appVersion === '%ANALYTICS_APP_VERSION%') {
			analyticsConfig.appVersion = 'local';
		}

		// Normalize API base URL by removing trailing slash, if present
		analyticsConfig.apiBaseUrl = analyticsConfig.apiBaseUrl.replace(/\/$/, '');

		const queryParameters = _extractQueryParametersForCurrentUrl();
		const referringMessageId = queryParameters['a.m'];
		const referringCampaignId = queryParameters['a.c'];

		if (referringMessageId) _setReferringMessageId(referringMessageId);
		if (referringCampaignId) _setReferringCampaignId(referringCampaignId);

		_ensureFingerprintAndSessionExist();
		_registerVisibilityChangeListener();
		_registerUrlChangedListenerUsingMutationObserver();

		// Persist this initial load as special URL change
		_persistEvent('URL_CHANGED', {
			url: window.location.href,
			previousUrl: null,
		});
	}

	// Persist events when browser tab is backgrounded/foregrounded.
	function _registerVisibilityChangeListener() {
		let justReceivedPageHide = false;

		window.addEventListener('pagehide', (event) => {
			justReceivedPageHide = true;
		});

		// On hard reloads, Safari will trigger a spurious SENT_TO_BACKGROUND.
		// We detect and ignore this by listening for pagehide events and setting a flag here.
		document.addEventListener('visibilitychange', (event) => {
			if (justReceivedPageHide) {
				justReceivedPageHide = false;
			} else {
				if (document.visibilityState === 'visible') {
					_persistEvent('BROUGHT_TO_FOREGROUND');
				} else if (document.visibilityState === 'hidden') {
					_persistEvent('SENT_TO_BACKGROUND');
				}
			}
		});
	}

	// Detect URL changes without having to use experimental navigate API (see _registerUrlChangedListenerUsingNavigateApi()).
	// Thanks to https://stackoverflow.com/a/46428962
	function _registerUrlChangedListenerUsingMutationObserver() {
		const observeUrlChange = () => {
			let oldHref = document.location.href;
			const body = document.querySelector('body');
			const observer = new MutationObserver((mutations) => {
				if (oldHref !== document.location.href) {
					const url = document.location.href;
					const previousUrl = oldHref;
					oldHref = document.location.href;

					_persistEvent('URL_CHANGED', {
						url: url,
						previousUrl: previousUrl,
					});
				}
			});

			observer.observe(body, {
				childList: true,
				subtree: true,
			});
		};

		observeUrlChange();
	}

	// This API is not supported in Firefox/Safari as of October 2024.
	// Prefer _registerUrlChangedListenerUsingMutationObserver() instead.
	function _registerUrlChangedListenerUsingNavigateApi() {
		window.navigation.addEventListener('navigate', (event) => {
			const url = event.destination.url;
			const previousUrl = window.location.href;
			// const performanceNavigationTiming =_extractPerformanceNavigationTiming();

			// Ignore spurious events
			if (url === previousUrl) return;

			_persistEvent('URL_CHANGED', {
				url: url,
				previousUrl: previousUrl,
			});
		});
	}

	// This API is not supported in Safari as of October 2024.
	// Don't use it for now.
	function _extractPerformanceNavigationTiming() {
		const navigationEntries = window.performance ? window.performance.getEntriesByType('navigation') : [];
		if (!navigationEntries || navigationEntries.length === 0) return undefined;

		return navigationEntries[0];
	}

	function _generateUUID() {
		// The window.crypto.randomUUID() method fails unless
		// used on 'localhost' or HTTPS.
		// Fall back to a "good enough" UUID generator for local environments
		// that do not use localhost (e.g. non-default institutions)
		try {
			return window.crypto.randomUUID();
		} catch (ignored) {
			// Thanks to https://stackoverflow.com/a/2117523
			return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
				(+c ^ (window.crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
			);
		}
	}

	function _extractQueryParametersForCurrentUrl() {
		try {
			const urlSearchParameters = new URLSearchParams(window.location.search);
			const queryParameters = {};

			for (let key of urlSearchParameters.keys()) {
				queryParameters[key] = urlSearchParameters.get(key);
			}

			return queryParameters;
		} catch (ignored) {
			return {};
		}
	}

	function _ensureFingerprintAndSessionExist() {
		// Generate and store fingerprint if one doesn't already exist
		const fingerprint = _getFingerprint();
		if (!fingerprint) _setFingerprint(_generateUUID());

		// Generate and store a session identifier if one doesn't already exist
		const sessionId = _getSessionId();
		if (!sessionId) {
			_setSessionId(_generateUUID());
			// Let backend know this is a fresh session
			_persistEvent('SESSION_STARTED');
		}
	}

	function _persistEvent(analyticsNativeEventTypeId, data) {
		// Ignore any events until `SESSION_STARTED` happens and we are visible.
		// This is to ignore spurious events caused by browser prefetching, e.g. when typing in the URL but before hitting 'enter'
		if (!hasPersistedSessionStartedEvent && document.visibilityState === 'hidden') return;

		if (analyticsNativeEventTypeId === 'SESSION_STARTED') hasPersistedSessionStartedEvent = true;

		_ensureFingerprintAndSessionExist();

		const timestamp = window.performance.timeOrigin + window.performance.now();
		const accessToken = _getAccessToken();
		const referringMessageId = _getReferringMessageId();
		const referringCampaignId = _getReferringCampaignId();

		const event = {
			analyticsNativeEventTypeId: analyticsNativeEventTypeId,
			data: data ? data : {},
			timestamp: timestamp,
			screenColorDepth: window.screen.colorDepth,
			screenPixelDepth: window.screen.pixelDepth,
			screenWidth: window.screen.width,
			screenHeight: window.screen.height,
			screenOrientation: window.screen.orientation ? window.screen.orientation.type : undefined,
			windowWidth: window.innerWidth,
			windowHeight: window.innerHeight,
			windowDevicePixelRatio: window.devicePixelRatio,
			documentVisibilityState: document.visibilityState,
		};

		const hasData = data && Object.keys(data).length > 0;

		if (hasData) _log(`Persisting event ${analyticsNativeEventTypeId} with data`, data);
		else _log(`Persisting event ${analyticsNativeEventTypeId}`);

		window
			.fetch(`${analyticsConfig.apiBaseUrl}/analytics-native-events`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-Cobalt-Access-Token': accessToken ? accessToken : '',
					'X-Cobalt-Webapp-Base-Url': window.location.origin,
					'X-Cobalt-Webapp-Current-Url': window.location.href,
					'X-Client-Device-Fingerprint': _getFingerprint(),
					'X-Client-Device-Type-Id': 'WEB_BROWSER',
					'X-Client-Device-App-Name': 'Cobalt Webapp',
					'X-Client-Device-App-Version': analyticsConfig.appVersion,
					'X-Client-Device-Session-Id': _getSessionId(),
					'X-Cobalt-Referring-Message-Id': referringMessageId ? referringMessageId : '',
					'X-Cobalt-Referring-Campaign-Id': referringCampaignId ? referringCampaignId : '',
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

	function _getReferringMessageId() {
		return window.sessionStorage.getItem(_namespacedKeyValue(REFERRING_MESSAGE_ID_STORAGE_KEY));
	}

	function _setReferringMessageId(referringMessageId) {
		if (referringMessageId) {
			_log(`Setting referring message ID ${referringMessageId}`);
			window.sessionStorage.setItem(_namespacedKeyValue(REFERRING_MESSAGE_ID_STORAGE_KEY), referringMessageId);
		} else {
			_log('Clearing referring message ID');
			window.sessionStorage.removeItem(_namespacedKeyValue(REFERRING_MESSAGE_ID_STORAGE_KEY));
		}
	}

	function _getReferringCampaignId() {
		return window.sessionStorage.getItem(_namespacedKeyValue(REFERRING_CAMPAIGN_ID_STORAGE_KEY));
	}

	function _setReferringCampaignId(referringCampaignId) {
		if (referringCampaignId) {
			_log(`Setting referring campaign ID ${referringCampaignId}`);
			window.sessionStorage.setItem(_namespacedKeyValue(REFERRING_CAMPAIGN_ID_STORAGE_KEY), referringCampaignId);
		} else {
			_log('Clearing referring campaign ID');
			window.sessionStorage.removeItem(_namespacedKeyValue(REFERRING_CAMPAIGN_ID_STORAGE_KEY));
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
	appVersion: document.currentScript.dataset.appversion,
	debuggingEnabled: document.currentScript.dataset.debuggingenabled,
});
