import React, { FC, forwardRef, PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';

import { Provider, AvailabilityTimeSlot } from '@/lib/models';
import mediaQueries from '@/jss/media-queries';
import { ProviderInfoCard } from './provider-info-card';

const useAvailableProviderStyles = createUseStyles({
	availableProvider: {
		[mediaQueries.md]: {
			paddingBottom: 57,
		},
	},
	horizontalScroller: {
		marginTop: 10,
		display: 'flex',
		flexWrap: 'wrap',
		[mediaQueries.md]: {
			left: 0,
			bottom: 0,
			zIndex: 0,
			margin: 0,
			marginLeft: -20,
			paddingTop: 40,
			paddingLeft: 20,
			overflowX: 'auto',
			flexWrap: 'nowrap',
			position: 'absolute',
			width: `calc(100% + 40px)`,
		},
	},
	ineligible: {
		opacity: 0.5,
	},
	availabilityButton: {
		[mediaQueries.md]: {
			width: 125,
			flexShrink: 0,
		},
	},
});

interface AvailableProviderProps extends PropsWithChildren {
	ref?: React.ForwardedRef<HTMLDivElement>;
	provider: Provider;
	onTimeSlotClick: (timeSlot: AvailabilityTimeSlot) => void;
	className?: string;
	selectedTimeSlot?: AvailabilityTimeSlot;
}

const AvailableProvider: FC<AvailableProviderProps> = forwardRef<HTMLDivElement, AvailableProviderProps>(
	({ className, provider, onTimeSlotClick, selectedTimeSlot, children }, ref) => {
		const classes = useAvailableProviderStyles();

		return (
			<div
				ref={ref}
				className={classNames(
					classes.availableProvider,
					'position-relative',
					{
						[classes.ineligible]: !!provider.intakeAssessmentIneligible,
					},
					className
				)}
			>
				<ProviderInfoCard provider={provider}>{children}</ProviderInfoCard>

				{Array.isArray(provider.times) && (
					<div className={classes.horizontalScroller}>
						{provider.fullyBooked ? (
							<p>all appointments are booked for this date</p>
						) : (
							provider.times.map((availability) => (
								<Button
									size="sm"
									variant={selectedTimeSlot === availability ? 'primary' : 'light'}
									className={classNames(`${classes.availabilityButton}`, 'me-1', 'mb-1')}
									disabled={availability.status !== 'AVAILABLE'}
									key={availability.time}
									onClick={() => {
										onTimeSlotClick(availability);
									}}
								>
									{availability.timeDescription}
								</Button>
							))
						)}
					</div>
				)}
			</div>
		);
	}
);

export default AvailableProvider;
