import { ReactComponent as UnfoldIcon } from '@/assets/icons/icon-unfold.svg';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { SchedulingAppointmentType } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import React, { forwardRef, useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { AppointmentTypeItem } from './appointment-type-item';

interface AppointmentTypeDropdownProps {
	initialId?: string;
	onChange?: (apptType?: SchedulingAppointmentType) => void;
}

export const AppointmentTypeDropdown = ({ initialId, onChange }: AppointmentTypeDropdownProps) => {
	const { account } = useAccount();
	const handleError = useHandleError();
	const [appointmentTypes, setAppointmentTypes] = useState<SchedulingAppointmentType[]>([]);
	const [selectedType, setSelectedType] = useState<SchedulingAppointmentType>();

	useEffect(() => {
		if (!account || !account.providerId) {
			throw new Error('missing accountId!');
		}

		const request = schedulingService.getAppointmentTypes(account.providerId);

		request
			.fetch()
			.then((response) => {
				setAppointmentTypes(response.appointmentTypes);
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			request.abort();
		};
	}, [account, handleError]);

	useEffect(() => {
		setSelectedType(appointmentTypes.find((aT) => aT.appointmentTypeId === initialId));
	}, [appointmentTypes, initialId]);

	return (
		<Dropdown drop="down">
			<Dropdown.Toggle as={AppointmentTypeDropdownToggle} id="reasons" selectedAppointmentType={selectedType} />
			<Dropdown.Menu className="w-100">
				{appointmentTypes.map((apptType, index) => {
					return (
						<Dropdown.Item
							key={index}
							onClick={() => {
								setSelectedType(apptType);
								onChange && onChange(apptType);
							}}
							className="text-decoration-none"
						>
							<AppointmentTypeItem appointmentType={apptType} />
						</Dropdown.Item>
					);
				})}
			</Dropdown.Menu>
		</Dropdown>
	);
};

export interface AppointmentTypeDropdownToggleProps {
	selectedAppointmentType?: SchedulingAppointmentType;
}

export const AppointmentTypeDropdownToggle = forwardRef<HTMLButtonElement, AppointmentTypeDropdownToggleProps>(
	({ selectedAppointmentType, ...props }, ref) => {
		return (
			<button
				type="button"
				ref={ref}
				{...props}
				className="border d-flex align-items-center px-3"
				style={{
					backgroundColor: 'transparent',
					width: '100%',
					height: 56,
				}}
			>
				<div className="d-flex flex-column w-100">
					<p
						className="mb-0 text-left"
						style={{
							marginTop: -4,
						}}
					>
						Appointment type
					</p>

					{selectedAppointmentType && <AppointmentTypeItem appointmentType={selectedAppointmentType} />}
				</div>

				<UnfoldIcon className="ml-auto" />
			</button>
		);
	}
);
