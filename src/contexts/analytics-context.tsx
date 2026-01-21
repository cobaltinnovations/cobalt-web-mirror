import useAccount from '@/hooks/use-account';
import { config } from '@/config';
import mixpanel, { Mixpanel } from 'mixpanel-browser';
import React, { FC, PropsWithChildren, createContext, useCallback, useEffect, useMemo, useRef } from 'react';

import {
	AnalyticsEventCategory,
	ContentEventActions,
	CrisisEventActions,
	MainNavEventActions,
	ProviderSearchEventActions,
	ScreeningEventActions,
	TopicCenterEventActions,
} from '@/lib/models/ga-events';
import { useLocation } from 'react-router-dom';
import useUrlViewTracking from '@/hooks/use-url-view-tracking';

/**
 * LeftNav Analytics
 */
export class MainNavAnalyticsEvent {
	static clickMainNavItem(label: string) {
		const event = new MainNavAnalyticsEvent(MainNavEventActions.UserClickNavItem, label);

		return event;
	}

	nonInteractive = false;
	category = AnalyticsEventCategory.LeftNav;
	constructor(
		public action: MainNavEventActions,
		public label?: string
	) {}
}

/**
 * Screening Analytics
 */
export class ScreeningAnalyticsEvent {
	static promptForPhoneNumber() {
		const event = new ScreeningAnalyticsEvent(ScreeningEventActions.PromptForPhoneNumber);
		event.nonInteractive = true;

		return event;
	}

	static skipPhoneNumberPrompt() {
		const event = new ScreeningAnalyticsEvent(ScreeningEventActions.UserSkipPhoneNumberPrompt);

		return event;
	}

	nonInteractive = false;
	category = AnalyticsEventCategory.Screening;
	constructor(
		public action: ScreeningEventActions,
		public label?: string
	) {}
}

/**
 * Content Analytics
 */
type ContentFilterPill = 'Focus' | 'Format' | 'Length';

export class ContentAnalyticsEvent {
	static clickFilterPill(label: ContentFilterPill) {
		return new ContentAnalyticsEvent(ContentEventActions.UserClickFilterPill, label);
	}

	static applyFilter(label: ContentFilterPill) {
		return new ContentAnalyticsEvent(ContentEventActions.UserApplyFilter, label);
	}

	nonInteractive = false;
	category = AnalyticsEventCategory.Content;
	constructor(
		public action: ContentEventActions,
		public label?: ContentFilterPill
	) {}
}

export class TopicCenterAnalyticsEvent {
	static clickGroupSession(category: string, label: string) {
		return new TopicCenterAnalyticsEvent(TopicCenterEventActions.UserClickGroupSession, category, label);
	}

	static clickGroupSessionByRequest(category: string, label: string) {
		return new TopicCenterAnalyticsEvent(TopicCenterEventActions.UserClickGroupSessionByRequest, category, label);
	}

	static clickPinboardNote(label: string) {
		return new TopicCenterAnalyticsEvent(TopicCenterEventActions.UserClickPinboardNote, 'topic centers', label);
	}

	static clickOnYourTimeContent(label: string) {
		return new TopicCenterAnalyticsEvent(
			TopicCenterEventActions.UserClickOnYourTimeContent,
			'topic centers',
			label
		);
	}

	nonInteractive = false;
	constructor(
		public action: TopicCenterEventActions,
		public category: string,
		public label?: string
	) {
		this.category = `${AnalyticsEventCategory.TopicCenter} - ${category}`;
	}
}

/**
 * Provider Search Analytics
 */
type ProviderFilterPill = 'Days' | 'Times' | 'Provider Type' | 'Availability' | 'Focus' | 'Payment Type';

export class ProviderSearchAnalyticsEvent {
	static clickFilterPill(label: ProviderFilterPill) {
		return new ProviderSearchAnalyticsEvent(ProviderSearchEventActions.UserClickFilterPill, label);
	}

	static applyFilter(label: ProviderFilterPill) {
		return new ProviderSearchAnalyticsEvent(ProviderSearchEventActions.UserApplyFilter, label);
	}

	static resetFilters() {
		return new ProviderSearchAnalyticsEvent(ProviderSearchEventActions.UserResetFilters);
	}

	nonInteractive = false;
	category = AnalyticsEventCategory.ProviderSearch;
	constructor(
		public action: ProviderSearchEventActions,
		public label?: ProviderFilterPill
	) {}
}

export class CrisisAnalyticsEvent {
	static clickCrisisHeader() {
		const event = new CrisisAnalyticsEvent(CrisisEventActions.UserClickCrisisHeader);

		return event;
	}

	static clickCrisisMenu() {
		const event = new CrisisAnalyticsEvent(CrisisEventActions.UserClickCrisisMenu);

		return event;
	}

	static clickCrisisFeedback() {
		const event = new CrisisAnalyticsEvent(CrisisEventActions.UserClickCrisisFeedback);

		return event;
	}

