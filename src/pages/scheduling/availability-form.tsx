import moment from 'moment';
import React, { FC, useEffect, useState } from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import { Formik } from 'formik';

import { ERROR_CODES } from '@/lib/http-client';
import { AppointmentType } from '@/lib/models';
import { providerService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import TimeInput from '@/components/time-input';
import DatePicker from '@/components/date-picker';
import { AppointmentTypeItem } from './appointment-type-item';
import fonts from '@/jss/fonts';

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

export const AvailabilityForm: FC<{
	onBack: () => void;
	onSuccess: () => void;
}> = ({ onBack, onSuccess }) => {
	const { account } = useAccount();
	const handleError = useHandleError();
	console.log({ account });
	const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);

	useEffect(() => {
		if (!account || !account.providerId) {
			return;
		}

		const request = providerService.listProviderAppointmentTypes(account.providerId);

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

	return (
		<Formik
			initialValues={{
				appointmentTypes: [],
				date: '',
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
				endDate: '',
			}}
			enableReinitialize
			onSubmit={(values) => {
				if (!account || !account.providerId) {
					return;
				}

				const dateTime = moment(values.date).startOf('day');

				const startTimeMoment = moment(`${values.startTime} ${values.startTimeMeridian}`, 'hh:mm a');

				const startDateTime = dateTime.clone().set({
					hours: startTimeMoment.hours(),
					minutes: startTimeMoment.minutes(),
					seconds: startTimeMoment.seconds(),
				});

				const endTimeMoment = moment(`${values.endTime} ${values.endTimeMeridian}`, 'hh:mm a');

				const endDateTime = dateTime.clone().set({
					hours: endTimeMoment.hours(),
					minutes: endTimeMoment.minutes(),
					seconds: endTimeMoment.seconds(),
				});

				const request = providerService.createLogicalAvailability({
					providerId: account.providerId,
					startDateTime: startDateTime.format('YYYY-MM-DDTHH:mm:ss'),
					endDateTime: endDateTime.format('YYYY-MM-DDTHH:mm:ss'),
					appointmentTypeIds: values.appointmentTypes,
				});

				request
					.fetch()
					.then(() => {
						onSuccess();
					})
					.catch((e) => {
						if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
							handleError(e);
						}
					});
			}}
		>
			{(formikBag) => {
				const { values, setFieldValue, handleChange, handleSubmit } = formikBag;
				const isValid =
					!!values.appointmentTypes.length &&
					!!values.startTime &&
					!!values.startTimeMeridian &&
					!!values.endTime &&
					!!values.endTimeMeridian;

				console.log({ values });
				return (
					<Form onSubmit={handleSubmit}>
						<Form.Group controlId="date">
							<DatePicker
								showYearDropdown
								showMonthDropdown
								dropdownMode="select"
								labelText={values.recurring ? 'Start Date' : 'Date'}
								selected={values.date ? moment(values.date).toDate() : undefined}
								onChange={(date) => {
									setFieldValue('date', date ? moment(date).format('YYYY-MM-DD') : '');
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
									onChange={handleChange}
								/>
							</div>
						</Form.Group>

						{values.typesAccepted === 'limited' && (
							<Form.Group controlId="appointmentTypes">
								{MOCK_APPT_TYPES.map((apptType, idx) => {
									return (
										<Form.Check
											key={idx}
											id={`apptType-${idx}`}
											bsPrefix="cobalt-modal-form__check"
											type="checkbox"
											name="appointmentTypes"
											value={apptType.appointmentTypeId}
											label={
												<AppointmentTypeItem
													color={apptType.color}
													nickname={apptType.nickname}
												/>
											}
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
	);
};
