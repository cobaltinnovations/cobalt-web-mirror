import React, { forwardRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import BackgroundImageContainer from '@/components/background-image-container';

import { AppointmentModel } from '@/lib/models/appointments';

import colors from '@/jss/colors';
import fonts from '@/jss/fonts';
import { BetaFeatureId, BetaStatusId, GroupSessionModel } from '@/lib/models';
import { BetaFeatureModal, BetaFeatureAlertModal } from './beta-features-modals';
import { accountService } from '@/lib/services';
import useAccount from '@/hooks/use-account';

const useCalendarAppointmentStyles = createUseStyles({
	calendarAppointment: {
		backgroundColor: colors.white,
	},
	informationContainer: {
		padding: 8,
		display: 'flex',
		alignItems: 'center',
		borderBottom: `1px solid ${colors.border}`,
	},
	informationCopyContainer: {
		paddingLeft: 16,
	},
	optionsContainer: {
		display: 'flex',
		alignItems: 'center',
		padding: '8px 10px 10px 15px',
		justifyContent: 'space-between',
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
});

interface JoinButtonProps {
	contactEmail?: string;
	joinUrl?: string;
}

const JoinButton = ({ joinUrl, contactEmail }: JoinButtonProps) => {
	const { account } = useAccount();

	const [showBetaModal, setShowBetaModal] = useState(false);
	const [showAlertsModal, setShowAlertsModal] = useState(false);

	const presentBetaAlertsModalIfNeeded = () => {
		setShowBetaModal(false);

		if (!account) {
			return;
		}

		accountService
			.getBetaFeatures(account.accountId)
			.fetch()
			.then((res) => {
				const switchboardFeature = res.betaFeatureAlerts.find((bf) => bf.betaFeatureId === BetaFeatureId.SWITCHBOARD);
				if (switchboardFeature && switchboardFeature.betaFeatureAlertStatusId === BetaStatusId.UNKNOWN) {
					setShowAlertsModal(true);
				}
			})
			.catch(() => {
				// do nothing
				// we'll prompt again later
			});
	};
	return (
		<>
			<BetaFeatureModal contactEmail={contactEmail} show={showBetaModal} onHide={presentBetaAlertsModalIfNeeded} />
			<BetaFeatureAlertModal betaFeatureId={BetaFeatureId.SWITCHBOARD} show={showAlertsModal} onHide={() => setShowAlertsModal(false)} />

			<Button
				as="a"
				href={joinUrl}
				target="_blank"
				variant="outline-primary"
				size="sm"
				onClick={(e) => {
					if (!joinUrl) {
						e.preventDefault();
						e.stopPropagation();
						setShowBetaModal(true);
					}
				}}
			>
				join now
			</Button>
		</>
	);
};

interface CalendarAppointmentProps {
	className?: string;
	appointment?: AppointmentModel;
	groupSession?: GroupSessionModel;
	onCancel(): void;
}

const CalendarAppointment = forwardRef<HTMLDivElement, CalendarAppointmentProps>(({ className, appointment, groupSession, onCancel }, ref) => {
	const classes = useCalendarAppointmentStyles();
	const placeholderImage = useRandomPlaceholderImage();

	if (appointment) {
		return (
			<div ref={ref} className={classNames(classes.calendarAppointment, className)}>
				<div className={classes.informationContainer}>
					<BackgroundImageContainer size={82} imageUrl={appointment.provider?.imageUrl ?? placeholderImage} />

					<div className={classes.informationCopyContainer}>
						<small className="text-uppercase text-muted">{appointment.appointmentDescription}</small>

						<h6 className="mb-0">{appointment.name}</h6>

						{appointment.provider && <p className="mb-0">with {appointment.provider.name}</p>}

						<p className="mb-0">{appointment.timeDescription}</p>

						{appointment.provider?.paymentFundingDescriptions &&
							appointment.provider?.paymentFundingDescriptions.map((paymentOption, index) => {
								return (
									<div className={classes.paymentPill} key={index}>
										{paymentOption}
									</div>
								);
							})}
					</div>
				</div>
				<div className={classes.optionsContainer}>
					<Link to="#" onClick={onCancel}>
						cancel reservation
					</Link>
					<JoinButton contactEmail={appointment.provider?.emailAddress} joinUrl={appointment.videoconferenceUrl} />
				</div>
			</div>
		);
	}

	if (groupSession) {
		return (
			<div ref={ref} className={classNames(classes.calendarAppointment, className)}>
				<div className={classes.informationContainer}>
					<BackgroundImageContainer size={82} imageUrl={groupSession.imageUrl ?? placeholderImage} />
					<div className={classes.informationCopyContainer}>
						<small className="text-uppercase text-muted">{groupSession.description}</small>
						<h6 className="mb-0">{groupSession.title}</h6>
						<p className="mb-0">with {groupSession.facilitatorName}</p>
						<p className="mb-0">{groupSession.startDateTimeDescription}</p>
					</div>
				</div>
				<div className={classes.optionsContainer}>
					<Link to="#" onClick={onCancel}>
						cancel reservation
					</Link>
					<Button as="a" href={groupSession.videoconferenceUrl} target="_blank" variant="outline-primary" size="sm">
						join now
					</Button>
				</div>
			</div>
		);
	}

	return null;
});

export default CalendarAppointment;