	static clickCrisisICAssessment() {
		const event = new CrisisAnalyticsEvent(CrisisEventActions.UserClickCrisisICAssessment);

		return event;
	}

	static clickCrisisError() {
		const event = new CrisisAnalyticsEvent(CrisisEventActions.UserClickCrisisError);

		return event;
	}

	static clickCrisisTelResource(label: string) {
		const event = new CrisisAnalyticsEvent(CrisisEventActions.UserClickCrisisTelResource, label);

		return event;
	}

	static presentScreeningCrisis() {
		const event = new CrisisAnalyticsEvent(CrisisEventActions.PresentScreeningCrisis);
		event.nonInteractive = true;

		return event;
	}

	nonInteractive = false;
	category = AnalyticsEventCategory.Crisis;
	constructor(
		public action: CrisisEventActions,
		public label?: string
	) {}
}

export interface AnalyticsEvent extends Record<string, any> {
	action: string;
	category?: string;
	label?: string;
	nonInteractive?: boolean;
}

const AnalyticsContext = createContext<
	| {
			mixpanel: { track: Mixpanel['track'] };
			trackEvent: (event: AnalyticsEvent) => void;
			trackModalView: (modalName: string) => void;
	  }
	| undefined
>(undefined);

let gtag = function (...args: unknown[]) {
	void args;
	//@ts-expect-error googtagmanager expects `arguments` not an Array
	window.dataLayer.push(arguments);
};

if (__DEV__) {
	// exposing this to test/debug in browser console:
	//@ts-expect-error
	window.__GA4__ = window.__GA4__ || [];
	const original = gtag;
	gtag = function devGtag(...args: unknown[]) {
		original(...args);
		//@ts-expect-error
		window.__GA4__.push(args);
	};
}

