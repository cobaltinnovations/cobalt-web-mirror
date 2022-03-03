import moment from 'moment';
import React, { FC, useCallback, useState } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import { Formik } from 'formik';

import { LogicalAvailability, SchedulingAppointmentType } from '@/lib/models';
import { schedulingService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import AsyncPage from '@/components/async-page';
import TimeInput from '@/components/time-input';
import DatePicker from '@/components/date-picker';
import { AppointmentTypeItem } from './appointment-type-item';
import fonts from '@/jss/fonts';
import { cloneDeep } from 'lodash';

export interface AvailabilityFormSchema {
	appointmentTypes: string[];
	startDate: string;
	startTime: string;
	startTimeMeridian: string;
	endDate: string;
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
	const [appointmentTypes, setAppointmentTypes] = useState<SchedulingAppointmentType[]>([]);

	const fetchData = useCallback(async () => {
		if (!account || !account.providerId) {
			throw new Error('account.providerId is undefined');
		}

		const appointmentTypesResponse = await schedulingService.getAppointmentTypes(account.providerId).fetch();
		setAppointmentTypes(appointmentTypesResponse.appointmentTypes);
	}, [account]);

	const handleFormSubmit = useCallback(
		async (values: AvailabilityFormSchema) => {
			if (!account || !account.providerId) {
				throw new Error('account.providerId is undefined');
			}

			const startDay = moment(values.startDate).startOf('day');
			const startTimeMoment = moment(`${values.startTime} ${values.startTimeMeridian}`, 'hh:mm a');
			const startDateTime = startDay.clone().set({
				hours: startTimeMoment.hours(),
				minutes: startTimeMoment.minutes(),
				seconds: startTimeMoment.seconds(),
			});

			const endDay = values.recurring
				? moment(values.endDate).startOf('day')
				: moment(values.startDate).startOf('day');
			const endTimeMoment = moment(`${values.endTime} ${values.endTimeMeridian}`, 'hh:mm a');

			const appointmentTypeIds = values.typesAccepted === 'all' ? [] : values.appointmentTypes;

			const requestBody = {
				providerId: account.providerId,
				startDateTime: startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
				...(endDay.isValid() && { endDate: endDay.format('YYYY-MM-DD') }),
				endTime: endTimeMoment.format('HH:mm:ss'),
				appointmentTypeIds,
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
		[account, handleError, logicalAvailabilityId, logicalAvailabilityTypeId, onSuccess]
	);

	return (
		<AsyncPage fetchData={fetchData}>
			<Formik<AvailabilityFormSchema>
				initialValues={
					initialValues || {
						appointmentTypes: [],
						startDate: '',
						startTime: '',
						startTimeMeridian: '',
						endDate: '',
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
						!!values.startTime &&
						!!values.startTimeMeridian &&
						!!values.endTime &&
						!!values.endTimeMeridian;

					return (
						<Form onSubmit={handleSubmit}>
							<Form.Group controlId="date">
								<DatePicker
									showYearDropdown
									showMonthDropdown
									dropdownMode="select"
									labelText={'Start Date'}
									selected={values.startDate ? moment(values.startDate).toDate() : undefined}
									onChange={(date) => {
										setFieldValue('startDate', date ? moment(date).format('YYYY-MM-DD') : '');
									}}
								/>
							</Form.Group>

							<Form.Group controlId="startTime">
								<Form.Row>
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
								</Form.Row>
							</Form.Group>

							<Form.Group controlId="endTime">
								<Form.Row>
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
								</Form.Row>
							</Form.Group>

							<Form.Group controlId="recurring">
								<Form.Check
									id="recurring"
									className="ml-auto"
									type="switch"
									label="Recurring"
									onChange={handleChange}
								/>
							</Form.Group>

							{values.recurring && (
								<>
									<Form.Group>
										<Form.Label style={{ ...fonts.xs }}>Occurs on...</Form.Label>
										<div className="d-flex align-items-center flex-wrap">
											{(['S', 'M', 'T', 'W', 'Th', 'F', 'Sa'] as const).map((dayOfWeek, idx) => {
												return (
													<Form.Check
														className="mr-4"
														key={idx}
														id={`occurance.${dayOfWeek}`}
														bsPrefix="cobalt-modal-form__check"
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

									<Form.Group controlId="endDate">
										<DatePicker
											showYearDropdown
											showMonthDropdown
											dropdownMode="select"
											labelText="End Date"
											selected={values.endDate ? moment(values.endDate).toDate() : undefined}
											onChange={(date) => {
												setFieldValue('endDate', date ? moment(date).format('YYYY-MM-DD') : '');
											}}
										/>
									</Form.Group>
								</>
							)}

							<Form.Group controlId="typesAccepted">
								<Form.Label style={{ ...fonts.xs }}>Appointment types accepted:</Form.Label>
								<div>
									<Form.Check
										name="typesAccepted"
										id="all"
										className="d-inline-block mr-4"
										bsPrefix="cobalt-modal-form__check"
										type="radio"
										label="all"
										value="all"
										checked={values.typesAccepted === 'all'}
										onChange={handleChange}
									/>
									<Form.Check
										name="typesAccepted"
										id="limited"
										className="d-inline-block"
										bsPrefix="cobalt-modal-form__check"
										type="radio"
										label="limit to..."
										value="limited"
										checked={values.typesAccepted === 'limited'}
										onChange={handleChange}
									/>
								</div>
							</Form.Group>

							{values.typesAccepted === 'limited' && (
								<Form.Group controlId="appointmentTypes">
									{appointmentTypes.map((appointmentType, idx) => {
										return (
											<Form.Check
												key={idx}
												id={`appointment-type--${appointmentType.appointmentTypeId}`}
												bsPrefix="cobalt-modal-form__check"
												type="checkbox"
												name="appointmentTypes"
												value={appointmentType.appointmentTypeId}
												label={
													<AppointmentTypeItem
														color={appointmentType.hexColor}
														nickname={appointmentType.name}
													/>
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

							<div className="mt-4 d-flex flex-row justify-content-between">
								<Button
									variant="outline-primary"
									size="sm"
									onClick={() => {
										onBack();
									}}
								>
									cancel
								</Button>
								<Button variant="primary" size="sm" type="submit" disabled={!isValid}>
									save
								</Button>
							</div>
						</Form>
					);
				}}
			</Formik>
		</AsyncPage>
	);
};
