import React, { useCallback, useMemo, useState } from 'react';
import { useRevalidator } from 'react-router-dom';
import { Button, Col, Container, Dropdown, Row } from 'react-bootstrap';
import classNames from 'classnames';

import {
	MessageStatusId,
	MessageTypeId,
	PatientOrderDispositionId,
	PatientOrderModel,
	PatientOrderOutreachModel,
	PatientOrderOutreachResultStatusId,
	PatientOrderOutreachTypeId,
	PatientOrderScheduledMessageGroup,
} from '@/lib/models';
import { integratedCareService } from '@/lib/services';
import { useIntegratedCareLoaderData } from '@/routes/ic/landing';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import NoData from '@/components/no-data';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import {
	MhicMessageModal,
	MhicOutreachItem,
	MhicOutreachModal,
	MhicScheduledMessageGroup,
	PastScheduledMessageGroupsOrOutreachType,
} from '@/components/integrated-care/mhic';

import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as EnvelopeIcon } from '@/assets/icons/envelope.svg';

import { ReactComponent as FlagSuccess } from '@/assets/icons/flag-success.svg';
import { ReactComponent as FlagDanger } from '@/assets/icons/flag-danger.svg';
import { ReactComponent as NaIcon } from '@/assets/icons/sentiment-na.svg';
import { ReactComponent as SearchCloseIcon } from '@/assets/icons/icon-search-close.svg';

interface Props {
	patientOrder: PatientOrderModel;
}

interface PastScheduledMessageGroupsOrOutreach {
	id: string;
	type: PastScheduledMessageGroupsOrOutreachType;
	name: string;
	date: string;
	dateDescription: string;
	icon: JSX.Element;
	title: string;
	descriptionHtml: string;
	original: any;
	// actual TS Types are "PatientOrderScheduledMessageGroup | PatientOrderOutreachModel"
	// currently using "any" to avoid type mismatch in template logic for now
	// revisit later and make util functions for type checking
}

