import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import classNames from 'classnames';
import useAnalytics from '@/hooks/use-analytics';
import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';
import { analyticsService } from '@/lib/services';
import { AnalyticsNativeEventOverlayViewInCrisisSource, AnalyticsNativeEventTypeId } from '@/lib/models';

type InCrisisHeaderButtonProps = Omit<ButtonProps, 'onClick' | 'children'>;

const InCrisisHeaderButton = ({ className, ...buttonProps }: InCrisisHeaderButtonProps) => {
	const { openInCrisisModal } = useInCrisisModal();
	const { trackEvent } = useAnalytics();

	return (
		<Button
			onClick={(e) => {
				trackEvent(CrisisAnalyticsEvent.clickCrisisHeader());
				trackEvent({
					action: 'In Crisis Button',
				});

				analyticsService.persistEvent(AnalyticsNativeEventTypeId.OVERLAY_VIEW_IN_CRISIS, {
					source: AnalyticsNativeEventOverlayViewInCrisisSource.PATIENT_HEADER,
				});

				openInCrisisModal();
			}}
			className={classNames('d-flex align-items-center', className)}
			size="sm"
			{...buttonProps}
		>
			<PhoneIcon height={20} width={20} className="me-1" />
			In Crisis?
		</Button>
	);
};

export default InCrisisHeaderButton;
