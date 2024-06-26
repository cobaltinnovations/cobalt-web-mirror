import React, { forwardRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import BackgroundImageContainer from '@/components/background-image-container';

import { AppointmentModel } from '@/lib/models/appointments';

import { BetaFeatureId, BetaStatusId, GroupSessionLocationTypeId, GroupSessionModel } from '@/lib/models';
import { BetaFeatureModal, BetaFeatureAlertModal } from './beta-features-modals';
import { accountService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';

const useCalendarAppointmentStyles = createUseThemedStyles((theme) => ({
	calendarAppointment: {
		backgroundColor: theme.colors.n0,
		boxShadow: theme.elevation.e200,
	},
	informationContainer: {
		padding: 8,
		display: 'flex',
		alignItems: 'center',
		borderBottom: `1px solid ${theme.colors.border}`,
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
		...theme.fonts.small,
		color: theme.colors.n900,
		display: 'inline-block',
		border: `2px solid ${theme.colors.border}`,
		borderRadius: 20,
		marginTop: 4,
		padding: '2px 6px',
	},
}));

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
				const switchboardFeature = res.betaFeatureAlerts.find(
					(bf) => bf.betaFeatureId === BetaFeatureId.SWITCHBOARD
				);
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
			<BetaFeatureModal
				contactEmail={contactEmail}
				show={showBetaModal}
				onHide={presentBetaAlertsModalIfNeeded}
			/>
			<BetaFeatureAlertModal
				betaFeatureId={BetaFeatureId.SWITCHBOARD}
				show={showAlertsModal}
				onHide={() => setShowAlertsModal(false)}
			/>

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
				Join Now
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

const CalendarAppointment = forwardRef<HTMLDivElement, CalendarAppointmentProps>(
	({ className, appointment, groupSession, onCancel }, ref) => {
		const { institution } = useAccount();
		const classes = useCalendarAppointmentStyles();
		const placeholderImage = useRandomPlaceholderImage();

		if (appointment) {
			return (
				<div ref={ref} className={classNames(classes.calendarAppointment, className)}>
					<div className={classes.informationContainer}>
						<BackgroundImageContainer
							size={82}
							imageUrl={appointment.provider?.imageUrl ?? placeholderImage}
						/>

						<div className={classes.informationCopyContainer}>
							<div
								className="wysiwyg-display"
								dangerouslySetInnerHTML={{ __html: appointment.appointmentDescription }}
							/>

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
						{institution.epicFhirEnabled ? (
							<p className="mb-0">
								To cancel go to{' '}
								<Button
									href={institution.myChartDefaultUrl}
									target="_blank"
									variant="link"
									className="p-0"
								>
									{institution.myChartName}
								</Button>
							</p>
						) : (
							<>
								<Button variant="link" className="p-0" onClick={onCancel}>
									Cancel Reservation
								</Button>

								<JoinButton
									contactEmail={appointment.provider?.emailAddress}
									joinUrl={appointment.videoconferenceUrl}
								/>
							</>
						)}
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
							<div
								className="wysiwyg-display"
								dangerouslySetInnerHTML={{ __html: groupSession.description }}
							/>
							<h6 className="mb-0">{groupSession.title}</h6>
							<p className="mb-0">with {groupSession.facilitatorName}</p>
							<p className="mb-0">{groupSession.startDateTimeDescription}</p>
						</div>
					</div>
					<div className={classes.optionsContainer}>
						<Button variant="link" className="p-0" onClick={onCancel}>
							Cancel Reservation
						</Button>
						{groupSession.groupSessionLocationTypeId !== GroupSessionLocationTypeId.IN_PERSON && (
							<Button
								as="a"
								href={groupSession.videoconferenceUrl}
								target="_blank"
								variant="outline-primary"
								size="sm"
							>
								Join Now
							</Button>
						)}
					</div>
				</div>
			);
		}

		return null;
	}
);

export default CalendarAppointment;
