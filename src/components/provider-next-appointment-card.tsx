import React from 'react';
import classNames from 'classnames';

import SvgIcon from '@/components/svg-icon';
import { createUseThemedStyles } from '@/jss/theme';
import { Button } from 'react-bootstrap';
import { ProviderAppointmentSelectionTypeId } from '@/lib/models';

const useStyles = createUseThemedStyles((theme) => ({
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
}));

interface ProviderNextAppointmentCardProps {
	scheduleTypeId: ProviderAppointmentSelectionTypeId;
	className?: string;
}

const ProviderNextAppointmentCard = ({ scheduleTypeId, className }: ProviderNextAppointmentCardProps) => {
	const classes = useStyles();
	return (
		<div className={classNames(classes.providerNextAppointmentCard, className)}>
			{scheduleTypeId === ProviderAppointmentSelectionTypeId.APPOINTMENT_PREDETERMINED && (
				<div className="d-md-flex justify-content-between">
					<div className="mb-4 mb-md-0 me-4 d-flex align-items-center">
						<div className={classNames(classes.iconOuter, 'me-4')}>
							<SvgIcon kit="far" icon="calendar" size={16} className="text-primary" />
						</div>
						<div>
							<p className="mb-0">First Available Appointment:</p>
							<p className="mb-0">
								<strong>Mon, May 4, 2:00PM</strong>
							</p>
						</div>
					</div>
					<Button variant="primary">Schedule Appointment</Button>
				</div>
			)}
			{scheduleTypeId === ProviderAppointmentSelectionTypeId.APPOINTMENT_UNDETERMINED && (
				<Button variant="primary" className="d-block w-100">
					Schedule Appointment
				</Button>
			)}
			{scheduleTypeId === ProviderAppointmentSelectionTypeId.APPOINTMENT_BY_PHONE && (
				<div className="d-md-flex justify-content-between">
					<div className="mb-4 mb-md-0 me-4 d-flex align-items-center">
						<div className={classNames(classes.iconOuter, 'me-4')}>
							<SvgIcon kit="far" icon="phone" size={16} className="text-primary" />
						</div>
						<div>
							<p className="mb-0">
								<strong>Call (000) 000-0000 to schedule</strong>
							</p>
						</div>
					</div>
					<Button variant="primary">Call Clinic</Button>
				</div>
			)}
		</div>
	);
};

export default ProviderNextAppointmentCard;
