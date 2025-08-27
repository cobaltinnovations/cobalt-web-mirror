import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { SchedulingAppointmentType } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import React, { forwardRef, useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { AppointmentTypeItem } from './appointment-type-item';
import SvgIcon from '@/components/svg-icon';

interface AppointmentTypeDropdownProps {
	testId?: string;
	initialId?: string;
	onChange?: (apptType?: SchedulingAppointmentType) => void;
}

export const AppointmentTypeDropdown = ({ testId = '', initialId, onChange }: AppointmentTypeDropdownProps) => {
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
				handleError(e);
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
			<Dropdown.Toggle
				data-testid={`${testId}AppointmentTypeDropdownToggle`}
				as={AppointmentTypeDropdownToggle}
				id="reasons"
				selectedAppointmentType={selectedType}
			/>
			<Dropdown.Menu className="w-100">
				{appointmentTypes.map((apptType, index) => {
					return (
						<Dropdown.Item
							data-testid={`${testId}AppointmentTypeDropdownOption`}
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
						className="mb-0 text-start"
						style={{
							marginTop: -4,
						}}
					>
						Appointment Type
					</p>

					{selectedAppointmentType && <AppointmentTypeItem appointmentType={selectedAppointmentType} />}
				</div>

				<SvgIcon kit="fas" icon="angles-up-down" size={16} className="ms-auto" />
			</button>
		);
	}
);
