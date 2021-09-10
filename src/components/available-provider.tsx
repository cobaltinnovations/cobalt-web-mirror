import React, { FC, forwardRef } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import BackgroundImageContainer from '@/components/background-image-container';

import { Provider, AvailabilityTimeSlot } from '@/lib/models';
import colors from '@/jss/colors';
import fonts from '@/jss/fonts';
import mediaQueries from '@/jss/media-queries';

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
	paymentPill: {
		...fonts.xxs,
		color: colors.dark,
		display: 'inline-block',
		border: `2px solid ${colors.border}`,
		borderRadius: 20,
		marginTop: 4,
		padding: '2px 6px',
	},
	acceptsAnons: {
		backgroundColor: colors.primary,
		borderRadius: 20,
	},
	childrenOuter: {
		display: 'inline-block',
		transform: 'translateY(4px)',
	},
});

function joinComma(valueOne: string, valueTwo: string) {
	if (valueOne && valueTwo) {
		return `${valueOne}, ${valueTwo}`;
	} else if (valueOne) {
		return valueOne;
	} else if (valueTwo) {
		return valueTwo;
	}

	return '';
}

interface AvailableProviderProps {
	ref?: React.ForwardedRef<HTMLDivElement>;
	provider: Provider;
	onTimeSlotClick: (timeSlot: AvailabilityTimeSlot) => void;
	className?: string;
	selectedTimeSlot?: AvailabilityTimeSlot;
}

const AvailableProvider: FC<AvailableProviderProps> = forwardRef<HTMLDivElement, AvailableProviderProps>(
	({ className, provider, onTimeSlotClick, selectedTimeSlot, children }, ref) => {
		const classes = useAvailableProviderStyles();
		const placeholderImage = useRandomPlaceholderImage();

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
				<div className="d-flex align-items-center">
					<BackgroundImageContainer size={116} imageUrl={provider.imageUrl || placeholderImage} />
					<div className="pl-3">
						<h5 className="mb-0">{joinComma(provider.name, provider.license)}</h5>

						{/* {provider.schedulingSystemId !== 'EPIC' && (
							<p className={classNames('d-inline-block text-white px-2', classes.acceptsAnons)}>
								<small>Accepts Anonymous Patients</small>
							</p>
						)} */}

						{provider.supportRolesDescription && (
							<p className="mb-0">
								<i>{provider.supportRolesDescription}</i>
							</p>
						)}

						{provider.treatmentDescription ? (
							<p className="mb-0">
								<strong>{provider.treatmentDescription}</strong>
							</p>
						) : (
							provider.specialty && <p className="mb-0">{provider.specialty}</p>
						)}

						{(provider.entity || provider.clinic) && <p className="mb-0">{joinComma(provider.entity, provider.clinic)}</p>}

						<div>
							{provider.paymentFundingDescriptions &&
								provider.paymentFundingDescriptions.map((paymentOption, index) => {
									return (
										<div className={classes.paymentPill} key={index}>
											{paymentOption}
										</div>
									);
								})}
						</div>

						<div className={classes.childrenOuter}>{children}</div>
					</div>
				</div>

				{Array.isArray(provider.times) && (
					<div className={classes.horizontalScroller}>
						{provider.fullyBooked ? (
							<p>all appointments are booked for this date</p>
						) : (
							provider.times.map((availability) => (
								<Button
									size="sm"
									variant={selectedTimeSlot === availability ? 'primary' : 'light'}
									className={classNames(`${classes.availabilityButton}`, 'mr-1', 'mb-1')}
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
