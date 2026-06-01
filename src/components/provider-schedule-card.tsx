import React from 'react';
import classNames from 'classnames';

import ProviderNextAppointmentCard, { SCHEDULE_TYPE_ID } from '@/components/provider-next-appointment-card';
import { createUseThemedStyles } from '@/jss/theme';
import { Button } from 'react-bootstrap';

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
}));

interface ProviderScheduleCardProps {
	scheduleAppointmentDescription: string;
	scheduleTypeId: SCHEDULE_TYPE_ID;
	onViewAppointmentsButtonClick(): void;
	showCardStyle?: boolean;
	className?: string;
}

const ProviderScheduleCard = ({
	scheduleAppointmentDescription,
	scheduleTypeId,
	onViewAppointmentsButtonClick,
	showCardStyle = true,
	className,
}: ProviderScheduleCardProps) => {
	const classes = useStyles({ showCardStyle });
	return (
		<div className={classNames(classes.providerScheduleCard, className)}>
			<p className="mb-2 fs-large">
				<strong>Schedule Appointment</strong>
			</p>
			<p className="mb-4">{scheduleAppointmentDescription}</p>
			<ProviderNextAppointmentCard className="mb-2" scheduleTypeId={scheduleTypeId} />
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
