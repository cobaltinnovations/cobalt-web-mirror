import DatePicker from '@/components/date-picker';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { Formik } from 'formik';
import moment from 'moment';
import React from 'react';
import { Button, Col, Form } from 'react-bootstrap';
import TimeInput from '@/components/time-input';
import { appointmentService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import { AppointmentTypeDropdown } from './appointment-type-dropdown';

interface AppointmentFormSchema {
	date: string;
	startTime: string;
	startTimeMeridian: string;
	appointmentTypeId: string;
}

interface AppointmentFormProps {
	appointmentId?: string;
	initialValues?: AppointmentFormSchema;
	onBack: () => void;
	onSuccess: (appointmentId: string) => void;
}

export const AppointmentForm = ({ appointmentId, initialValues, onBack, onSuccess }: AppointmentFormProps) => {
	const { account } = useAccount();
	const handleError = useHandleError();

	return (
		<Formik<AppointmentFormSchema>
			initialValues={
				initialValues || {
					date: '',
					startTime: '',
					startTimeMeridian: '',
					appointmentTypeId: '',
				}
			}
			enableReinitialize
			onSubmit={(values) => {
				if (!account || !account.providerId || !appointmentId) {
					return;
				}

				const dateTime = moment(values.date).startOf('day');

				const startTimeMoment = moment(`${values.startTime} ${values.startTimeMeridian}`, 'hh:mm a');

				const startDateTime = dateTime.clone().set({
					hours: startTimeMoment.hours(),
					minutes: startTimeMoment.minutes(),
					seconds: startTimeMoment.seconds(),
				});

				const request = appointmentService.rescheduleAppointment(appointmentId, {
					providerId: account.providerId,
					date: startDateTime.format('YYYY-MM-DD'),
					time: startDateTime.format('HH:mm'),
					appointmentTypeId: values.appointmentTypeId,
				});

				request
					.fetch()
					.then((response) => {
						onSuccess(response?.appointment?.appointmentId);
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
				const isValid = !!values.startTime && !!values.startTimeMeridian;

				return (
					<Form onSubmit={handleSubmit}>
						<Form.Group controlId="date">
							<DatePicker
								showYearDropdown
								showMonthDropdown
								dropdownMode="select"
								labelText={'Date'}
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

						<AppointmentTypeDropdown
							initialId={initialValues?.appointmentTypeId ?? ''}
							onChange={(apptType) => {
								setFieldValue('appointmentTypeId', apptType?.appointmentTypeId);
							}}
						/>

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
