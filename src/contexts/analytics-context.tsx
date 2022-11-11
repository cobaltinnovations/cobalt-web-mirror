import useAccount from '@/hooks/use-account';
import React, { FC, createContext, PropsWithChildren, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';
import config from '@/lib/config';

import {
	AnalyticsEventCategory,
	ContentEventActions,
	CrisisEventActions,
	ProviderSearchEventActions,
	ScreeningEventActions,
} from '@/lib/models/ga-events';
import { AUTH_REDIRECT_URLS } from '@/lib/config/constants';

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
	constructor(public action: ScreeningEventActions, public label?: string) {}
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
	constructor(public action: ContentEventActions, public label?: ContentFilterPill) {}
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
	constructor(public action: ProviderSearchEventActions, public label?: ProviderFilterPill) {}
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
	constructor(public action: CrisisEventActions, public label?: string) {}
}

export type AnalyticsEvent =
	| ScreeningAnalyticsEvent
	| ContentAnalyticsEvent
	| ProviderSearchAnalyticsEvent
	| CrisisAnalyticsEvent;

const AnalyticsContext = createContext<
	| {
			trackEvent: (event: AnalyticsEvent) => void;
			trackModalView: (modalName: string) => void;
	  }
	| undefined
>(undefined);

let gtag = function (...args: unknown[]) {
	//@ts-expect-error googtagmanager expects `arguments` not an Array
	window.dataLayer.push(arguments);
};

if (__DEV__) {
	// exposing this to test/debug in browser console:
	//@ts-expect-error
	window.__GA4__ = window.__GA4__ || [];
	const original = gtag;
	gtag = function devGtag() {
		original(...arguments);
		//@ts-expect-error
		window.__GA4__.push(arguments);
	};
}

const AnalyticsProvider: FC<PropsWithChildren> = (props) => {
	const location = useLocation();
	const { institution, account, initialized } = useAccount();

	const enabledVersionsRef = useRef({
		reactGa: false,
		ga4: false,
	});
	const isReactGAEnabled = enabledVersionsRef.current.reactGa;
	const isGA4Enabled = enabledVersionsRef.current.ga4;
	const configuredMeasurementIdsRef = useRef<Record<string, boolean>>({});

	const configureMeasurementId = useCallback((measurementId: string) => {
		if (!enabledVersionsRef.current.ga4 || configuredMeasurementIdsRef.current[measurementId]) {
			return;
		}

		gtag('config', measurementId, {
			send_page_view: false,
		});

		configuredMeasurementIdsRef.current[measurementId] = true;
	}, []);

	const gtagPageView = useCallback((measurementId: string, page: string) => {
		gtag('event', 'page_view', {
			page_title: document.title,
			page_location: document.location.href,
			page_path: page,
			send_to: measurementId,
		});
	}, []);

	const initialMeasurementId = config.COBALT_WEB_GA4_MEASUREMENT_ID || institution?.ga4MeasurementId;
	useEffect(() => {
		if (!initialMeasurementId) {
			return;
		}

		enabledVersionsRef.current.ga4 = true;
		//@ts-expect-error
		window.dataLayer = window.dataLayer || [];

		const script = document.createElement('script');
		script.async = true;
		script.type = 'text/javascript';
		script.src = `https://www.googletagmanager.com/gtag/js?id=${initialMeasurementId}`;

		document.head.insertBefore(script, document.head.firstChild);

		gtag('js', new Date());
		configureMeasurementId(initialMeasurementId);
	}, [configureMeasurementId, initialMeasurementId]);

	useEffect(() => {
		if (!institution?.ga4MeasurementId) {
			return;
		} else if (!isGA4Enabled) {
			enabledVersionsRef.current.ga4 = true;
		}

		configureMeasurementId(institution.ga4MeasurementId);
	}, [isGA4Enabled, configureMeasurementId, institution?.ga4MeasurementId]);

	useEffect(() => {
		if (!config.COBALT_WEB_GA_TRACKING_ID) {
			return;
		}

		enabledVersionsRef.current.reactGa = true;

		ReactGA.initialize(config.COBALT_WEB_GA_TRACKING_ID, {
			testMode: __DEV__,
		});

		if (__DEV__) {
			// exposing this to test/debug in browser console:
			// access window.__REACT_GA__.testModeAPI.calls for results
			//@ts-expect-error
			window.__REACT_GA__ = ReactGA;
		}
	}, []);

	const accountId = account?.accountId;
	useEffect(() => {
		if (!initialized) {
			return;
		}

		if (enabledVersionsRef.current.reactGa) {
			ReactGA.set({ accountId });
		}

		if (enabledVersionsRef.current.ga4) {
			gtag('set', { accountId });
		}
	}, [accountId, initialized]);

	// track pageviews on navigation
	// discard any search information on auth urls, as it may be sensitive (access token redirect)
	const page = AUTH_REDIRECT_URLS.some((url) => location.pathname === url)
		? location.pathname
		: location.pathname + location.search;

	useEffect(() => {
		if (!initialized || !isReactGAEnabled) {
			return;
		}

		ReactGA.set({ page });
		ReactGA.pageview(page);
	}, [initialized, isReactGAEnabled, page]);

	useEffect(() => {
		if (!initialized || !isGA4Enabled) {
			return;
		}

		gtag('set', { page });
		for (const measurementId of Object.keys(configuredMeasurementIdsRef.current)) {
			gtagPageView(measurementId, page);
		}
	}, [initialized, gtagPageView, isGA4Enabled, page]);

	const trackEvent = useCallback(
		(event: AnalyticsEvent) => {
			if (!initialized) {
				return;
			}

			if (enabledVersionsRef.current.reactGa) {
				ReactGA.event(event);
			}

			if (enabledVersionsRef.current.ga4) {
				for (const measurementId of Object.keys(configuredMeasurementIdsRef.current)) {
					gtag('event', event.action, {
						event_category: event.category,
						event_label: event.label,
						non_interaction: event.nonInteractive,
						send_to: measurementId,
					});
				}
			}
		},
		[initialized]
	);

	const trackModalView = useCallback(
		(modalName: string) => {
			if (!initialized) {
				return;
			}

			if (enabledVersionsRef.current.reactGa) {
				ReactGA.modalview(modalName);
			}

			if (enabledVersionsRef.current.ga4) {
				for (const measurementId of Object.keys(configuredMeasurementIdsRef.current)) {
					gtagPageView(measurementId, `/modal/${modalName}`);
				}
			}
		},
		[initialized, gtagPageView]
	);

	return (
		<AnalyticsContext.Provider
			value={{
				trackEvent,
				trackModalView,
			}}
		>
			{props.children}
		</AnalyticsContext.Provider>
	);
};

export { AnalyticsContext, AnalyticsProvider };
