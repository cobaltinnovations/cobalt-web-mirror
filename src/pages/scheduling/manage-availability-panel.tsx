import React, { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';

import { LogicalAvailability, SchedulingAppointmentType } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import AsyncPage from '@/components/async-page';
import { AppointmentTypeFormModal } from './appointment-type-form-modal';
import { AppointmentTypeItem } from './appointment-type-item';

import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { Link, useRouteMatch } from 'react-router-dom';
import { useSchedulingStyles } from './use-scheduling-styles';

interface ManageAvailabilityPanelProps {
	onClose: () => void;
}

export const ManageAvailabilityPanel = ({ onClose }: ManageAvailabilityPanelProps) => {
	const routeMatch = useRouteMatch();
	const classes = useSchedulingStyles();
	const { account } = useAccount();

	const [appointmentTypes, setAppointmentTypes] = useState<SchedulingAppointmentType[]>([]);
	const [regularHours, setRegularHours] = useState<LogicalAvailability[]>([]);
	const [unavailableTimeBlocks, setUnavailableTimeBlocks] = useState<LogicalAvailability[]>([]);

	const [appointmentTypeIdToEdit, setAppointmentTypeIdToEdit] = useState<string>();
	const [appointmentTypeModalOpen, setAppointmentTypeModalOpen] = useState(false);

	const fetchData = useCallback(async () => {
		if (!account || !account.providerId) {
			throw new Error('account.providerId is undefined');
		}

		const [appointmentTypesResponse, regularHoursResponse, unavailableTimeResponse] = await Promise.all([
			schedulingService.getAppointmentTypes(account.providerId).fetch(),
			schedulingService.getRegularHours(account.providerId).fetch(),
			schedulingService.getUnavailableTime(account.providerId).fetch(),
		]);

		setAppointmentTypes(appointmentTypesResponse.appointmentTypes);
		setRegularHours(regularHoursResponse.logicalAvailabilities);
		setUnavailableTimeBlocks(unavailableTimeResponse.logicalAvailabilities);
	}, [account]);

	return (
		<>
			<AppointmentTypeFormModal
				appointmentTypeId={appointmentTypeIdToEdit}
				show={appointmentTypeModalOpen}
				onHide={() => {
					setAppointmentTypeIdToEdit(undefined);
					setAppointmentTypeModalOpen(false);
				}}
				onSave={() => {
					fetchData();
					setAppointmentTypeModalOpen(false);
				}}
				onDelete={() => {
					fetchData();
					setAppointmentTypeModalOpen(false);
				}}
			/>

			<div className="py-4">
				<div className="mb-7 d-flex align-items-center justify-content-between">
					<h4>Manage availability</h4>
					<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
						<CloseIcon />
					</Button>
				</div>

				<AsyncPage fetchData={fetchData}>
					<div className="mb-1 d-flex align-items-center justify-content-between">
						<h5>appointment types</h5>
						<Button
							variant="link"
							className={classes.roundBtn}
							onClick={() => setAppointmentTypeModalOpen(true)}
						>
							<PlusIcon />
						</Button>
					</div>

					<div className="mb-5">
						{appointmentTypes.map((appointmentType) => {
							return (
								<AppointmentTypeItem
									key={appointmentType.appointmentTypeId}
									appointmentType={appointmentType}
									onEdit={() => {
										setAppointmentTypeIdToEdit(appointmentType.appointmentTypeId);
										setAppointmentTypeModalOpen(true);
									}}
								/>
							);
						})}
					</div>

					<div className="mb-1 d-flex align-items-center justify-content-between">
						<h5>regular hours</h5>
						<Button
							as={Link}
							variant="link"
							to={`${routeMatch.url}/new-availability`}
							className={classes.roundBtn}
						>
							<PlusIcon />
						</Button>
					</div>

					<div className="mb-5">
						{regularHours.map((logicalAvailability) => {
							return (
								<LogicalAvailabilityItem
									key={logicalAvailability.logicalAvailabilityId}
									logicalAvailability={logicalAvailability}
								/>
							);
						})}
					</div>

					<div className="mb-1 d-flex align-items-center justify-content-between">
						<h5>unavailable time block</h5>
						<Button
							as={Link}
							variant="link"
							to={`${routeMatch.url}/new-blocked-time`}
							className={classes.roundBtn}
						>
							<PlusIcon />
						</Button>
					</div>

					<div>
						{unavailableTimeBlocks.map((logicalAvailability) => {
							return (
								<LogicalAvailabilityItem
									key={logicalAvailability.logicalAvailabilityId}
									logicalAvailability={logicalAvailability}
								/>
							);
						})}
					</div>
				</AsyncPage>
			</div>
		</>
	);
};

interface LogicalAvailabilityItemProps {
	logicalAvailability: LogicalAvailability;
}

const LogicalAvailabilityItem = ({ logicalAvailability }: LogicalAvailabilityItemProps) => {
	const routeMatch = useRouteMatch();

	return (
		<div key={logicalAvailability.logicalAvailabilityId} className="mb-2 border py-2 px-3">
			<div className="d-flex align-items-center justify-content-between">
				<div>
					{logicalAvailability.descriptionComponents?.map((description, index) => {
						return (
							<p key={index} className="m-0 font-secondary-bold">
								{description}
							</p>
						);
					})}
				</div>
				<Button
					as={Link}
					to={`${routeMatch.url}/${logicalAvailability.logicalAvailabilityId}/edit`}
					variant="link"
					size="sm"
					className="p-0"
				>
					<EditIcon height={24} width={24} />
				</Button>
			</div>
			{logicalAvailability.appointmentTypes.map((appointmentType) => {
				return (
					<AppointmentTypeItem key={appointmentType.appointmentTypeId} appointmentType={appointmentType} />
				);
			})}
		</div>
	);
};
