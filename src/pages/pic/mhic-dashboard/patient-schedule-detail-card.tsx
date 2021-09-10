import React, { FC, useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Dropdown, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import { ReactComponent as XCircleIcon } from '@/assets/icons/icon-x-circle.svg';
import { CalendarViews } from '@/pages/pic/provider-calendar';
import { PicScheduleLCSWModal } from '@/pages/pic/schedule-lcsw-modal';
import { appointmentService } from '@/lib/services';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import useQuery from '@/hooks/use-query';
import PicRecordSpecialtySchedulingModal from '../record-specialty-scheduling-modal';
import { Disposition } from '../utils';
import { useQueryClient } from 'react-query';
import { deleteSpecialtyScheduling } from '@/hooks/pic-hooks';

interface ScheduleDetail {
	id: string;
	dateString: string;
	formattedDateTime: string;
	type: string;
	reason: string;
	with: string;
	onCancel: () => Promise<void>;
}

const PatientScheduleDetailCard: FC<{
	disposition: Disposition;
	picPatientId: string;
	patientCobaltAccountId: string;
	patientDisplayName: string;
	onScheduleChange?: () => void;
}> = ({ disposition, picPatientId, patientCobaltAccountId, patientDisplayName, onScheduleChange }) => {
	const queryClient = useQueryClient();
	const { t } = useTranslation();
	const history = useHistory();
	const query = useQuery();
	const queryDate = query.get('date');
	const [showScheduleLCSWModal, setShowScheduleLCSWModal] = useState(false);
	const [showRecordSpecialtySchedulingModal, setShowRecordSpecialtySchedulingModal] = useState(false);
	const [upcomingList, setUpcomingList] = useState<ScheduleDetail[]>([]);

	const fetchUpcoming = useCallback(() => {
		const apptsRequest = appointmentService.getAppointments({ accountId: patientCobaltAccountId, type: 'UPCOMING', responseFormat: 'DEFAULT' });
		const followupsRequest = appointmentService.getFollowups({ accountId: patientCobaltAccountId, filterBy: 'UPCOMING' });

		Promise.all([apptsRequest.fetch(), followupsRequest.fetch()]).then(([apptsRes, followupsRes]) => {
			const appts: ScheduleDetail[] = apptsRes.appointments.map((a) => {
				const formattedDateTime = `${moment(a.startTime).format('MM/DD/YYYY - h:mma')} - ${moment(a.endTime).format('h:mma')}`;

				return {
					id: a.appointmentId,
					dateString: a.startTime,
					formattedDateTime,
					type: 'Appointment',
					reason: a.appointmentReason?.description ?? '',
					with: a.provider?.name ?? '',
					onCancel: appointmentService.cancelAppointment(a.appointmentId).fetch,
				};
			});

			const followups: ScheduleDetail[] = followupsRes.followups.map((f) => {
				const formattedDateTime = moment(f.followupDate).format('MM/DD/YYYY');

				return {
					id: f.followupId,
					dateString: f.followupDate,
					formattedDateTime,
					type: 'Follow-up',
					reason: f.appointmentReason?.description ?? '',
					with: f.provider?.name ?? '',
					onCancel: appointmentService.cancelFollowup(f.followupId).fetch,
				};
			});

			setUpcomingList(
				[...appts, ...followups].sort(function (a, b) {
					return a.dateString < b.dateString ? -1 : a.dateString > b.dateString ? 1 : 0;
				})
			);
		});
	}, [patientCobaltAccountId]);

	useEffect(() => {
		fetchUpcoming();
	}, [fetchUpcoming]);

	return (
		<>
			<PicScheduleLCSWModal
				show={showScheduleLCSWModal}
				patientAccountId={patientCobaltAccountId}
				patientName={patientDisplayName}
				onHide={() => setShowScheduleLCSWModal(false)}
				onSuccess={() => {
					setShowScheduleLCSWModal(false);
					fetchUpcoming();
				}}
			/>

			<PicRecordSpecialtySchedulingModal
				show={showRecordSpecialtySchedulingModal}
				disposition={disposition}
				patientAccountId={patientCobaltAccountId}
				patientName={patientDisplayName}
				onHide={() => setShowRecordSpecialtySchedulingModal(false)}
				onSuccess={() => {
					setShowRecordSpecialtySchedulingModal(false);
					queryClient.invalidateQueries('disposition');
				}}
			/>

			<Container className={`border mb-3`}>
				<Row className="align-items-center d-flex justify-content-between mt-2 pt-1 mb-2">
					<Col md={'auto'}>
						<h5 className="font-karla-bold">{t('mhic.patientDetailModal.demographicsTab.scheduleTile.title')}</h5>
					</Col>
					<Col sm={'auto'}>
						<Dropdown>
							<Dropdown.Toggle className={'mx-auto mb-1 d-flex justify-self-end align-items-center border'} as={Button} variant="light" size="sm">
								{t('mhic.patientDetailModal.demographicsTab.scheduleTile.modalButton')}
							</Dropdown.Toggle>
							<Dropdown.Menu>
								<Dropdown.Item
									className="text-decoration-none py-2 font-size-xs"
									onClick={() => {
										const params = new URLSearchParams({
											view: CalendarViews.CreateAppointment,
											picPatientId,
										});

										if (queryDate) {
											params.set('date', queryDate);
										}

										history.push(`/pic/calendar?${params.toString()}`);
									}}
								>
									{t('mhic.patientDetailModal.demographicsTab.scheduleTile.actions.scheduleOwnCalendar')}
								</Dropdown.Item>

								<Dropdown.Item
									className="text-decoration-none py-2 font-size-xs"
									onClick={() => {
										setShowScheduleLCSWModal(true);
									}}
								>
									{t('mhic.patientDetailModal.demographicsTab.scheduleTile.actions.scheduleWithLCSW')}
								</Dropdown.Item>

								<Dropdown.Item
									className="text-decoration-none py-2 font-size-xs"
									onClick={() => {
										setShowRecordSpecialtySchedulingModal(true);
									}}
								>
									{t('mhic.patientDetailModal.demographicsTab.scheduleTile.actions.recordSpecialtyCareScheduling')}
								</Dropdown.Item>
							</Dropdown.Menu>
						</Dropdown>
					</Col>
				</Row>
				<div className="my-2">
					{disposition.specialtyCareScheduling && (
						<div className="mb-4">
							<Row>
								<Col xs={3}>
									<div>Date/time</div>
								</Col>
								<Col>
									{disposition.specialtyCareScheduling.date} - {disposition.specialtyCareScheduling.time}
									<Button
										className="text-secondary"
										variant="icon"
										onClick={() => {
											if (
												!window.confirm(
													`Cancel Specialty Care Schedule for ${patientDisplayName} with ${disposition.specialtyCareScheduling.agency}?`
												)
											) {
												return;
											}

											deleteSpecialtyScheduling(disposition.id).then(() => {
												queryClient.invalidateQueries('disposition');
											});
										}}
									>
										<XCircleIcon height={20} width={20} />
									</Button>
								</Col>
							</Row>

							<Row>
								<Col xs={3}>Agency</Col>
								<Col>{disposition.specialtyCareScheduling.agency}</Col>
							</Row>
						</div>
					)}
					{upcomingList.map((item) => {
						return (
							<div key={item.type + '-' + item.id} className="mb-4">
								<Row>
									<Col xs={3}>
										<div>Date/time</div>
									</Col>
									<Col>
										{item.formattedDateTime}
										<Button
											className="text-secondary"
											variant="icon"
											onClick={() => {
												if (!window.confirm(`Cancel ${item.type} for ${patientDisplayName} with ${item.with}?`)) {
													return;
												}

												item.onCancel().then(() => {
													typeof onScheduleChange === 'function' && onScheduleChange();

													fetchUpcoming();
												});
											}}
										>
											<XCircleIcon height={20} width={20} />
										</Button>
									</Col>
								</Row>

								<Row>
									<Col xs={3}>Type</Col>
									<Col>{item.type}</Col>
								</Row>

								<Row>
									<Col xs={3}>Reason</Col>
									<Col>{item.reason}</Col>
								</Row>

								<Row>
									<Col xs={3}>With</Col>
									<Col>{item.with}</Col>
								</Row>
							</div>
						);
					})}
				</div>
			</Container>
		</>
	);
};
export default PatientScheduleDetailCard;
