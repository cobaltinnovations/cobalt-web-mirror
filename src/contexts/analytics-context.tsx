import useAccount from '@/hooks/use-account';
import config from '@/lib/config';
import mixpanel, { Mixpanel } from 'mixpanel-browser';
import React, { FC, PropsWithChildren, createContext, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactGA from 'react-ga';

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
import { AUTH_REDIRECT_URLS } from '@/lib/config/constants';

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
	constructor(public action: MainNavEventActions, public label?: string) {}
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
	constructor(public action: TopicCenterEventActions, public category: string, public label?: string) {
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

export interface AnalyticsEvent extends Record<string, any> {
	action: string;
	category?: string;
	label?: string;
	nonInteractive?: boolean;
}

const AnalyticsContext = createContext<
	| {
			mixpanel: Mixpanel;
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
	const { institution, account } = useAccount();

	const enabledVersionsRef = useRef({
		mixpanel: false,
		reactGa: false,
		ga4: false,
	});
	const isReactGAEnabled = enabledVersionsRef.current.reactGa;
	const isGA4Enabled = enabledVersionsRef.current.ga4;
	const configuredMeasurementIdsRef = useRef<Record<string, boolean>>({});

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

	const configureMeasurementId = useCallback((measurementId: string) => {
		if (!enabledVersionsRef.current.ga4 || configuredMeasurementIdsRef.current[measurementId]) {
			return;
		}

		gtag('config', measurementId, {
			send_page_view: false,
		});

		configuredMeasurementIdsRef.current[measurementId] = true;
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
		const mixpanelId = config.COBALT_WEB_MIXPANEL_ID;
		if (!mixpanelId) {
			return;
		}

		enabledVersionsRef.current.mixpanel = true;
		mixpanel.init(mixpanelId);
	}, []);

	const initialMeasurementId = config.COBALT_WEB_GA4_MEASUREMENT_ID || institution?.ga4MeasurementId;
	useEffect(() => {
		if (!initialMeasurementId) {
			return;
		}

		enabledVersionsRef.current.ga4 = true;
		//@ts-expect-error
		window.dataLayer = window.dataLayer || [];

		// GTM URL is slightly different from GA4
		const scriptSrc = initialMeasurementId.startsWith('GTM-')
			? `https://www.googletagmanager.com/gtm.js?id=${initialMeasurementId}`
			: `https://www.googletagmanager.com/gtag/js?id=${initialMeasurementId}`;

		const script = document.createElement('script');
		script.async = true;
		script.type = 'text/javascript';
		script.src = scriptSrc;

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

	useEffect(() => {
		if (enabledVersionsRef.current.reactGa) {
			if (Object.keys(commonData).length > 0) {
				ReactGA.set({ ...commonData });
			}
		}

		if (enabledVersionsRef.current.ga4) {
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
	const page = AUTH_REDIRECT_URLS.some((url) => location.pathname === url)
		? location.pathname
		: location.pathname + location.search;

	useEffect(() => {
		if (!isReactGAEnabled) {
			return;
		}

		ReactGA.set({ page, ...commonData });
		ReactGA.pageview(page);
	}, [commonData, isReactGAEnabled, page]);

	useEffect(() => {
		if (!isGA4Enabled) {
			return;
		}

		gtag('set', { page, ...commonData });
		for (const measurementId of Object.keys(configuredMeasurementIdsRef.current)) {
			gtagPageView(measurementId, page);
		}
	}, [gtagPageView, isGA4Enabled, page, commonData]);

	const trackEvent = useCallback(
		(event: AnalyticsEvent) => {
			if (enabledVersionsRef.current.reactGa) {
				if (event.category) {
					ReactGA.event({
						...event,
						action: event.action,
						category: event.category,
					});
				}
			}

			if (enabledVersionsRef.current.ga4) {
				for (const measurementId of Object.keys(configuredMeasurementIdsRef.current)) {
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

					gtag('event', event.action, {
						send_to: measurementId,
						timestamp: Date.now(),
						...commonData,
						...customData,
					});
				}
			}
		},
		[commonData]
	);

	const trackModalView = useCallback(
		(modalName: string) => {
			if (enabledVersionsRef.current.reactGa) {
				ReactGA.modalview(modalName);
			}

			if (enabledVersionsRef.current.ga4) {
				for (const measurementId of Object.keys(configuredMeasurementIdsRef.current)) {
					gtagPageView(measurementId, `/modal/${modalName}`);
				}
			}
		},
		[gtagPageView]
	);

	return (
		<AnalyticsContext.Provider
			value={{
				mixpanel,
				trackEvent,
				trackModalView,
			}}
		>
			{props.children}
		</AnalyticsContext.Provider>
	);
};

export { AnalyticsContext, AnalyticsProvider };