export const MhicContactHistory = ({ patientOrder }: Props) => {
	const { referenceDataResponse } = useIntegratedCareLoaderData();
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const revalidator = useRevalidator();
	const { institution } = useAccount();

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

	const futureScheduledMessageGroups = useMemo(
		() =>
			patientOrder.patientOrderScheduledMessageGroups.filter((message) => !message.scheduledAtDateTimeHasPassed),
		[patientOrder.patientOrderScheduledMessageGroups]
	);

	const pastScheduledMessageGroupsAndOutreaches: PastScheduledMessageGroupsOrOutreach[] = useMemo(() => {
		const formattedScheduledMessageGroups = patientOrder.patientOrderScheduledMessageGroups
			.filter((message) => message.scheduledAtDateTimeHasPassed)
			.map((msg) => {
				const showSuccess = msg.patientOrderScheduledMessages.every(
					(msg) => msg.messageStatusId === MessageStatusId.DELIVERED
				);
				const showError = msg.patientOrderScheduledMessages.some(
					(msg) =>
						msg.messageStatusId === MessageStatusId.ERROR ||
						msg.messageStatusId === MessageStatusId.DELIVERY_FAILED
				);

				return {
					id: msg.patientOrderScheduledMessageGroupId,
					type: PastScheduledMessageGroupsOrOutreachType.SCHEDULED_MESSAGE,
					name: '',
					date: msg.scheduledAtDateTime,
					dateDescription: msg.scheduledAtDateTimeDescription,
					icon: showSuccess ? (
						<FlagSuccess className="text-success" />
					) : showError ? (
						<FlagDanger className="text-danger" />
					) : (
						<NaIcon />
					),
					title: `Sent ${msg.patientOrderScheduledMessageTypeDescription} Message`,
					descriptionHtml: msg.patientOrderScheduledMessages
						.map((m) => {
							const messageStatusClassMap = {
								[MessageStatusId.ENQUEUED]: 'text-n300',
								[MessageStatusId.SENT]: 'text-n300',
								[MessageStatusId.DELIVERED]: 'text-success',
								[MessageStatusId.DELIVERY_FAILED]: 'text-danger',
								[MessageStatusId.ERROR]: 'text-danger',
							};

							const messageStatusDescriptionMap = {
								[MessageStatusId.ENQUEUED]: '',
								[MessageStatusId.SENT]: '',
								[MessageStatusId.DELIVERED]: '',
								[MessageStatusId.DELIVERY_FAILED]: 'Failed',
								[MessageStatusId.ERROR]: 'Failed',
							};

							if (m.messageTypeId === MessageTypeId.SMS) {
								return `<p class="mb-0">${m.messageTypeDescription} sent to ${
									m.smsToNumberDescription
								} <span class="fw-bold ${messageStatusClassMap[m.messageStatusId]}">${
									messageStatusDescriptionMap[m.messageStatusId]
								}</span></p>`;
							}

							if (m.messageTypeId === MessageTypeId.EMAIL) {
								return `<p class="mb-0">${m.messageTypeDescription} sent to ${m.emailToAddresses.join(
									', '
								)} <span class="fw-bold ${messageStatusClassMap[m.messageStatusId]}">${
									messageStatusDescriptionMap[m.messageStatusId]
								}</span></p>`;
							}

							return '';
						})
						.join(''),
					original: msg,
				};
			});

		const formattedOutreaches = (patientOrder.patientOrderOutreaches ?? []).map((outreach) => {
			const outreachResult = referenceDataResponse.patientOrderOutreachResults.find(
				(result) => result.patientOrderOutreachResultId === outreach.patientOrderOutreachResultId
			);

			return {
				id: outreach.patientOrderOutreachId,
				type: PastScheduledMessageGroupsOrOutreachType.OUTREACH,
				name: outreach.account.displayName ?? '',
				date: outreach.outreachDateTime,
				dateDescription: outreach.outreachDateTimeDescription,
				icon:
					outreachResult?.patientOrderOutreachResultStatusId ===
					PatientOrderOutreachResultStatusId.CONNECTED ? (
						<FlagSuccess className="text-success" />
					) : PatientOrderOutreachResultStatusId.NOT_CONNECTED ? (
						<div style={{ padding: 2 }}>
							<SearchCloseIcon className="text-n300" />
						</div>
					) : (
						<NaIcon />
					),
				title: outreachResult?.patientOrderOutreachResultTypeDescription ?? '',
				descriptionHtml: outreach.note,
				original: outreach,
			};
		});

		return [...formattedScheduledMessageGroups, ...formattedOutreaches].sort((a, b) => {
			return new Date(b.date).getTime() - new Date(a.date).getTime();
		});
	}, [
		patientOrder.patientOrderOutreaches,
		patientOrder.patientOrderScheduledMessageGroups,
		referenceDataResponse.patientOrderOutreachResults,
	]);

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
												<span>{institution.myChartName}</span>
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

							{futureScheduledMessageGroups.map((message) => {
								return (
									<MhicScheduledMessageGroup
										key={message.patientOrderScheduledMessageGroupId}
										message={message}
										onEditClick={() => {
											setMessageToEdit(message);
											setShowMessageModal(true);
										}}
										disabled={
											patientOrder.patientOrderDispositionId === PatientOrderDispositionId.CLOSED
										}
									/>
								);
							})}

							{pastScheduledMessageGroupsAndOutreaches.length > 0 && (
								<div className="border rounded bg-white">
									{pastScheduledMessageGroupsAndOutreaches.map((outreach, outreachIndex) => {
										const isLast =
											pastScheduledMessageGroupsAndOutreaches.length - 1 === outreachIndex;

										return (
											<MhicOutreachItem
												key={outreach.id}
												className={classNames({ 'border-bottom': !isLast })}
												id={outreach.id}
												type={outreach.type}
												name={outreach.name}
												date={outreach.dateDescription}
												onEditClick={() => {
													setOutreachTypeId(
														referenceDataResponse.patientOrderOutreachResults.find(
															(result) =>
																result.patientOrderOutreachResultId ===
																outreach.original.patientOrderOutreachResultId
														)?.patientOrderOutreachTypeId as PatientOrderOutreachTypeId
													);
													setOutreachToEdit(outreach.original);
													setShowOutreachModal(true);
												}}
												onDeleteClick={() => {
													handleDeleteOutreach(outreach.id);
												}}
												icon={outreach.icon}
												title={outreach.title}
												description={outreach.descriptionHtml}
											/>
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
