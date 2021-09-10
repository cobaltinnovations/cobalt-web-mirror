import React, { FC, forwardRef, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import moment from 'moment';
import { Formik } from 'formik';
import useAccount from '@/hooks/use-account';
import { Button, Col, Dropdown, Form } from 'react-bootstrap';
import DatePicker from '@/components/date-picker';
import InputHelper from '@/components/input-helper';
import { appointmentService, providerService } from '@/lib/services';
import { ERROR_CODES } from '@/lib/http-client';
import useHandleError from '@/hooks/use-handle-error';
import { useGetPicPatientById, useGetPicPatients } from '@/hooks/pic-hooks';
import { PatientObject } from './utils';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import colors from '@/jss/colors';
import fonts from '@/jss/fonts';

import { ReactComponent as UnfoldIcon } from '@/assets/icons/icon-unfold.svg';
import Select from '@/components/select';
import { AppointmentReason, AppointmentReasonType, AvailabilityTimeSlot } from '@/lib/models';
import Loader from '@/components/loader';

const useStyles = createUseStyles({
	typeahead: {
		'& .rbt input': {
			height: 56,
		},
		'& .rbt .rbt-menu': {
			border: `1px solid ${colors.border}`,
			padding: 8,
			...fonts.xs,
		},
		'& .dropdown-item': {
			textDecoration: 'none',
		},
	},
});

export const ColoredAppointmentReason: FC<{ reason: AppointmentReason }> = ({ reason }) => {
	return (
		<div className="d-flex align-items-center">
			<div style={{ backgroundColor: reason.color, height: 12, width: 12, borderRadius: '100%' }} />
			<p className="ml-2 mb-0 text-nowrap overflow-hidden">{reason.description}</p>
		</div>
	);
};

const AvailableAppointmentTimeSlots: FC<{
	selectedDate: string;
	selectedTime: string;
	onAppointmentTimeSelect: (appointmentType: string, time: string) => void;
}> = ({ selectedDate, selectedTime, onAppointmentTimeSelect }) => {
	const handleError = useHandleError();
	const { account } = useAccount();

	const [dayMoment, setDayMoment] = useState<moment.Moment>();
	const [timeSlots, setTimeSlots] = useState<AvailabilityTimeSlot[]>([]);
	const [appointmentType, setAppointmentType] = useState('');

	useEffect(() => {
		const parsed = moment(selectedDate);
		if (parsed.isValid()) {
			setDayMoment(parsed);
			return;
		}
	}, [selectedDate]);

	useEffect(() => {
		if (!account || !account.providerId || !dayMoment) {
			return;
		}

		const date = dayMoment.format('YYYY-MM-DD');
		const request = providerService.findProviders({
			providerId: account.providerId,
			visitTypeIds: ['INITIAL'],
			startDate: date,
			endDate: date,
		});

		request
			.fetch()
			.then((response) => {
				setAppointmentType(response.appointmentTypes[0]?.appointmentTypeId ?? '');
				setTimeSlots(response.sections[0]?.providers[0]?.times ?? []);
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			request.abort();
		};
	}, [account, dayMoment, handleError]);

	return (
		<Select
			name="time"
			onChange={(e) => {
				onAppointmentTimeSelect(appointmentType, e.target.value);
			}}
			value={selectedTime}
		>
			<option value="">{timeSlots.length === 0 ? 'No available timeslots' : 'Select Timeslot'}</option>
			{timeSlots.map((tS) => {
				if (tS.status === 'BOOKED') {
					return null;
				}

				return (
					<option key={tS.time} value={tS.time}>
						{tS.timeDescription}
					</option>
				);
			})}
		</Select>
	);
};

const AppointmentReasonsToggle = forwardRef<HTMLButtonElement, { selectedReason: AppointmentReason }>(({ selectedReason, ...props }, ref) => {
	return (
		<button
			type="button"
			ref={ref}
			{...props}
			className="border d-flex align-items-center px-3"
			style={{ backgroundColor: 'transparent', width: '100%', height: 56 }}
		>
			<div className="d-flex flex-column w-100">
				<p className="mb-0 text-left" style={{ marginTop: -4 }}>
					Reason for Appointment
				</p>

				{selectedReason && <ColoredAppointmentReason reason={selectedReason} />}
			</div>

			<UnfoldIcon className="ml-auto" />
		</button>
	);
});

const AppointmentReasons: FC<{ reasonType: AppointmentReasonType; onReasonSelect: (reason: AppointmentReason) => void }> = ({ reasonType, onReasonSelect }) => {
	const handleError = useHandleError();
	const { account } = useAccount();

	const [reasons, setReasons] = useState<AppointmentReason[]>([]);
	const [selectedReason, setSelectedReason] = useState<AppointmentReason>();

	useEffect(() => {
		if (!account || !account.providerId || reasonType === AppointmentReasonType.NotSpecfied) {
			return;
		}

		const request = providerService.listAppointmentReasons({
			providerId: account.providerId,
			appointmentReasonTypeId: reasonType,
		});

		setSelectedReason(undefined);

		request
			.fetch()
			.then((response) => {
				setReasons(response.appointmentReasons);
			})
			.catch((e) => {
				if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
					handleError(e);
				}
			});

		return () => {
			request.abort();
		};
	}, [account, handleError, reasonType]);

	return (
		<Dropdown drop="down">
			<Dropdown.Toggle
				as={AppointmentReasonsToggle}
				id="reasons"
				//@ts-expect-error forwarded Toggle Props
				selectedReason={selectedReason}
			/>
			<Dropdown.Menu className="w-100">
				{reasons.map((reason, index) => {
					return (
						<Dropdown.Item
							key={index}
							onClick={() => {
								setSelectedReason(reason);
								onReasonSelect(reason);
							}}
							className="text-decoration-none"
						>
							<ColoredAppointmentReason reason={reason} />
						</Dropdown.Item>
					);
				})}
			</Dropdown.Menu>
		</Dropdown>
	);
};

const ScheduleOnCalendar: FC<{ picPatientId: string; initialDate?: string; onSuccess: (date: string) => void; onCancel: () => void }> = ({
	picPatientId,
	initialDate,
	onSuccess,
	onCancel,
}) => {
	const handleError = useHandleError();
	const classes = useStyles();
	const { account } = useAccount();

	const [isSearching, setIsSearching] = useState(false);
	const [patientSearchQuery, setPatientSearchQuery] = useState('');
	const [patients, setPatients] = useState<PatientObject[]>([]);
	const [selectedPatients, setSelectedPatients] = useState<PatientObject[]>([]);

	const picPatientCallBack = (data: PatientObject) => {
		setSelectedPatients([data]);
	};
	useGetPicPatientById(picPatientId, picPatientCallBack);

	useGetPicPatients(patientSearchQuery, (data) => {
		setIsSearching(false);
		setPatients(data.patients);
	});

	if (!initialDate) {
		return <Loader />;
	}

	return (
		<div className="my-6 mx-6 py-6">
			<div className="bg-white border">
				<div className="border-bottom">
					<h4 className="ml-4 my-4">schedule on my calendar</h4>
				</div>

				<Formik
					initialValues={{
						date: initialDate,
						appointmentTypeId: '',
						time: '',
						eventType: AppointmentReasonType.Initial,
						appointmentReasonId: '',
						comment: '',
					}}
					onSubmit={(values) => {
						if (!account || !account.providerId) {
							return;
						}

						const patientId = selectedPatients[0]?.cobaltAccountId;
						if(patientId === null){
							alert("Cannot schedule appointment for patient without a cobalt account")
							return;
						}

						if (values.eventType === AppointmentReasonType.Initial) {
							appointmentService
								.createAppointment({
									accountId: patientId,
									providerId: account.providerId,
									appointmentTypeId: values.appointmentTypeId,
									appointmentReasonId: values.appointmentReasonId,
									date: values.date,
									time: values.time,
									comment: values.comment,
								})
								.fetch()
								.then(() => {
									onSuccess(values.date);
								})
								.catch((e) => {
									if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
										handleError(e);
									}
								});
						} else if (values.eventType === AppointmentReasonType.FollowUp) {
							appointmentService
								.createFollowup({
									accountId: patientId,
									providerId: account.providerId,
									followupDate: values.date,
									appointmentReasonId: values.appointmentReasonId,
								})
								.fetch()
								.then(() => {
									onSuccess(values.date);
								})
								.catch((e) => {
									if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
										handleError(e);
									}
								});
						}
					}}
				>
					{(formikBag) => {
						const { values, setFieldValue, handleChange, handleSubmit } = formikBag;

						const isValid = selectedPatients[0] &&( values.eventType === AppointmentReasonType.Initial ? !!values.appointmentTypeId &&
						!!values.time && !!values.appointmentReasonId : values.eventType === AppointmentReasonType.FollowUp ? !!values.appointmentReasonId : true);

						return (
							<Form onSubmit={handleSubmit}>
								<Form.Row className="my-6">
									<Col xs={12} md={6}>
										<Form.Row>
											<Col xs={12}>
												<Form.Group controlId="accountId" className="mx-2 mb-0">
													<div className={classNames('border', classes.typeahead)}>
														<AsyncTypeahead
															placeholder="Patient Name"
															isLoading={isSearching}
															onSearch={(q) => {
																setIsSearching(true);
																setPatientSearchQuery(q);
															}}
															labelKey={(patient) => {
																return `${patient.preferredFirstName} ${patient.preferredLastName}`;
															}}
															id="patient-accountId-search"
															options={patients}
															selected={selectedPatients}
															onChange={(selected) => {
																// TODO Cobalt Account ID from patient object
																setSelectedPatients(selected);
															}}
														/>
													</div>
												</Form.Group>
											</Col>

											<Col xs={12}>
												<Form.Group controlId="date" className="mt-5 mx-2 mb-0">
													<DatePicker
														showYearDropdown
														showMonthDropdown
														dropdownMode="select"
														selected={values.date ? moment(values.date).toDate() : undefined}
														onChange={(date) => {
															setFieldValue('date', date ? moment(date).format('YYYY-MM-DD') : '');
															setFieldValue('appointmentTypeId', '');
															setFieldValue('time', '');
														}}
													/>
												</Form.Group>
											</Col>

											{values.eventType === AppointmentReasonType.Initial && (
												<Col xs={12}>
													<Form.Group className="mx-2 mt-3">
														<AvailableAppointmentTimeSlots
															selectedDate={values.date}
															selectedTime={values.time}
															onAppointmentTimeSelect={(appointmentType, time) => {
																setFieldValue('appointmentTypeId', appointmentType);
																setFieldValue('time', time);
															}}
														/>
													</Form.Group>
												</Col>
											)}
										</Form.Row>
									</Col>

									<Col xs={12} md={6}>
										<Form.Row>
											<Col xs={12}>
												<div className="d-flex align-items-center mx-2" style={{ height: 58 }}>
													Event Type:
													<Form.Check
														type="radio"
														bsPrefix="cobalt-modal-form__check"
														name="eventType"
														id="eventType-initial"
														label="Appointment"
														className="ml-2"
														value={AppointmentReasonType.Initial}
														checked={values.eventType === AppointmentReasonType.Initial}
														onChange={(e) => {
															setFieldValue('appointmentReasonId', '');
															handleChange(e);
														}}
													/>
													<Form.Check
														type="radio"
														bsPrefix="cobalt-modal-form__check"
														name="eventType"
														id="eventType-followup"
														label="Follow-up"
														className="ml-2"
														value={AppointmentReasonType.FollowUp}
														checked={values.eventType === AppointmentReasonType.FollowUp}
														onChange={(e) => {
															setFieldValue('appointmentReasonId', '');
															setFieldValue('appointmentTypeId', '');
															setFieldValue('time', '');
															handleChange(e);
														}}
													/>
												</div>
											</Col>

											<Col xs={12}>
												<Form.Group className="mt-5 mx-2 mb-0">
													<AppointmentReasons
														reasonType={values.eventType}
														onReasonSelect={(reason) => {
															setFieldValue('appointmentReasonId', reason.appointmentReasonId);
														}}
													/>
												</Form.Group>
											</Col>

											<Col xs={12}>
												<Form.Group controlId="comment" className="mt-3 mx-2 mb-0">
													<InputHelper as="textarea" name="comment" label="Comments" value={values.comment} onChange={handleChange} />
												</Form.Group>
											</Col>
										</Form.Row>
									</Col>
								</Form.Row>

								<Form.Row className="border-top mt-6">
									<Col>
										<div className="d-flex my-4 mx-4">
											<Button className="ml-auto" size="sm" type="button" variant="outline-primary" onClick={onCancel}>
												cancel
											</Button>
											<Button className="ml-2" size="sm" type="submit" disabled={!isValid}>
												save
											</Button>
										</div>
									</Col>
								</Form.Row>
							</Form>
						);
					}}
				</Formik>
			</div>
		</div>
	);
};

export default ScheduleOnCalendar;
