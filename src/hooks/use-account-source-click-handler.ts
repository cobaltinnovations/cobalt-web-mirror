import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '@/config';
import {
	AccountSource,
	AccountSourceId,
	AnalyticsNativeEventAccountSignedOutSource,
	AnalyticsNativeEventTypeId,
} from '@/lib/models';
import { accountService, analyticsService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';

const useAccountSourceClickHandler = () => {
	const navigate = useNavigate();
	const handleError = useHandleError();
	const { account, institution, signOutAndClearContext } = useAccount();

	const handleEnterAnonymouslyButtonClick = useCallback(async () => {
		try {
			const { accessToken } = await accountService
				.createAnonymousAccount({
					accountSourceId: AccountSourceId.ANONYMOUS,
				})
				.fetch();

			navigate({
				pathname: '/auth',
				search: `?accessToken=${accessToken}`,
			});
		} catch (error) {
			handleError(error);
		}
	}, [handleError, navigate]);

	const handleAccountSourceClick = useCallback(
		async (accountSource: AccountSource) => {
			if (account) {
				signOutAndClearContext(AnalyticsNativeEventAccountSignedOutSource.ACCESS_TOKEN_EXPIRED, {}, true);
			}

			if (accountSource.accountSourceId === AccountSourceId.ANONYMOUS) {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_ACCOUNT_SOURCE, {
					accountSourceId: accountSource.accountSourceId,
				});

				handleEnterAnonymouslyButtonClick();
			} else if (accountSource.accountSourceId === AccountSourceId.EMAIL_PASSWORD) {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_ACCOUNT_SOURCE, {
					accountSourceId: accountSource.accountSourceId,
				});

				navigate('/sign-in/email');
			} else if (accountSource.accountSourceId === AccountSourceId.MYCHART) {
				// Construct a query string that preserves analytics information
				const analyticsFingerprint = analyticsService.getFingerprint();
				const analyticsSessionId = analyticsService.getSessionId();
				const analyticsReferringCampaign = analyticsService.getReferringCampaign();
				const analyticsReferringMessageId = analyticsService.getReferringMessageId();

				let redirectSearchComponents = ['redirectImmediately=true'];

				redirectSearchComponents.push(
					`${analyticsService.getFingerprintQueryParameterName()}=${encodeURIComponent(analyticsFingerprint)}`
				);

				redirectSearchComponents.push(
					`${analyticsService.getSessionIdQueryParameterName()}=${encodeURIComponent(analyticsSessionId)}`
				);

				if (analyticsReferringCampaign)
					redirectSearchComponents.push(
						`${analyticsService.getReferringCampaignQueryParameterName()}=${encodeURIComponent(
							analyticsReferringCampaign
						)}`
					);

				if (analyticsReferringMessageId)
					redirectSearchComponents.push(
						`${analyticsService.getReferringMessageIdQueryParameterName()}=${encodeURIComponent(
							analyticsReferringMessageId
						)}`
					);

				const mychartUrl = new URL(config.apiBaseUrl);
				mychartUrl.pathname = `/institutions/${institution?.institutionId}/mychart-authentication-url`;
				mychartUrl.search = redirectSearchComponents.join('&');

				analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_ACCOUNT_SOURCE, {
					accountSourceId: accountSource.accountSourceId,
				});

				window.location.href = mychartUrl.toString();
			} else if (accountSource.ssoUrl) {
				analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_ACCOUNT_SOURCE, {
					accountSourceId: accountSource.accountSourceId,
				});

				window.location.href = accountSource.ssoUrl;
			}
		},
		[account, handleEnterAnonymouslyButtonClick, institution?.institutionId, navigate, signOutAndClearContext]
	);

	return handleAccountSourceClick;
};

export default useAccountSourceClickHandler;
