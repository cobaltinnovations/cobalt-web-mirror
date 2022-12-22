import DatePicker from '@/components/date-picker';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { Formik } from 'formik';
import React from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import TimeInput from '@/components/time-input';
import { appointmentService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import { AppointmentTypeDropdown } from './appointment-type-dropdown';
import { format, formatISO, parse, parseISO, startOfDay } from 'date-fns';

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

				const dateTime = startOfDay(parseISO(values.date));

				const startDateTime = parse(
					`${values.startTime}:00 ${values.startTimeMeridian}`,
					'hh:mm:ss aaa',
					dateTime
				);

				const request = appointmentService.rescheduleAppointment(appointmentId, {
					providerId: account.providerId,
					date: formatISO(startDateTime, { representation: 'date' }),
					time: format(startDateTime, 'HH:mm'),
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
						<Form.Group controlId="date" className="mb-5">
							<DatePicker
								showYearDropdown
								showMonthDropdown
								dropdownMode="select"
								labelText={'Date'}
								selected={values.date ? parseISO(values.date) : undefined}
								onChange={(date) => {
									setFieldValue('date', date ? formatISO(date, { representation: 'date' }) : '');
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
	);
};
