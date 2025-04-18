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

	// Legacy support for GA (UTM) users.
	// See https://ga-dev-tools.google/ga4/campaign-url-builder/
	const UTM_ID_QUERY_PARAMETER_NAME = 'utm_id';
	const UTM_SOURCE_QUERY_PARAMETER_NAME = 'utm_source';
	const UTM_MEDIUM_QUERY_PARAMETER_NAME = 'utm_medium';
	const UTM_CAMPAIGN_QUERY_PARAMETER_NAME = 'utm_campaign';
	const UTM_TERM_QUERY_PARAMETER_NAME = 'utm_term';
	const UTM_CONTENT_QUERY_PARAMETER_NAME = 'utm_content';

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
	// The workaround is to keep session data (session ID, referring message ID, referring campaign, timestamp) temporarily cached in durable localStorage.
	// When a new session is about to be created, check to see if the temporary cache exists and has a timestamp that's within tolerance
	// (the threshold below).
	const TEMPORARY_SESSION_CACHE_STORAGE_KEY = 'TEMPORARY_SESSION_CACHE';
	const TEMPORARY_SESSION_TIME_THRESHOLD_MILLIS = 5000; // Keep it short to minimize the chances of temporary localstorage "bleeding" into other tabs' sessions

	// Sometimes the workaround above is not sufficient.
	// For example, it can be possible to enter the site and sit for a few seconds, and then click on something to navigate.
	// The act of clicking can trigger the browser to discard its session storage for reasons that are not clear.
	// If the temporary localStorage cache is not applicable, we can fall back to this variable - an object that holds the
	// 3 pieces of session storage data: sessionId, referringMessageId, and referringCampaign.
	let mostRecentSession = undefined;

	// Heartbeat state
	let _heartbeatActive = false;
	let _heartbeatRetryCount = 0;
	let _heartbeatTimeout;

	function _log() {
		if (analyticsConfig.debuggingEnabled !== 'true') return;

		const logArguments = [`[ANALYTICS ${new Date().toISOString()}]`];
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

		if (analyticsConfig.debuggingEnabled === '%ANALYTICS_DEBUGGING_ENABLED%') {
			analyticsConfig.debuggingEnabled = 'true';
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

		// Legacy support for GA (UTM) users.
		// If one or more of these are specified and there is no referring campaign, these will be used as the campaign.
		// See https://ga-dev-tools.google/ga4/campaign-url-builder/
		const utmId = queryParameters[UTM_ID_QUERY_PARAMETER_NAME];
		const utmSource = queryParameters[UTM_SOURCE_QUERY_PARAMETER_NAME];
		const utmMedium = queryParameters[UTM_MEDIUM_QUERY_PARAMETER_NAME];
		const utmCampaign = queryParameters[UTM_CAMPAIGN_QUERY_PARAMETER_NAME];
		const utmTerm = queryParameters[UTM_TERM_QUERY_PARAMETER_NAME];
		const utmContent = queryParameters[UTM_CONTENT_QUERY_PARAMETER_NAME];

		if (fingerprint && _isValidUuid(fingerprint)) _setFingerprint(fingerprint);
		if (sessionId && _isValidUuid(sessionId)) _setSessionId(sessionId);
		if (referringMessageId && referringMessageId.trim().length > 0)
			_setReferringMessageId(referringMessageId.trim()); // Might not be a UUID

		// Special handling for referring campaigns.
		// We first see if a native analytics referring campaign exists, and if not we check for a GA campaign.
		let finalReferringCampaign = undefined;

		if (referringCampaign && referringCampaign.trim().length > 0) {
			// OK, native campaign exists
			finalReferringCampaign = referringCampaign.trim();
		} else {
			// Let's see if there is a GA (UTM) campaign
			const utmData = {};

			if (utmId && utmId.trim().length > 0) utmData[UTM_ID_QUERY_PARAMETER_NAME] = utmId.trim();
			if (utmSource && utmSource.trim().length > 0) utmData[UTM_SOURCE_QUERY_PARAMETER_NAME] = utmSource.trim();
			if (utmMedium && utmMedium.trim().length > 0) utmData[UTM_MEDIUM_QUERY_PARAMETER_NAME] = utmMedium.trim();
			if (utmCampaign && utmCampaign.trim().length > 0)
				utmData[UTM_CAMPAIGN_QUERY_PARAMETER_NAME] = utmCampaign.trim();
			if (utmTerm && utmTerm.trim().length > 0) utmData[UTM_TERM_QUERY_PARAMETER_NAME] = utmTerm.trim();
			if (utmContent && utmContent.trim().length > 0)
				utmData[UTM_CONTENT_QUERY_PARAMETER_NAME] = utmContent.trim();

			if (Object.keys(utmData).length > 0) {
				finalReferringCampaign = JSON.stringify({
					type: 'utm',
					data: utmData,
				});
			}
		}

		if (finalReferringCampaign) _setReferringCampaign(finalReferringCampaign);

		// Ensures that fingerprint and session ID are created if they are not already
		_getFingerprint();
		const initializedSessionId = _getSessionId();

		// Store off session data so we can use it later to restore the session if needed to work around a browser bug
		mostRecentSession = {
			sessionId: initializedSessionId,
			referringMessageId: referringMessageId,
			referringCampaign: finalReferringCampaign,
		};

		_registerVisibilityChangeListener();
		_registerUrlChangedListenerUsingMutationObserver();

		// Perform initial heartbeat
		_startHeartbeat();

		// Persist this initial load as special URL change
		_persistEvent('URL_CHANGED', {
			url: _relativeUrl(window.location.href),
			previousUrl: null,
		});
	}

	function _startHeartbeat() {
		if (_heartbeatActive) return;

		_log('Starting heartbeat');
		_heartbeatActive = true;
		_heartbeatRetryCount = 0;

		if (_heartbeatTimeout) {
			clearTimeout(_heartbeatTimeout);
			_heartbeatTimeout = undefined;
		}

		_performHeartbeat();
	}

	function _endHeartbeat() {
		if (!_heartbeatActive) return;

		_log('Ending heartbeat');
		_heartbeatActive = false;
		_heartbeatRetryCount = 0;

		if (_heartbeatTimeout) {
			clearTimeout(_heartbeatTimeout);
			_heartbeatTimeout = undefined;
		}
	}

	function _performHeartbeat() {
		const HEARTBEAT_INTERVAL_IN_MILLISECONDS = 5000; // 5 seconds
		const EXPONENTIAL_BACKOFF_LIMIT_IN_MILLISECONDS = 60000; // 1 minute

		let succeeded = false;

		try {
			succeeded = _persistEvent('HEARTBEAT', {
				intervalInMilliseconds: HEARTBEAT_INTERVAL_IN_MILLISECONDS,
			});
		} catch (ignored) {
			// Not much we can do here
			_log('Heartbeat failed', ignored);
		} finally {
			if (succeeded) {
				_heartbeatRetryCount = 0;
			} else {
				++_heartbeatRetryCount;
			}
			// Use exponential back-off on error, capped at 1 minute
			const delay =
				_heartbeatRetryCount > 0
					? Math.min(
							HEARTBEAT_INTERVAL_IN_MILLISECONDS * 2 ** _heartbeatRetryCount,
							EXPONENTIAL_BACKOFF_LIMIT_IN_MILLISECONDS
					  )
					: HEARTBEAT_INTERVAL_IN_MILLISECONDS;

			// Schedule the next heartbeat
			_heartbeatTimeout = setTimeout(_performHeartbeat, delay);
		}
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
					_startHeartbeat();
				} else if (document.visibilityState === 'hidden') {
					_persistEvent('SENT_TO_BACKGROUND');
					_endHeartbeat();
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

			let supportedLocales = undefined;
			let locale = undefined;
			let timeZone = undefined;

			try {
				supportedLocales = navigator.languages ? JSON.stringify(navigator.languages) : undefined;
			} catch (ignored) {
				// Don't worry about it
			}

			try {
				locale = new Intl.NumberFormat().resolvedOptions().locale;
			} catch (ignored) {
				// Don't worry about it
			}

			try {
				timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			} catch (ignored) {
				// Don't worry about it
			}

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
				navigatorMaxTouchPoints: navigator.maxTouchPoints,
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
						'X-Client-Device-Supported-Locales': supportedLocales ? supportedLocales : '',
						'X-Client-Device-Locale': locale ? locale : '',
						'X-Client-Device-Time-Zone': timeZone ? timeZone : '',
						'X-Cobalt-Referring-Message-Id': referringMessageId ? referringMessageId : '',
						'X-Cobalt-Referring-Campaign': referringCampaign ? referringCampaign : '',
						'X-Cobalt-Analytics': 'true',
					},
					body: body,
					keepalive: keepalive,
				})
				.then((response) => {
					try {
						// Explicitly read the response body (even though we don't need it)
						// so Chrome and other browsers know the request is fully "done"
						response.text();
					} catch (responseError) {
						// Nothing to do other than log out
						_log('*** ERROR PARSING EVENT PERSISTENCE RESPONSE ***', event, responseError);
					}
				})
				.catch((error) => {
					_log('*** ERROR PERSISTING EVENT TO BACKEND ***', event, error);
					_reportErrorToBackend('PERSISTING_TO_BACKEND', error, analyticsNativeEventTypeId, data);
					return false;
				});

			return true;
		} catch (error) {
			_log('*** ERROR PERSISTING EVENT ***', error, analyticsNativeEventTypeId, data);
			_reportErrorToBackend('PERSISTING', error, analyticsNativeEventTypeId, data);
			return false;
		}
	}

	// Safely report analtics errors to backend
	function _reportErrorToBackend(context, error, analyticsNativeEventTypeId, data) {
		try {
			const normalizedContext = context || 'UNKNOWN';

			// Because JSON.stringify() does not work for Error types, we use Object.getOwnPropertyNames to pull data
			let normalizedError;

			if (error) {
				try {
					normalizedError = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
				} catch (ignored) {
					// Nothing to do
				}
			}

			if (!normalizedError) {
				normalizedError = {
					type: 'UNKNOWN',
					message: 'Error information is either missing or unprocessable.',
				};
			}

			window
				.fetch(`${analyticsConfig.apiBaseUrl}/analytics-native-event-errors`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Cobalt-Webapp-Base-Url': window.location.origin,
						'X-Cobalt-Webapp-Current-Url': window.location.href,
						'X-Client-Device-Type-Id': 'WEB_BROWSER',
						'X-Client-Device-App-Name': 'Cobalt Webapp',
						'X-Client-Device-App-Version': analyticsConfig.appVersion,
					},
					body: JSON.stringify({
						context: normalizedContext,
						analyticsNativeEventTypeId: analyticsNativeEventTypeId,
						data: data,
						error: normalizedError,
					}),
					keepalive: true,
				})
				.then((response) => {
					try {
						// Explicitly read the response body (even though we don't need it)
						// so Chrome and other browsers know the request is fully "done"
						response.text();
					} catch (responseError) {
						// Nothing to do other than log out
						_log('*** ERROR PARSING ERROR REPORT RESPONSE ***', responseError);
					}
				})
				.catch((reportingError) => {
					_log('*** ERROR REPORTING ERROR TO BACKEND ***', reportingError);
				});
		} catch (unexpectedError) {
			// Nothing we can realistically do here
			_log('*** ERROR WHILE REPORTING ERROR TO BACKEND ***', unexpectedError);
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

						// Also store off the session data in a fallback variable
						mostRecentSession = {
							sessionId: sessionId,
							referringMessageId: _getReferringMessageId(),
							referringCampaign: _getReferringCampaign(),
						};

						// Remove the cached value because we no longer need it
						try {
							window.localStorage.removeItem(_namespacedKeyValue(TEMPORARY_SESSION_CACHE_STORAGE_KEY));
						} catch (e) {
							_log('Unable to remove temporary session cache from localStorage', e);
						}
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

			// Didn't work?  Fall back to our variable storage, if present.
			if (!restoredFromTemporarySessionCache && mostRecentSession) {
				sessionId = mostRecentSession.sessionId;
				_setSessionId(sessionId);

				if (_isValidUuid(mostRecentSession.referringMessageId))
					_setReferringMessageId(mostRecentSession.referringMessageId);

				if (mostRecentSession.referringCampaign && mostRecentSession.referringCampaign.trim().length > 0)
					_setReferringCampaign(mostRecentSession.referringCampaign.trim());

				restoredFromTemporarySessionCache = true;
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
			_persistEvent('SESSION_STARTED', document.referrer ? { referringUrl: document.referrer } : undefined);

			// Store off the session data in temporary cache
			window.localStorage.setItem(
				_namespacedKeyValue(TEMPORARY_SESSION_CACHE_STORAGE_KEY),
				JSON.stringify({
					sessionId: sessionId,
					referringMessageId: _getReferringMessageId(),
					referringCampaign: _getReferringCampaign(),
					timestamp: new Date().getTime(),
				})
			);

			// Also store off the session data in a fallback variable
			mostRecentSession = {
				sessionId: sessionId,
				referringMessageId: _getReferringMessageId(),
				referringCampaign: _getReferringCampaign(),
			};
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
