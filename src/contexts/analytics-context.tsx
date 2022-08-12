import useAccount from '@/hooks/use-account';
import React, { FC, createContext, PropsWithChildren, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga';
import config from '@/lib/config';

enum AnalyticsEventCategory {
	Screening = 'Screening',
	Content = 'Content',
	ProviderSearch = 'Provider Search',
}

/**
 * Screening Analytics
 */
enum ScreeningEventActions {
	PromptForPhoneNumber = 'Prompted for Phone Number',
	UserSkipPhoneNumberPrompt = 'User Skipped Phone Number Prompt',
}

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
	constructor(public action: ScreeningEventActions) {}
}

/**
 * Content Analytics
 */
enum ContentEventActions {
	UserClickFilterPill = 'User Clicked Filter Pill',
	UserApplyFilter = 'User Applied Filter',
}

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
export enum ProviderSearchEventActions {
	UserClickFilterPill = 'User Clicked Filter Pill',
	UserApplyFilter = 'User Applied Filter',
	UserResetFilters = 'User Reset Filters',
}

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

export type AnalyticsEvent = ScreeningAnalyticsEvent | ContentAnalyticsEvent | ProviderSearchAnalyticsEvent;

const AnalyticsContext = createContext<
	| {
			trackEvent: (event: AnalyticsEvent) => void;
			trackModalView: (modalName: string) => void;
	  }
	| undefined
>(undefined);

const AnalyticsProvider: FC<PropsWithChildren> = (props) => {
	const location = useLocation();
	const { account, initialized: authCtxDidInit } = useAccount();

	useEffect(() => {
		ReactGA.initialize(config.COBALT_WEB_GA_TRACKING_ID, {
			testMode: __DEV__,
		});

		if (__DEV__) {
			// expose this to test/debug ReactGA.testModeAPI.calls
			//@ts-expect-error
			window.__REACT_GA__ = ReactGA;
		}
	}, []);

	// track pageviews on navigation
	const page = location.pathname;
	const accountId = account?.accountId;
	useEffect(() => {
		if (!authCtxDidInit) {
			return;
		}

		ReactGA.set({ page, accountId });
		ReactGA.pageview(page);
	}, [accountId, authCtxDidInit, page]);

	const trackEvent = useCallback((event: AnalyticsEvent) => {
		ReactGA.event(event);
	}, []);

	const trackModalView = useCallback((modalName: string) => {
		ReactGA.modalview(modalName);
	}, []);

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
