import React from 'react';
import classNames from 'classnames';

import ProviderNextAppointmentCard, { SCHEDULE_TYPE_ID } from '@/components/provider-next-appointment-card';
import { createUseThemedStyles } from '@/jss/theme';
import { Button } from 'react-bootstrap';

const useStyles = createUseThemedStyles((theme) => ({
	providerScheduleCard: {
		borderRadius: 8,
		padding: '32px 24px',
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
	},
}));

interface ProviderScheduleCardProps {
	scheduleAppointmentDescription: string;
	scheduleTypeId: SCHEDULE_TYPE_ID;
	onViewAppointmentsButtonClick(): void;
	className?: string;
}

const ProviderScheduleCard = ({
	scheduleAppointmentDescription,
	scheduleTypeId,
	onViewAppointmentsButtonClick,
	className,
}: ProviderScheduleCardProps) => {
	const classes = useStyles();
	return (
		<div className={classNames(classes.providerScheduleCard, className)}>
			<p className="mb-2 fs-large">
				<strong>Schedule Appointment</strong>
			</p>
			<p className="mb-4">{scheduleAppointmentDescription}</p>
			<ProviderNextAppointmentCard scheduleTypeId={scheduleTypeId} />
			<Button
				variant="link"
				className="d-block w-100 text-decoration-none"
				onClick={onViewAppointmentsButtonClick}
			>
				View more appointments
			</Button>
		</div>
	);
};

export default ProviderScheduleCard;
