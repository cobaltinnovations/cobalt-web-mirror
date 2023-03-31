import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Container, Dropdown, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { PatientOrderModel, PatientOrderOutreachModel } from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import NoData from '@/components/no-data';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import {
	MhicAssessmentModal,
	MhicComment,
	MhicMessageModal,
	MhicOutreachModal,
	MhicScheduleAssessmentModal,
} from '@/components/integrated-care/mhic';

import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as EnvelopeIcon } from '@/assets/icons/envelope.svg';

interface Props {
	patientOrder: PatientOrderModel;
	onPatientOrderChange(patientOrder: PatientOrderModel): void;
}

export const MhicContactHistory = ({ patientOrder, onPatientOrderChange }: Props) => {
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [showMessageModal, setShowMessageModal] = useState(false);
	const [showOutreachModal, setShowOutreachModal] = useState(false);
	const [outreachToEdit, setOutreachToEdit] = useState<PatientOrderOutreachModel>();
	const [showScheduleAssessmentModal, setShowScheduleAssessmentModal] = useState(false);
	const [showAssessmentModal, setShowAssessmentModal] = useState(false);

	const handleOutreachModalSave = useCallback(
		async (_patientOrderOutreach: PatientOrderOutreachModel, isEdit: boolean) => {
			try {
				if (!patientOrder.patientOrderId) {
					throw new Error('patientOrder.patientOrderId is undefined.');
				}

				const patientOverviewResponse = await integratedCareService
					.getPatientOrder(patientOrder.patientOrderId)
					.fetch();

				onPatientOrderChange(patientOverviewResponse.patientOrder);
				addFlag({
					variant: 'success',
					title: isEdit ? 'Outreach updated' : 'Outreach added',
					description: '{Message}',
					actions: [],
				});

				setOutreachToEdit(undefined);
				setShowOutreachModal(false);
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, onPatientOrderChange, patientOrder.patientOrderId]
	);

	const handleDeleteOutreach = useCallback(
		async (patientOrderOutreachId: string) => {
			if (!window.confirm('Are you sure?')) {
				return;
			}

			try {
				if (!patientOrder.patientOrderId) {
					throw new Error('patientOrder.patientOrderId is undefined.');
				}

				await integratedCareService.deletePatientOrderOutreach(patientOrderOutreachId).fetch();
				const patientOverviewResponse = await integratedCareService
					.getPatientOrder(patientOrder.patientOrderId)
					.fetch();

				onPatientOrderChange(patientOverviewResponse.patientOrder);
				addFlag({
					variant: 'success',
					title: 'Outreach deleted',
					description: '{Message}',
					actions: [],
				});
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, handleError, onPatientOrderChange, patientOrder.patientOrderId]
	);

	const handleMessageModalSave = useCallback(async () => {
		try {
			if (!patientOrder.patientOrderId) {
				throw new Error('patientOrder.patientOrderId is undefined.');
			}

			const patientOverviewResponse = await integratedCareService
				.getPatientOrder(patientOrder.patientOrderId)
				.fetch();

			onPatientOrderChange(patientOverviewResponse.patientOrder);
			setShowMessageModal(false);
		} catch (error) {
			handleError(error);
		}
	}, [handleError, onPatientOrderChange, patientOrder.patientOrderId]);

	return (
		<>
			<MhicMessageModal
				patientOrder={patientOrder}
				show={showMessageModal}
				onHide={() => {
					setShowMessageModal(false);
				}}
				onSave={handleMessageModalSave}
			/>

			<MhicOutreachModal
				patientOrderId={patientOrder.patientOrderId}
				outreachToEdit={outreachToEdit}
				show={showOutreachModal}
				onHide={() => {
					setShowOutreachModal(false);
				}}
				onSave={handleOutreachModalSave}
			/>

			<MhicScheduleAssessmentModal
				show={showScheduleAssessmentModal}
				onHide={() => {
					setShowScheduleAssessmentModal(false);
				}}
				onSave={() => {
					setShowScheduleAssessmentModal(false);
				}}
			/>

			<MhicAssessmentModal
				show={showAssessmentModal}
				onHide={() => {
					setShowAssessmentModal(false);
				}}
			/>

			<section>
				<Container fluid className="overflow-visible">
					<Row className="mb-6">
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">
									Contact History{' '}
									<span className="text-gray">
										({(patientOrder.patientOrderOutreaches ?? []).length})
									</span>
								</h4>
								<div className="d-flex align-items-center">
									<Dropdown>
										<Dropdown.Toggle
											variant="primary"
											as={DropdownToggle}
											className="me-2"
											id="mhic-contact-history__dropdown-menu"
										>
											Log Contact Attempt
										</Dropdown.Toggle>
										<Dropdown.Menu
											as={DropdownMenu}
											align="end"
											flip={false}
											popperConfig={{ strategy: 'fixed' }}
											renderOnMount
										>
											<Dropdown.Item
												className="d-flex align-items-center"
												onClick={() => {
													setOutreachToEdit(undefined);
													setShowOutreachModal(true);
												}}
											>
												<PhoneIcon width={20} height={20} className="me-3 text-gray" />
												<span>Call</span>
											</Dropdown.Item>
											<Dropdown.Item
												className="d-flex align-items-center"
												onClick={() => {
													setOutreachToEdit(undefined);
													setShowOutreachModal(true);
												}}
											>
												<EnvelopeIcon width={20} height={20} className="me-3 text-gray" />
												<span>Email</span>
											</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
									<Button
										variant="outline-primary"
										onClick={() => {
											setShowMessageModal(true);
										}}
									>
										Send Message
									</Button>
								</div>
							</div>
						</Col>
					</Row>
					<Row>
						<Col>
							{patientOrder.patientOrderScheduledMessageGroups.map((message) => {
								return (
									<Card className="mb-6" bsPrefix="ic-card">
										<Card.Header>
											<Card.Title>
												Message scheduled for {message.scheduledAtDateTimeDescription}
											</Card.Title>
											<div className="button-container">
												<Button
													variant="light"
													size="sm"
													onClick={() => {
														return;
													}}
												>
													Close Episode
												</Button>
											</div>
										</Card.Header>
										<Card.Body>
											<Container fluid>
												<Row className="mb-4">
													<Col xs={3}>
														<p className="m-0 text-gray">Message Type</p>
													</Col>
													<Col xs={9}>
														<p className="m-0">
															{message.patientOrderScheduledMessageTypeDescription}
														</p>
													</Col>
												</Row>
												<Row>
													<Col xs={3}>
														<p className="m-0 text-gray">Contact Method</p>
													</Col>
													<Col xs={9}>
														<p className="m-0">
															{message.patientOrderScheduledMessages
																.map((m) => m.messageTypeDescription)
																.join(', ')}
														</p>
													</Col>
												</Row>
											</Container>
										</Card.Body>
									</Card>
								);
							})}

							{(patientOrder.patientOrderOutreaches ?? []).length <= 0 && (
								<NoData
									title="No Contact Attempts Logged"
									actions={[
										{
											variant: 'primary',
											title: 'Send Welcome Message',
											onClick: () => {
												setShowMessageModal(true);
											},
										},
									]}
								/>
							)}
							{(patientOrder.patientOrderOutreaches ?? []).map((outreach, outreachIndex) => {
								const isLast = outreachIndex === (patientOrder.patientOrderOutreaches ?? []).length - 1;
								return (
									<MhicComment
										key={outreach.patientOrderOutreachId}
										className={classNames({ 'mb-4': !isLast })}
										name={outreach.account.displayName ?? ''}
										date={outreach.outreachDateTimeDescription}
										message={outreach.note}
										onEdit={() => {
											setOutreachToEdit(outreach);
											setShowOutreachModal(true);
										}}
										onDelete={() => {
											handleDeleteOutreach(outreach.patientOrderOutreachId);
										}}
									/>
								);
							})}
						</Col>
					</Row>
				</Container>
			</section>
		</>
	);
};
