import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';

import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import classNames from 'classnames';
import useAnalytics from '@/hooks/use-analytics';
import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';
import { analyticsService } from '@/lib/services';
import { AnalyticsNativeEventOverlayViewInCrisisSource, AnalyticsNativeEventTypeId } from '@/lib/models';
import SvgIcon from '@/components/svg-icon';

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
			<SvgIcon kit="fas" icon="phone" size={16} className="me-2" />
			In Crisis?
		</Button>
	);
};

export default InCrisisHeaderButton;
