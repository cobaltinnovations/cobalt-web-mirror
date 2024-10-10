(function (analyticsConfig) {
	const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';
	const SESSION_ID_STORAGE_KEY = 'SESSION_ID';
	const SESSION_ID_QUERY_PARAMETER_NAME = 'a.s';
	const REFERRING_MESSAGE_ID_STORAGE_KEY = 'REFERRING_MESSAGE_ID';
	const REFERRING_MESSAGE_ID_QUERY_PARAMETER_NAME = 'a.m';
	const REFERRING_CAMPAIGN_STORAGE_KEY = 'REFERRING_CAMPAIGN';
	const REFERRING_CAMPAIGN_QUERY_PARAMETER_NAME = 'a.c';
	const FINGERPRINT_STORAGE_KEY = 'FINGERPRINT';
	const FINGERPRINT_QUERY_PARAMETER_NAME = 'a.f';

	// Address issue where some browsers will intermittently "forget" session storage during same-tab redirect flows when the browser prefetches the page.
	// This appears to be a race condition related to prefetching - see https://issues.chromium.org/issues/40940701.
	// This has the undesirable effect of sometimes causing new sessions to be created even though the user has not closed the tab -
	// data in sessionStorage is supposed to be durable for the lifetime of the browser tab, but it can be destroyed in this case.
	//
	// Example of the issue:
	//
	// 1. Open a new browser tab (Chrome OS X) and paste this into the URL bar: http://localhost:3000/?a.c=test and hit enter
	//    (do not open the inspector/console first)
	// 2. Observe data which shows browser behavior - sessionStorage session ID and campaign are unexpectedly lost while the browser
	//    transitions from "prefetch" mode to "normal" mode.
	//
	//     event_type_id     | session_id | campaign |         timestamp          |         url         | document_visibility_state
	// ----------------------+------------+----------+----------------------------+---------------------+---------------------------
	// SESSION_STARTED       |          1 | test     | 2024-10-10 13:39:10.596+00 | /?a.c=test-campaign | hidden
	// URL_CHANGED           |          1 | test     | 2024-10-10 13:39:10.597+00 | /?a.c=test-campaign | hidden
	// BROUGHT_TO_FOREGROUND |          1 | test     | 2024-10-10 13:39:10.804+00 | /?a.c=test-campaign | visible
	// URL_CHANGED           |          2 |          | 2024-10-10 13:39:10.859+00 | /sign-in            | visible
	// SESSION_STARTED       |          2 |          | 2024-10-10 13:39:10.86+00  | /sign-in            | visible
	// PAGE_VIEW_SIGN_IN     |          2 |          | 2024-10-10 13:39:10.868+00 | /sign-in            | visible
	// URL_CHANGED           |          2 |          | 2024-10-10 13:40:05.706+00 | /sign-in            | visible
	// PAGE_VIEW_SIGN_IN     |          2 |          | 2024-10-10 13:40:05.733+00 | /sign-in            | visible
	//
	// The workaround is to keep session data (session ID, referring message ID, referring campaign ID, timestamp) temporarily cached in durable localStorage.
	// When a new session is about to be created, check to see if the temporary cache exists and has a timestamp that's within tolerance
	// (the threshold below).
	const TEMPORARY_SESSION_CACHE_STORAGE_KEY = 'TEMPORARY_SESSION_CACHE';
	const TEMPORARY_SESSION_TIME_THRESHOLD_MILLIS = 5000; // Keep it short to minimize the chances of temporary localstorage "bleeding" into other tabs' sessions

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

		// Query parameters can optionally be used to initialize session and referral IDs.
		// We ensure UUIDs are valid here to prevent copy-paste (or malicious) errors
		const queryParameters = _extractQueryParametersForCurrentUrl();
		const fingerprint = queryParameters[FINGERPRINT_QUERY_PARAMETER_NAME];
		const sessionId = queryParameters[SESSION_ID_QUERY_PARAMETER_NAME];
		const referringMessageId = queryParameters[REFERRING_MESSAGE_ID_QUERY_PARAMETER_NAME];
		const referringCampaign = queryParameters[REFERRING_CAMPAIGN_QUERY_PARAMETER_NAME];

		if (fingerprint && _isValidUuid(fingerprint)) _setFingerprint(fingerprint);
		if (sessionId && _isValidUuid(sessionId)) _setSessionId(sessionId);
		if (referringMessageId && _isValidUuid(referringMessageId)) _setReferringMessageId(referringMessageId);
		if (referringCampaign && referringCampaign.trim().length > 0) _setReferringCampaign(referringCampaign.trim()); // Might not be a UUID

		// Ensures that fingerprint and session ID are created if they are not already
		_getFingerprint();
		_getSessionId();

		_registerVisibilityChangeListener();
		_registerUrlChangedListenerUsingMutationObserver();

		// Persist this initial load as special URL change
		_persistEvent('URL_CHANGED', {
			url: _relativeUrl(window.location.href),
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

	// Detect URL changes without having to use experimental navigate API, which is not universally supported.
	// Thanks to https://stackoverflow.com/a/46428962
	function _registerUrlChangedListenerUsingMutationObserver() {
		const observeUrlChange = () => {
			let oldHref = document.location.href;
			const body = document.querySelector('body');
			const observer = new MutationObserver((mutations) => {
				if (oldHref !== document.location.href) {
					const url = _relativeUrl(document.location.href);
					const previousUrl = _relativeUrl(oldHref);
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

	// Turns an absolute URL like 'https://www.cobaltplatform.com/test?a=c' into a relative '/test?a=c'.
	// Relative URL will always start with a '/'
	function _relativeUrl(url) {
		if (!url || url.trim().length === 0) return url;

		const lowercaseUrl = url.toLowerCase();
		let protocolLength = -1;

		if (lowercaseUrl.startsWith('https://')) protocolLength = 'https://'.length;
		else if (lowercaseUrl.startsWith('http://')) protocolLength = 'http://'.length;

		if (protocolLength === -1) return url;

		// 1. Remove protocol
		// 2. Remove everything before the '/'
		let relativeUrl = url.substring(protocolLength);
		let firstIndexOfSlash = relativeUrl.indexOf('/');

		if (firstIndexOfSlash === -1) relativeUrl = '/' + relativeUrl;
		else relativeUrl = relativeUrl.substring(firstIndexOfSlash);

		return relativeUrl;
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

	// Is the input a valid UUID V1-V5?
	function _isValidUuid(potentialUuid) {
		if (!potentialUuid) return false;

		potentialUuid = potentialUuid.trim();

		if (potentialUuid.length !== 36) return false;

		// Thanks to https://stackoverflow.com/a/13653180
		const result = potentialUuid.match(
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
		);
		return result ? true : false;
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

	function _persistEvent(analyticsNativeEventTypeId, data) {
		try {
			const fingerprint = _getFingerprint();
			const sessionId = _getSessionId();
			const timestamp = window.performance.timeOrigin + window.performance.now();
			const accessToken = _getAccessToken();
			const referringMessageId = _getReferringMessageId();
			const referringCampaign = _getReferringCampaign();

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

			// Enable keepalive only when payload is relatively small.
			// For larger payloads, some browsers can choose to have fetch operations fail if keepalive is set.
			// Unclear if limits are formally documented/consistent, so we pick a "small enough" value for keepalive.
			const body = JSON.stringify(event);
			const keepalive = body.length < 10000;

			window
				.fetch(`${analyticsConfig.apiBaseUrl}/analytics-native-events`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Cobalt-Access-Token': accessToken ? accessToken : '',
						'X-Cobalt-Webapp-Base-Url': window.location.origin,
						'X-Cobalt-Webapp-Current-Url': window.location.href,
						'X-Client-Device-Fingerprint': fingerprint,
						'X-Client-Device-Type-Id': 'WEB_BROWSER',
						'X-Client-Device-App-Name': 'Cobalt Webapp',
						'X-Client-Device-App-Version': analyticsConfig.appVersion,
						'X-Client-Device-Session-Id': sessionId,
						'X-Cobalt-Referring-Message-Id': referringMessageId ? referringMessageId : '',
						'X-Cobalt-Referring-Campaign': referringCampaign ? referringCampaign : '',
						'X-Cobalt-Analytics': 'true',
					},
					body: body,
					keepalive: keepalive,
				})
				.catch((error) => {
					_log('*** ERROR PERSISTING EVENT TO BACKEND ***', event, error);
					return false;
				});

			return true;
		} catch (error) {
			_log('*** ERROR PERSISTING EVENT ***', error, analyticsNativeEventTypeId, data);
			return false;
		}
	}

	function _getAccessToken() {
		return _getCookie(ACCESS_TOKEN_COOKIE_NAME);
	}

	// Will create a fingerprint if one does not already exist
	function _getFingerprint() {
		let fingerprint = window.localStorage.getItem(_namespacedKeyValue(FINGERPRINT_STORAGE_KEY));

		if (!fingerprint) {
			fingerprint = _generateUUID();
			_setFingerprint(fingerprint);
		}

		return fingerprint;
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

	// Will create a session ID if one does not already exist
	function _getSessionId() {
		let sessionId = window.sessionStorage.getItem(_namespacedKeyValue(SESSION_ID_STORAGE_KEY));
		let restoredFromTemporarySessionCache = false;

		// If there is no session ID in session storage, first check to see if we have session data that was cached off to work around
		// a prefetch browser bug documented at the top of this file.  If the cached data exists, apply it to the current session.
		if (!sessionId) {
			// 1. Pull temporary session cache JSON from local storage (if present) and turn it back into a JS object
			const temporarySessionCacheAsString = window.localStorage.getItem(
				_namespacedKeyValue(TEMPORARY_SESSION_CACHE_STORAGE_KEY)
			);
			let temporarySessionCache = undefined;

			if (temporarySessionCacheAsString) {
				try {
					temporarySessionCache = JSON.parse(temporarySessionCacheAsString);
				} catch (e1) {
					_log('Unable to re-hydrate temporary session cache from localStorage', e1);
					temporarySessionCache = undefined;

					// Remove the cached value because it has invalid content
					try {
						window.localStorage.removeItem(_namespacedKeyValue(TEMPORARY_SESSION_CACHE_STORAGE_KEY));
					} catch (e2) {
						_log('Unable to remove temporary session cache from localStorage', e2);
					}
				}
			}

			// 2. If we were able to re-hydrate our temporary session cache from local storage, use its data to populate session storage.
			// Delete the cache when we're done.
			if (temporarySessionCache) {
				try {
					if (typeof temporarySessionCache.timestamp !== 'number')
						throw new Error(
							`Invalid value for temporary session cache timestamp: ${temporarySessionCache.timestamp}`
						);

					const ageOfTemporarySessionCacheInMillis = new Date().getTime() - temporarySessionCache.timestamp;

					// If we're within threshold and the cached data looks valid, restore it.
					if (
						ageOfTemporarySessionCacheInMillis < TEMPORARY_SESSION_TIME_THRESHOLD_MILLIS &&
						_isValidUuid(temporarySessionCache.sessionId)
					) {
						sessionId = temporarySessionCache.sessionId;
						_setSessionId(sessionId);

						if (_isValidUuid(temporarySessionCache.referringMessageId))
							_setReferringMessageId(temporarySessionCache.referringMessageId);

						if (
							temporarySessionCache.referringCampaign &&
							temporarySessionCache.referringCampaign.trim().length > 0
						)
							_setReferringCampaign(temporarySessionCache.referringCampaign.trim());

						restoredFromTemporarySessionCache = true;
					} else {
						_log('Removing temporary session cache.');

						// If we're out of threshold or the data looks invalid, remove the cached value
						try {
							window.localStorage.removeItem(_namespacedKeyValue(TEMPORARY_SESSION_CACHE_STORAGE_KEY));
						} catch (e) {
							_log('Unable to remove temporary session cache from localStorage', e);
						}
					}
				} catch (e1) {
					_log('Unable to apply temporary session cache', e1);
					temporarySessionCache = undefined;

					// Remove the cached value because it has invalid content
					try {
						window.localStorage.removeItem(_namespacedKeyValue(TEMPORARY_SESSION_CACHE_STORAGE_KEY));
					} catch (e2) {
						_log('Unable to remove temporary session cache from localStorage', e2);
					}
				}
			}
		}

		// Send a special event to track the fact that we had to manually restore this session to work around the browser bug
		if (restoredFromTemporarySessionCache) {
			try {
				window.localStorage.removeItem(_namespacedKeyValue(TEMPORARY_SESSION_CACHE_STORAGE_KEY));
			} catch (e) {
				_log('Unable to remove temporary session cache from localStorage', e);
			}

			_persistEvent('SESSION_RESTORED');
		}

		if (!sessionId) {
			sessionId = _generateUUID();
			_setSessionId(sessionId);

			// Let backend know this is a fresh session
			_persistEvent('SESSION_STARTED');

			// Store off the
			window.localStorage.setItem(
				_namespacedKeyValue(TEMPORARY_SESSION_CACHE_STORAGE_KEY),
				JSON.stringify({
					sessionId: sessionId,
					referringMessageId: _getReferringMessageId(),
					referringCampaign: _getReferringCampaign(),
					timestamp: new Date().getTime(),
				})
			);
		}

		return sessionId;
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

	function _getReferringCampaign() {
		return window.sessionStorage.getItem(_namespacedKeyValue(REFERRING_CAMPAIGN_STORAGE_KEY));
	}

	function _setReferringCampaign(referringCampaign) {
		if (referringCampaign && referringCampaign.trim().length > 0) {
			_log(`Setting referring campaign '${referringCampaign}'`);
			window.sessionStorage.setItem(
				_namespacedKeyValue(REFERRING_CAMPAIGN_STORAGE_KEY),
				referringCampaign.trim()
			);
		} else {
			_log('Clearing referring campaign');
			window.sessionStorage.removeItem(_namespacedKeyValue(REFERRING_CAMPAIGN_STORAGE_KEY));
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
	analyticsConfig.context[analyticsConfig.objectName] = {
		// Sends a log event to the backend
		persistEvent: _persistEvent,
		// Gets the session identifier to be included in events.
		// This identifier is cleared when the browser is closed.
		getSessionId: _getSessionId,
		// Gets the referring message identifier to be included in events.
		// This identifier is cleared when the browser is closed.
		getReferringMessageId: _getReferringMessageId,
		// Gets the referring campaign identifier to be included in events.
		// This identifier is cleared when the browser is closed.
		getReferringCampaign: _getReferringCampaign,
		// Gets the fingerprint to be included in events.
		// The fingerprint persists until the user clears localstorage.
		getFingerprint: _getFingerprint,
		// Name of the query parameter that can be used to initialize session ID if needed.
		// Generally 'a.s'
		// Session ID must be a valid UUIDv4 value.
		getSessionIdQueryParameterName: function () {
			return SESSION_ID_QUERY_PARAMETER_NAME;
		},
		// Name of the query parameter that can be used to initialize the referring message ID if needed.
		// Generally 'a.m'
		// Referring Message ID must be a valid UUIDv4 value.
		getReferringMessageIdQueryParameterName: function () {
			return REFERRING_MESSAGE_ID_QUERY_PARAMETER_NAME;
		},
		// Name of the query parameter that can be used to initialize the referring campaign ID if needed.
		// Generally 'a.c'
		// Referring Campaign ID can be any string value.
		getReferringCampaignQueryParameterName: function () {
			return REFERRING_CAMPAIGN_QUERY_PARAMETER_NAME;
		},
		// Name of the query parameter that can be used to initialize fingerprint if needed.
		// Generally 'a.f'
		// Fingerprint must be a valid UUIDv4 value.
		getFingerprintQueryParameterName: function () {
			return FINGERPRINT_QUERY_PARAMETER_NAME;
		},
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