const AnalyticsProvider: FC<PropsWithChildren> = (props) => {
	useUrlViewTracking();
	const location = useLocation();
	const { institution, account } = useAccount();

	const enabledVersionsRef = useRef({
		mixpanel: false,
		gaTracking: false,
		ga4: false,
	});
	const isGaTrackingEnabled = enabledVersionsRef.current.gaTracking;
	const isGA4Enabled = enabledVersionsRef.current.ga4;
	const configuredMeasurementIdsRef = useRef<Record<string, boolean>>({});
	const configuredTrackingIdsRef = useRef<Record<string, boolean>>({});

	const accountId = account?.accountId;
	const accountSourceId = account?.accountSourceId;
	const jobTitle = account?.jobTitle;
	const commonData = useMemo(() => {
		const data: Record<string, string> = {};

		if (accountId) {
			data.user_id = accountId;
		}

		if (accountSourceId) {
			data.login_status = accountSourceId;
		}

		if (jobTitle) {
			data.job_type = jobTitle;
		}

		return data;
	}, [accountId, accountSourceId, jobTitle]);

	const ensureGtagScript = useCallback((trackingId: string) => {
		if (typeof window === 'undefined' || typeof document === 'undefined') {
			return;
		}

		//@ts-expect-error
		window.dataLayer = window.dataLayer || [];

		if (document.getElementById('cobalt-gtag-script')) {
			return;
		}

		const scriptSrc = trackingId.startsWith('GTM-')
			? `https://www.googletagmanager.com/gtm.js?id=${trackingId}`
			: `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;

		const script = document.createElement('script');
		script.id = 'cobalt-gtag-script';
		script.async = true;
		script.type = 'text/javascript';
		script.src = scriptSrc;

		document.head.insertBefore(script, document.head.firstChild);
		gtag('js', new Date());
	}, []);

	const configureMeasurementId = useCallback((measurementId: string) => {
		if (!enabledVersionsRef.current.ga4 || configuredMeasurementIdsRef.current[measurementId]) {
			return;
		}

		gtag('config', measurementId, {
			send_page_view: false,
		});

		configuredMeasurementIdsRef.current[measurementId] = true;
	}, []);

	const configureTrackingId = useCallback((trackingId: string) => {
		if (!enabledVersionsRef.current.gaTracking || configuredTrackingIdsRef.current[trackingId]) {
			return;
		}

		gtag('config', trackingId, {
			send_page_view: false,
		});

		configuredTrackingIdsRef.current[trackingId] = true;
	}, []);

	const gtagPageView = useCallback(
		(measurementId: string, page: string) => {
			gtag('event', 'page_view', {
				timestamp: Date.now(),
				...commonData,
				page_title: document.title,
				page_location: document.location.href,
				page_path: page,
				send_to: measurementId,
			});
		},
		[commonData]
	);

	useEffect(() => {
		const mixpanelId = config.mixPanelId;
		if (!mixpanelId) {
			return;
		}

		enabledVersionsRef.current.mixpanel = true;
		mixpanel.init(mixpanelId);
	}, []);

	const initialMeasurementId = config.ga4MeasurementId || institution?.ga4MeasurementId;
	useEffect(() => {
		if (!initialMeasurementId) {
			return;
		}

		enabledVersionsRef.current.ga4 = true;
		ensureGtagScript(initialMeasurementId);
		configureMeasurementId(initialMeasurementId);
	}, [configureMeasurementId, ensureGtagScript, initialMeasurementId]);

	useEffect(() => {
		if (!institution?.ga4MeasurementId) {
			return;
		} else if (!isGA4Enabled) {
			enabledVersionsRef.current.ga4 = true;
		}

		configureMeasurementId(institution.ga4MeasurementId);
	}, [isGA4Enabled, configureMeasurementId, institution?.ga4MeasurementId]);

	useEffect(() => {
		if (!config.gaTrackingId) {
			return;
		}

		enabledVersionsRef.current.gaTracking = true;
		ensureGtagScript(config.gaTrackingId);
		configureTrackingId(config.gaTrackingId);
	}, [configureTrackingId, ensureGtagScript]);

	useEffect(() => {
		if (Object.keys(commonData).length === 0) {
			return;
		}

		if (enabledVersionsRef.current.gaTracking || enabledVersionsRef.current.ga4) {
			gtag('set', { ...commonData });
		}
	}, [commonData]);

	const institutionId = institution?.institutionId;
	useEffect(() => {
		if (!enabledVersionsRef.current.mixpanel || !institutionId) {
			return;
		}

		if (!accountId) {
			mixpanel.reset();
		} else {
			mixpanel.identify(accountId);
		}

		mixpanel.register({ 'Institution ID': institutionId });
	}, [accountId, institutionId]);

	// track pageviews on navigation
	// discard any search information on auth urls, as it may be sensitive (access token redirect)
	const page = config.authRedirectUrls.some((url) => location.pathname === url)
		? location.pathname
		: location.pathname + location.search;

	useEffect(() => {
		if (!isGaTrackingEnabled && !isGA4Enabled) {
			return;
		}

		gtag('set', { page, ...commonData });
	}, [commonData, isGA4Enabled, isGaTrackingEnabled, page]);

	useEffect(() => {
		if (!isGaTrackingEnabled) {
			return;
		}

		for (const trackingId of Object.keys(configuredTrackingIdsRef.current)) {
			gtagPageView(trackingId, page);
		}
	}, [gtagPageView, isGaTrackingEnabled, page]);

	useEffect(() => {
		if (!isGA4Enabled) {
			return;
		}

		for (const measurementId of Object.keys(configuredMeasurementIdsRef.current)) {
			gtagPageView(measurementId, page);
		}
	}, [gtagPageView, isGA4Enabled, page]);

	const trackEvent = useCallback(
		(event: AnalyticsEvent) => {
			const { category, label, nonInteractive, ...rest } = event;
			const customData: Record<string, unknown> = {
				...rest,
			};
			if (category) {
				customData.event_category = category;
			}

			if (label) {
				customData.event_label = label;
			}

			if (typeof nonInteractive === 'boolean') {
				customData.non_interaction = event.nonInteractive;
			}

			const payloadBase = {
				timestamp: Date.now(),
				...commonData,
				...customData,
			};

			if (enabledVersionsRef.current.gaTracking && category) {
				for (const trackingId of Object.keys(configuredTrackingIdsRef.current)) {
					gtag('event', event.action, {
						send_to: trackingId,
						...payloadBase,
					});
				}
			}

			if (enabledVersionsRef.current.ga4) {
				for (const measurementId of Object.keys(configuredMeasurementIdsRef.current)) {
					gtag('event', event.action, {
						send_to: measurementId,
						...payloadBase,
					});
				}
			}
		},
		[commonData]
	);

	const trackModalView = useCallback(
		(modalName: string) => {
			if (enabledVersionsRef.current.gaTracking) {
				for (const trackingId of Object.keys(configuredTrackingIdsRef.current)) {
					gtagPageView(trackingId, `/modal/${modalName}`);
				}
			}

			if (enabledVersionsRef.current.ga4) {
				for (const measurementId of Object.keys(configuredMeasurementIdsRef.current)) {
					gtagPageView(measurementId, `/modal/${modalName}`);
				}
			}
		},
		[gtagPageView]
	);

	const wrappedMixpanel = useMemo(() => {
		return {
			track: (...args: Parameters<(typeof mixpanel)['track']>) => {
				try {
					mixpanel.track(...args);
				} catch (e) {
					// Catch & Fail silently
				}
			},
		};
	}, []);

	return (
		<AnalyticsContext.Provider
			value={{
				mixpanel: wrappedMixpanel,
				trackEvent,
				trackModalView,
			}}
		>
			{props.children}
		</AnalyticsContext.Provider>
	);
};

export { AnalyticsContext, AnalyticsProvider };
