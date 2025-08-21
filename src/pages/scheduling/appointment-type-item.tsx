import React from 'react';
import { createUseStyles } from 'react-jss';
import { Button } from 'react-bootstrap';

import { AppointmentType } from '@/lib/models';
import SvgIcon from '@/components/svg-icon';

const useSchedulingStyles = createUseStyles({
	appointmentTypeColorCircle: {
		width: 12,
		height: 12,
		borderRadius: 100,
	},
});

interface AppointmentTypeItemProps {
	appointmentType: AppointmentType;
	onEdit?: () => void;
	invertedColor?: boolean;
}

export const AppointmentTypeItem = ({ appointmentType, onEdit, invertedColor }: AppointmentTypeItemProps) => {
	const schedulingClasses = useSchedulingStyles();

	const colorStyle = invertedColor
		? {
				backgroundColor: 'transparent',
				border: `1px solid ${appointmentType.hexColor}`,
		  }
		: {
				backgroundColor: appointmentType.hexColor,
		  };

	return (
		<div data-testid="appointmentTypeItem" className="d-flex align-items-center justify-content-between py-1">
			<div className="d-flex align-items-center">
				<div className={schedulingClasses.appointmentTypeColorCircle} style={colorStyle} />

				<p className="ms-1 mb-0">{appointmentType.name}</p>
			</div>

			{onEdit && (
				<Button
					data-testid="editAppointmentTypeButton"
					variant="link"
					size="sm"
					className="p-0"
					onClick={() => onEdit()}
				>
					<SvgIcon kit="far" icon="pen" size={16} />
				</Button>
			)}
		</div>
	);
};
