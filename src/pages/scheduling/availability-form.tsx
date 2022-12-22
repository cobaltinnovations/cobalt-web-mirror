import React, { FC, useCallback, useState } from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import { Formik } from 'formik';

import { LogicalAvailability, SchedulingAppointmentType } from '@/lib/models';
import { PostLogicalAvailabilitiesRequest, schedulingService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import AsyncPage from '@/components/async-page';
import TimeInput from '@/components/time-input';
import DatePicker from '@/components/date-picker';
import { AppointmentTypeItem } from './appointment-type-item';
import { cloneDeep } from 'lodash';
import { useCobaltTheme } from '@/jss/theme';
import { formatISO, parse, startOfDay, setHours, setMinutes } from 'date-fns';

export interface AvailabilityFormSchema {
	appointmentTypes: string[];
	startDate?: Date;
	startTime: string;
	startTimeMeridian: string;
	endDate?: Date;
	endTime: string;
	endTimeMeridian: string;
	typesAccepted: 'all' | 'limited';
	recurring: boolean;
	occurance: {
		S: boolean;
		M: boolean;
		T: boolean;
		W: boolean;
		Th: boolean;
		F: boolean;
		Sa: boolean;
	};
}

interface AvailabilityFormProps {
	logicalAvailabilityId?: string;
	logicalAvailabilityTypeId: 'OPEN' | 'BLOCK';
	initialValues?: AvailabilityFormSchema;
	onBack: () => void;
	onSuccess: (logicalAvailability: LogicalAvailability) => void;
}

export const AvailabilityForm: FC<AvailabilityFormProps> = ({
	logicalAvailabilityId,
	logicalAvailabilityTypeId,
	initialValues,
	onBack,
	onSuccess,
}) => {
	const { account } = useAccount();
	const handleError = useHandleError();
	const { fonts } = useCobaltTheme();
	const [appointmentTypes, setAppointmentTypes] = useState<SchedulingAppointmentType[]>([]);

	const hideAppointmentTypes = logicalAvailabilityTypeId === 'BLOCK';

	const fetchData = useCallback(async () => {
		if (!account || !account.providerId) {
			throw new Error('account.providerId is undefined');
		}

		if (hideAppointmentTypes) {
			setAppointmentTypes([]);
			return;
		}

		const appointmentTypesResponse = await schedulingService.getAppointmentTypes(account.providerId).fetch();
		setAppointmentTypes(appointmentTypesResponse.appointmentTypes);
	}, [account, hideAppointmentTypes]);

	const handleFormSubmit = useCallback(
		async (values: AvailabilityFormSchema) => {
			if (!account || !account.providerId) {
				throw new Error('account.providerId is undefined');
			}

			const startTime = parse(`${values.startTime} ${values.startTimeMeridian}`, 'hh:mm aaa', new Date());
			const startDateTime =
				values.startDate &&
				setMinutes(setHours(values.startDate, startTime.getHours()), startTime.getMinutes());

			const endDay = values.recurring
				? values.endDate && startOfDay(values.endDate)
				: values.startDate && startOfDay(values.startDate);
			const endTime = parse(`${values.endTime}:00 ${values.endTimeMeridian}`, 'hh:mm:00 aaa', new Date());

			const requestBody = {
				providerId: account.providerId,
				...(startDateTime && {
					startDateTime: `${formatISO(startDateTime, { representation: 'date' })}T${
						formatISO(startDateTime, { representation: 'time' }).split('-')[0]
					}`,
				}),
				...(endDay && { endDate: formatISO(endDay, { representation: 'date' }) }),
				endTime: formatISO(endTime, { representation: 'time' }).split('-')[0],
				logicalAvailabilityTypeId,
				recurrenceTypeId: values.recurring ? ('DAILY' as const) : ('NONE' as const),
				recurSunday: values.occurance.S,
				recurMonday: values.occurance.M,
				recurTuesday: values.occurance.T,
				recurWednesday: values.occurance.W,
				recurThursday: values.occurance.Th,
				recurFriday: values.occurance.F,
				recurSaturday: values.occurance.Sa,
			};

			if (!hideAppointmentTypes) {
				(requestBody as PostLogicalAvailabilitiesRequest).appointmentTypeIds =
					values.typesAccepted === 'all' ? [] : values.appointmentTypes;
			}

			try {
				let response;
				if (logicalAvailabilityId) {
					response = await schedulingService
						.updateLogicalAvailability(logicalAvailabilityId, requestBody)
						.fetch();
				} else {
					response = await schedulingService.postLogicalAvailability(requestBody).fetch();
				}

				onSuccess(response.logicalAvailability);
			} catch (error) {
				handleError(error);
			}
		},
		[account, handleError, hideAppointmentTypes, logicalAvailabilityId, logicalAvailabilityTypeId, onSuccess]
	);

	return (
		<AsyncPage fetchData={fetchData}>
			<Formik<AvailabilityFormSchema>
				initialValues={
					initialValues || {
						appointmentTypes: [],
						startTime: '',
						startTimeMeridian: '',
						endTime: '',
						endTimeMeridian: '',
						typesAccepted: 'all',
						recurring: false,
						occurance: {
							S: false,
							M: false,
							T: false,
							W: false,
							Th: false,
							F: false,
							Sa: false,
						},
					}
				}
				enableReinitialize
				onSubmit={handleFormSubmit}
			>
				{(formikBag) => {
					const { values, setFieldValue, handleChange, handleSubmit } = formikBag;
					const isValid =
						!!values.startDate &&
						!!values.startTime &&
						!!values.startTimeMeridian &&
						!!values.endTime &&
						!!values.endTimeMeridian;

					return (
						<Form onSubmit={handleSubmit}>
							<Form.Group controlId="date" className="mb-5">
								<DatePicker
									showYearDropdown
									showMonthDropdown
									dropdownMode="select"
									labelText={'Start Date'}
									selected={values.startDate}
									onChange={(date) => {
										setFieldValue('startDate', date || undefined);
									}}
								/>
							</Form.Group>

							<Form.Group controlId="startTime" className="mb-5">
								<Row>
									<Col>
										<TimeInput
											name="startTime"
											label="Start Time"
											time={values.startTime}
											onTimeChange={handleChange}
											meridian={values.startTimeMeridian}
											onMeridianChange={(newStartMeridian) => {
												setFieldValue('startTimeMeridian', newStartMeridian);
											}}
										/>
									</Col>
								</Row>
							</Form.Group>

							<Form.Group controlId="endTime" className="mb-5">
								<Row>
									<Col>
										<TimeInput
											name="endTime"
											label="End Time"
											time={values.endTime}
											onTimeChange={handleChange}
											meridian={values.endTimeMeridian}
											onMeridianChange={(newEndMeridian) => {
												setFieldValue('endTimeMeridian', newEndMeridian);
											}}
										/>
									</Col>
								</Row>
							</Form.Group>

							<Form.Group controlId="recurring" className="mb-5">
								<Form.Check
									id="recurring"
									checked={values.recurring}
									className="ms-auto"
									label="Recurring"
									onChange={handleChange}
								/>
							</Form.Group>

							{values.recurring && (
								<>
									<Form.Group className="mb-5">
										<Form.Label style={{ ...fonts.default }}>Occurs on...</Form.Label>
										<div className="d-flex align-items-center flex-wrap">
											{(['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'] as const).map((dayOfWeek, idx) => {
												return (
													<Form.Check
														className="me-4"
														key={idx}
														id={`occurance.${dayOfWeek}`}
														type="checkbox"
														label={dayOfWeek}
														checked={values.occurance[dayOfWeek]}
														onChange={() => {
															setFieldValue(
																`occurance.${dayOfWeek}`,
																!values.occurance[dayOfWeek]
															);
														}}
													/>
												);
											})}
										</div>
									</Form.Group>

									<Form.Group controlId="endDate" className="mb-5">
										<DatePicker
											isClearable
											showYearDropdown
											showMonthDropdown
											dropdownMode="select"
											labelText="End Date"
											selected={values.endDate}
											onChange={(date) => {
												setFieldValue('endDate', date || undefined);
											}}
										/>
									</Form.Group>
								</>
							)}

							{hideAppointmentTypes ? null : (
								<>
									<Form.Group controlId="typesAccepted" className="mb-5">
										<Form.Label style={{ ...fonts.default }}>
											Appointment types accepted:
										</Form.Label>
										<div className="d-flex">
											<Form.Check
												name="typesAccepted"
												id="all"
												className="me-4"
												type="radio"
												label="all"
												value="all"
												checked={values.typesAccepted === 'all'}
												onChange={handleChange}
											/>
											<Form.Check
												name="typesAccepted"
												id="limited"
												type="radio"
												label="limit to..."
												value="limited"
												checked={values.typesAccepted === 'limited'}
												onChange={handleChange}
											/>
										</div>
									</Form.Group>

									{values.typesAccepted === 'limited' && (
										<Form.Group controlId="appointmentTypes" className="mb-5">
											{appointmentTypes.map((appointmentType, idx) => {
												return (
													<Form.Check
														key={idx}
														id={`appointment-type--${appointmentType.appointmentTypeId}`}
														type="checkbox"
														name="appointmentTypes"
														value={appointmentType.appointmentTypeId}
														label={
															<AppointmentTypeItem appointmentType={appointmentType} />
														}
														checked={values.appointmentTypes.includes(
															appointmentType.appointmentTypeId
														)}
														onChange={({ currentTarget }) => {
															const appointmentTypesClone = cloneDeep(
																values.appointmentTypes || []
															);

															if (currentTarget.checked) {
																appointmentTypesClone.push(currentTarget.value);
															} else {
																const indexToRemove = appointmentTypesClone.findIndex(
																	(at) => at === currentTarget.value
																);
																appointmentTypesClone.splice(indexToRemove, 1);
															}

															setFieldValue('appointmentTypes', appointmentTypesClone);
														}}
													/>
												);
											})}
										</Form.Group>
									)}
								</>
							)}

							<div className="mt-4 d-flex flex-row justify-content-between">
								<Button
									variant="outline-primary"
									size="sm"
									onClick={() => {
										onBack();
									}}
								>
									Cancel
								</Button>
								<Button variant="primary" size="sm" type="submit" disabled={!isValid}>
									Save
								</Button>
							</div>
						</Form>
					);
				}}
			</Formik>
		</AsyncPage>
	);
};
