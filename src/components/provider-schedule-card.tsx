import React from 'react';
import classNames from 'classnames';
import moment from 'moment';

import SvgIcon from '@/components/svg-icon';
import { createUseThemedStyles } from '@/jss/theme';
import { Button } from 'react-bootstrap';
import { FirstAvailableAppointmentModel, ProviderAppointmentSelectionTypeId } from '@/lib/models';

interface useStylesProps {
	showCardStyle?: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	providerScheduleCard: {
		borderRadius: ({ showCardStyle }: useStylesProps) => (showCardStyle ? 8 : 0),
		padding: ({ showCardStyle }: useStylesProps) => (showCardStyle ? '32px 24px' : 0),
		boxShadow: ({ showCardStyle }: useStylesProps) => (showCardStyle ? theme.elevation.e200 : 'none'),
		backgroundColor: ({ showCardStyle }: useStylesProps) => (showCardStyle ? theme.colors.n0 : 'transparent'),
	},
	providerNextAppointmentCard: {
		padding: 16,
		borderRadius: 8,
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
	},
	iconOuter: {
		width: 36,
		height: 36,
		display: 'flex',
		borderRadius: 500,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.p100,
	},
	callClinicButton: {
		'&:hover': {
			color: theme.colors.n0,
		},
	},
}));

interface ProviderScheduleCardProps {
	scheduleAppointmentDescription: string;
	scheduleTypeId: ProviderAppointmentSelectionTypeId;
	onViewAppointmentsButtonClick(): void;
	firstAvailableAppointment?: FirstAvailableAppointmentModel;
	onScheduleAppointmentButtonClick(): void;
	phoneNumber?: string;
	phoneNumberDescription?: string;
	showMoreAppointmentsButton?: boolean;
	showCardStyle?: boolean;
	className?: string;
}

export const formatFirstAvailableAppointmentDate = (date?: string) => {
	if (!date) {
		return '';
	}

	const parsedDate = moment(date, 'YYYY-MM-DD', true);
	return parsedDate.isValid() ? parsedDate.format('MMMM D, YYYY') : date;
};

const ProviderScheduleCard = ({
	scheduleAppointmentDescription,
	scheduleTypeId,
	onViewAppointmentsButtonClick,
	firstAvailableAppointment,
	onScheduleAppointmentButtonClick,
	phoneNumber,
	phoneNumberDescription,
	showMoreAppointmentsButton,
	showCardStyle = true,
	className,
}: ProviderScheduleCardProps) => {
	const classes = useStyles({ showCardStyle });
	const firstAvailableAppointmentDateDescription = formatFirstAvailableAppointmentDate(
		firstAvailableAppointment?.date
	);
	const schedulingUnavailable =
		scheduleTypeId === ProviderAppointmentSelectionTypeId.APPOINTMENT_BY_PHONE
			? !phoneNumber
			: !firstAvailableAppointment;

	return (
		<div className={classNames(classes.providerScheduleCard, className)}>
			<p className="mb-2 fs-large">
				<strong>Schedule Appointment</strong>
			</p>
			<p className="mb-4">{scheduleAppointmentDescription}</p>
			<div className={classes.providerNextAppointmentCard}>
				{schedulingUnavailable && <p className="mb-0 text-muted">No appointments are currently available.</p>}
				{!schedulingUnavailable &&
					scheduleTypeId === ProviderAppointmentSelectionTypeId.APPOINTMENT_PREDETERMINED && (
						<div className="d-md-flex justify-content-between">
							<div className="mb-4 mb-md-0 me-4 d-flex align-items-center">
								<div className={classNames(classes.iconOuter, 'me-4')}>
									<SvgIcon kit="far" icon="calendar" size={16} className="text-primary" />
								</div>
								<div>
									<p className="mb-0">First Available Appointment:</p>
									<p className="mb-0">
										<strong>
											{firstAvailableAppointmentDateDescription}{' '}
											{firstAvailableAppointment?.timeDescription}
										</strong>
									</p>
								</div>
							</div>
							<Button variant="primary" onClick={onScheduleAppointmentButtonClick}>
								Schedule Appointment
							</Button>
						</div>
					)}
				{!schedulingUnavailable &&
					scheduleTypeId === ProviderAppointmentSelectionTypeId.APPOINTMENT_UNDETERMINED && (
						<Button variant="primary" className="d-block w-100" onClick={onScheduleAppointmentButtonClick}>
							Schedule Appointment
						</Button>
					)}
				{!schedulingUnavailable &&
					scheduleTypeId === ProviderAppointmentSelectionTypeId.APPOINTMENT_BY_PHONE && (
						<div className="d-md-flex justify-content-between">
							<div className="mb-4 mb-md-0 me-4 d-flex align-items-center">
								<div className={classNames(classes.iconOuter, 'me-4')}>
									<SvgIcon kit="far" icon="phone" size={16} className="text-primary" />
								</div>
								<div>
									<p className="mb-0">
										<strong>Call {phoneNumberDescription} to schedule</strong>
									</p>
								</div>
							</div>
							<a
								className={classNames(
									'cobalt-button cobalt-button-primary text-decoration-none',
									classes.callClinicButton
								)}
								href={`tel:${phoneNumber}`}
							>
								Call Clinic
							</a>
						</div>
					)}
			</div>
			{showMoreAppointmentsButton && (
				<Button
					variant="link"
					className="mt-2 d-block w-100 text-decoration-none"
					onClick={onViewAppointmentsButtonClick}
				>
					View more appointments
				</Button>
			)}
		</div>
	);
};

export default ProviderScheduleCard;
