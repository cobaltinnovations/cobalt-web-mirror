import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Container, Dropdown, Row } from 'react-bootstrap';
import classNames from 'classnames';

import {
	PatientOrderDispositionId,
	PatientOrderModel,
	PatientOrderOutreachModel,
	PatientOrderOutreachTypeId,
	PatientOrderScheduledMessageGroup,
} from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import NoData from '@/components/no-data';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { MhicMessageModal, MhicOutreachModal } from '@/components/integrated-care/mhic';

import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as EnvelopeIcon } from '@/assets/icons/envelope.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { useIntegratedCareLoaderData } from '@/routes/ic/landing';
import { useRevalidator } from 'react-router-dom';

interface Props {
	patientOrder: PatientOrderModel;
}

export const MhicContactHistory = ({ patientOrder }: Props) => {
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const revalidator = useRevalidator();

	const [showMessageModal, setShowMessageModal] = useState(false);
	const [messageToEdit, setMessageToEdit] = useState<PatientOrderScheduledMessageGroup>();

	const [showOutreachModal, setShowOutreachModal] = useState(false);
	const [outreachTypeId, setOutreachTypeId] = useState(PatientOrderOutreachTypeId.PHONE_CALL);
	const [outreachToEdit, setOutreachToEdit] = useState<PatientOrderOutreachModel>();

	const handleOutreachModalSave = useCallback(async () => {
		revalidator.revalidate();

		setOutreachToEdit(undefined);
		setShowOutreachModal(false);
	}, [revalidator]);

	const handleDeleteOutreach = useCallback(
		async (patientOrderOutreachId: string) => {
			if (!window.confirm('Are you sure you want to delete the contact attempt?')) {
				return;
			}

			try {
				if (!patientOrder.patientOrderId) {
					throw new Error('patientOrder.patientOrderId is undefined.');
				}

				await integratedCareService.deletePatientOrderOutreach(patientOrderOutreachId).fetch();

				revalidator.revalidate();

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
		[addFlag, handleError, patientOrder.patientOrderId, revalidator]
	);

	const handleMessageModalSave = useCallback(async () => {
		revalidator.revalidate();

		setMessageToEdit(undefined);
		setShowMessageModal(false);
	}, [revalidator]);

	return (
		<>
			<MhicMessageModal
				patientOrder={patientOrder}
				messageToEdit={messageToEdit}
				show={showMessageModal}
				onHide={() => {
					setShowMessageModal(false);
				}}
				onSave={handleMessageModalSave}
			/>

			<MhicOutreachModal
				patientOrderId={patientOrder.patientOrderId}
				patientOrderOutreachTypeId={outreachTypeId}
				patientOrderOutreachResults={referenceDataResponse.patientOrderOutreachResults}
				outreachToEdit={outreachToEdit}
				show={showOutreachModal}
				onHide={() => {
					setShowOutreachModal(false);
				}}
				onSave={handleOutreachModalSave}
			/>

			<section>
				<Container fluid className="overflow-visible">
					<Row className="mb-6">
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<h4 className="mb-0">
									Contact History{' '}
									<span className="text-gray">({patientOrder.totalOutreachCountDescription})</span>
								</h4>
								<div className="d-flex align-items-center">
									<Dropdown>
										<Dropdown.Toggle
											variant="primary"
											as={DropdownToggle}
											className="me-2"
											id="mhic-contact-history__dropdown-menu"
											disabled={
												patientOrder.patientOrderDispositionId ===
												PatientOrderDispositionId.CLOSED
											}
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
													setOutreachTypeId(PatientOrderOutreachTypeId.PHONE_CALL);
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
													setOutreachTypeId(PatientOrderOutreachTypeId.MYCHART_MESSAGE);
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
											setMessageToEdit(undefined);
											setShowMessageModal(true);
										}}
										disabled={
											patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED
										}
									>
										Send Message
									</Button>
								</div>
							</div>
						</Col>
					</Row>
					<Row>
						<Col>
							{(patientOrder.patientOrderOutreaches ?? []).length <= 0 &&
								patientOrder.patientOrderScheduledMessageGroups.length <= 0 && (
									<NoData
										title="No Contact Attempts Logged"
										actions={[
											{
												variant: 'primary',
												title: 'Send Welcome Message',
												onClick: () => {
													setMessageToEdit(undefined);
													setShowMessageModal(true);
												},
												disabled:
													patientOrder.patientOrderDispositionId ===
													PatientOrderDispositionId.CLOSED,
											},
										]}
									/>
								)}

							{patientOrder.patientOrderScheduledMessageGroups.map((message) => {
								return (
									<Card
										key={message.patientOrderScheduledMessageGroupId}
										className="mb-6"
										bsPrefix="ic-card"
									>
										<Card.Header>
											<Card.Title>
												Message scheduled for {message.scheduledAtDateTimeDescription}
											</Card.Title>
											<div className="button-container">
												<Button
													variant="light"
													className="p-2"
													onClick={() => {
														setMessageToEdit(message);
														setShowMessageModal(true);
													}}
													disabled={
														patientOrder.patientOrderDispositionId ===
														PatientOrderDispositionId.CLOSED
													}
												>
													<EditIcon className="d-flex" />
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

							{(patientOrder.patientOrderOutreaches ?? []).length > 0 && (
								<div className="border rounded bg-white">
									{(patientOrder.patientOrderOutreaches ?? []).map((outreach, outreachIndex) => {
										const isLast =
											(patientOrder.patientOrderOutreaches ?? []).length - 1 === outreachIndex;

										return (
											<div
												key={outreach.patientOrderOutreachId}
												className={classNames('py-3 px-4', {
													'border-bottom': !isLast,
												})}
											>
												<div className="d-flex align-items-center justify-content-between">
													<p className="mb-0 text-gray">
														<span className="fw-semibold">
															{outreach.account.displayName}
														</span>{' '}
														{outreach.outreachDateTimeDescription}
													</p>
													<Dropdown>
														<Dropdown.Toggle
															as={DropdownToggle}
															id={`mhic-outreach-attempt__dropdown-menu--${outreach.patientOrderOutreachId}`}
															className="p-2"
															disabled={
																patientOrder.patientOrderDispositionId ===
																PatientOrderDispositionId.CLOSED
															}
														>
															<MoreIcon className="d-flex" />
														</Dropdown.Toggle>
														<Dropdown.Menu
															as={DropdownMenu}
															align="end"
															popperConfig={{ strategy: 'fixed' }}
															renderOnMount
														>
															<Dropdown.Item
																onClick={() => {
																	setOutreachTypeId(
																		referenceDataResponse.patientOrderOutreachResults.find(
																			(result) =>
																				result.patientOrderOutreachResultId ===
																				outreach.patientOrderOutreachResultId
																		)
																			?.patientOrderOutreachTypeId as PatientOrderOutreachTypeId
																	);
																	setOutreachToEdit(outreach);
																	setShowOutreachModal(true);
																}}
															>
																Edit
															</Dropdown.Item>
															<Dropdown.Item
																onClick={() => {
																	handleDeleteOutreach(
																		outreach.patientOrderOutreachId
																	);
																}}
															>
																<span className="text-danger">Delete</span>
															</Dropdown.Item>
														</Dropdown.Menu>
													</Dropdown>
												</div>
												<p className="mb-1 fw-bold">
													{
														referenceDataResponse.patientOrderOutreachResults.find(
															(result) =>
																result.patientOrderOutreachResultId ===
																outreach.patientOrderOutreachResultId
														)?.patientOrderOutreachResultTypeDescription
													}
												</p>
												<p className="mb-0">{outreach.note}</p>
											</div>
										);
									})}
								</div>
							)}
						</Col>
					</Row>
				</Container>
			</section>
		</>
	);
};
