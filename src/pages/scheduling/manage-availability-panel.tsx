import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Button } from 'react-bootstrap';

import { AppointmentTypeFormModal } from './appointment-type-form-modal';
import { AppointmentTypeItem } from './appointment-type-item';

import colors from '@/jss/colors';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';

const MOCK_APPT_TYPES = [
	{
		appointmentTypeId: 'apptType1',
		nickname: '1 hour virtual session',
		color: '#19C59F',
	},
	{
		appointmentTypeId: 'apptType2',
		nickname: '30 minute follow-up',
		color: '#EE8C4E',
	},
	{
		appointmentTypeId: 'apptType3',
		nickname: 'Collaborative care consultation',
		color: '#F2B500',
	},
	{
		appointmentTypeId: 'apptType4',
		nickname: 'All appointment types',
		color: '#979797',
		invertedColor: true,
	},
];

const MOCK_AVAILABILITIES = [
	{
		availabilityId: 'availability1',
		title: 'Weekdays, 9am - 12pm',
		appointmentTypes: [MOCK_APPT_TYPES[3]],
	},
	{
		availabilityId: 'availability2',
		title: 'Monday, Wednesday, Friday, 1pm - 4pm',
		appointmentTypes: [MOCK_APPT_TYPES[3]],
	},
	{
		availabilityId: 'availability3',
		title: 'Tuesday, 1pm - 3pm',
		appointmentTypes: [MOCK_APPT_TYPES[0], MOCK_APPT_TYPES[1]],
	},
	{
		availabilityId: 'availability4',
		title: 'Friday, 1pm - 2:30pm',
		appointmentTypes: [MOCK_APPT_TYPES[1]],
	},
];

const useSchedulingStyles = createUseStyles({
	roundBtn: {
		width: 36,
		height: 36,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 100,
		border: `2px solid ${colors.primary}`,
		backgroundColor: 'transparent',
		'& path': {
			fill: colors.primary,
		},
	},
});

interface ManageAvailabilityPanelProps {
	onClose: () => void;
	onEditAvailability: () => void;
	onEditTimeBlock: () => void;
}

export const ManageAvailabilityPanel = ({
	onEditAvailability,
	onEditTimeBlock,
	onClose,
}: ManageAvailabilityPanelProps) => {
	const schedulingClasses = useSchedulingStyles();
	const [appointmentTypeModalOpen, setAppointmentTypeModalOpen] = useState(false);

	return (
		<>
			<AppointmentTypeFormModal
				show={appointmentTypeModalOpen}
				onHide={() => {
					setAppointmentTypeModalOpen(false);
				}}
				onSave={(newAppointmentType) => {
					console.log(newAppointmentType);
				}}
			/>

			<div>
				<div className="d-flex align-items-center justify-content-between py-4">
					<h3>Manage availability</h3>

					<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
						<CloseIcon />
					</Button>
				</div>

				<div className="d-flex align-items-center justify-content-between mb-2">
					<h5>appointment types</h5>

					<button className={schedulingClasses.roundBtn} onClick={() => setAppointmentTypeModalOpen(true)}>
						<PlusIcon />
					</button>
				</div>

				{MOCK_APPT_TYPES.map((apptType) => {
					return (
						<AppointmentTypeItem
							key={apptType.appointmentTypeId}
							color={apptType.color}
							nickname={apptType.nickname}
							onEdit={() => {
								setAppointmentTypeModalOpen(true);
							}}
						/>
					);
				})}

				<div className="d-flex align-items-center justify-content-between mt-4">
					<h5>regular hours</h5>

					<button className={schedulingClasses.roundBtn} onClick={() => onEditAvailability()}>
						<PlusIcon />
					</button>
				</div>

				<div className="d-flex flex-column mt-2">
					{MOCK_AVAILABILITIES.map((availability) => {
						return (
							<div key={availability.availabilityId} className="mb-2 border py-2 px-3">
								<div className="d-flex align-items-center justify-content-between">
									<p className="m-0 font-karla-bold">{availability.title}</p>
									<Button
										variant="link"
										size="sm"
										className="p-0"
										onClick={() => {
											onEditAvailability();
										}}
									>
										<EditIcon height={24} width={24} />
									</Button>
								</div>

								{availability.appointmentTypes.map((apptType) => {
									return (
										<AppointmentTypeItem
											key={apptType.appointmentTypeId}
											color={apptType.color}
											nickname={apptType.nickname}
										/>
									);
								})}
							</div>
						);
					})}
				</div>

				<div className="d-flex align-items-center justify-content-between mt-4">
					<h5>unavailable time block</h5>

					<button className={schedulingClasses.roundBtn} onClick={() => onEditTimeBlock()}>
						<PlusIcon />
					</button>
				</div>

				<div className="d-flex flex-column mt-2">
					<div className="mb-2 border py-2 px-3">
						<div className="d-flex align-items-center justify-content-between">
							<p className="m-0 font-karla-bold">Friday 8/14, 1pm - 4pm</p>

							<Button
								variant="link"
								size="sm"
								className="p-0"
								onClick={() => {
									onEditTimeBlock();
								}}
							>
								<EditIcon height={24} width={24} />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};
