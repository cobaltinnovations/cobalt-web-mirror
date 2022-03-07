import React from 'react';
import { createUseStyles } from 'react-jss';
import { Button } from 'react-bootstrap';

import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';

const useSchedulingStyles = createUseStyles({
	appointmentTypeColorCircle: {
		width: 12,
		height: 12,
		borderRadius: 100,
	},
});

interface AppointmentTypeItemProps {
	color: string;
	nickname: string;
	onEdit?: () => void;
	invertedColor?: boolean;
}

export const AppointmentTypeItem = ({ color, nickname, onEdit, invertedColor }: AppointmentTypeItemProps) => {
	const schedulingClasses = useSchedulingStyles();

	const colorStyle = invertedColor
		? {
				backgroundColor: 'transparent',
				border: `1px solid ${color}`,
		  }
		: {
				backgroundColor: color,
		  };

	return (
		<div className="d-flex align-items-center justify-content-between py-1">
			<div className="d-flex align-items-center">
				<div className={schedulingClasses.appointmentTypeColorCircle} style={colorStyle} />

				<p className="ml-1 mb-0">{nickname}</p>
			</div>

			{onEdit && (
				<Button variant="link" size="sm" className="p-0" onClick={() => onEdit()}>
					<EditIcon />
				</Button>
			)}
		</div>
	);
};
