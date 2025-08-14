import React, { useCallback, useState } from 'react';
import classNames from 'classnames';
import { Dropdown } from 'react-bootstrap';

import { ReactComponent as MoreIcon } from '@/assets/icons/more-horiz.svg';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';
import { MhicAssignOrderModal } from './mhic-assign-order-modal';
import useFlags from '@/hooks/use-flags';
import { PatientOrderDispositionId, PatientOrderModel, PatientOrderResourcingStatusId } from '@/lib/models';
import { integratedCareService } from '@/lib/services';

import SvgIcon from '@/components/svg-icon';
import { ReactComponent as CallMsgIcon } from '@/assets/icons/icon-call-msg.svg';
import { ReactComponent as AssessmentIcon } from '@/assets/icons/icon-assessment.svg';
import { ReactComponent as EditCalendarIcon } from '@/assets/icons/icon-edit-calendar.svg';
import { ReactComponent as EventIcon } from '@/assets/icons/icon-event.svg';
import { ReactComponent as AddNotesIcon } from '@/assets/icons/icon-add-notes.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { useNavigate, useRevalidator } from 'react-router-dom';
import { MhicScheduleAssessmentModal } from './mhic-schedule-assessment-modal';
import { MhicVoicemailTaskModal } from './mhic-voicemail-task-modal';
import { MhicCloseEpisodeModal } from './mhic-close-episode-modal';
import useHandleError from '@/hooks/use-handle-error';
import { MhicScheduleCallModal } from './mhic-schedule-call-modal';

const useStyles = createUseThemedStyles(() => ({
	shelfMoreButton: {
		top: 20,
		right: 64,
	},
}));

interface MhicPatientOrderShelfActionsProps {
	patientOrder: PatientOrderModel;
}

const NO_ACTION_DISPOSITIONS = [PatientOrderDispositionId.CLOSED, PatientOrderDispositionId.ARCHIVED];

export const MhicPatientOrderShelfActions = ({ patientOrder }: MhicPatientOrderShelfActionsProps) => {
	const handleError = useHandleError();
	const classes = useStyles();
	const { addFlag } = useFlags();
	const navigate = useNavigate();
	const revalidator = useRevalidator();

	const [showAssignOrderModal, setShowAssignOrderModal] = useState(false);
	const [showScheduleAssessmentModal, setShowScheduleAssessmentModal] = useState(false);
	const [showAddVoicemailTaskModal, setShowAddVoicemailTaskModal] = useState(false);
	const [showScheduleCallModal, setShowScheduleCallModal] = useState(false);
	const [showCloseEpisodeModal, setShowCloseEpisodeModal] = useState(false);

	const handleAssignOrdersSave = useCallback(
		async (_patientOrderCount: number, panelAccountDisplayName: string) => {
			revalidator.revalidate();
			setShowAssignOrderModal(false);
			addFlag({
				variant: 'success',
				title: 'Patient assigned',
				description: `Patient assigned to ${panelAccountDisplayName}`,
				actions: [],
			});
		},
		[addFlag, revalidator]
	);

	if (NO_ACTION_DISPOSITIONS.includes(patientOrder.patientOrderDispositionId)) {
		return null;
	}

	const assessmentInProgress = !!patientOrder.screeningSession && !patientOrder.screeningSession.completed;
	const assessmentCompleted = !!patientOrder.screeningSession && patientOrder.screeningSession.completed;
	const canAddResourceRequest =
		patientOrder.patientOrderResourcingStatusId === PatientOrderResourcingStatusId.NONE_NEEDED;

	return (
		<>
			<MhicAssignOrderModal
				patientOrderIds={[patientOrder.patientOrderId]}
				show={showAssignOrderModal}
				onHide={() => {
					setShowAssignOrderModal(false);
				}}
				onSave={handleAssignOrdersSave}
			/>

			<MhicScheduleAssessmentModal
				patientOrder={patientOrder}
				show={showScheduleAssessmentModal}
				onHide={() => {
					setShowScheduleAssessmentModal(false);
				}}
				onSave={() => {
					revalidator.revalidate();
					setShowScheduleAssessmentModal(false);
				}}
			/>

			<MhicVoicemailTaskModal
				patientOrder={patientOrder}
				show={showAddVoicemailTaskModal}
				onHide={() => {
					setShowAddVoicemailTaskModal(false);
				}}
				onSave={() => {
					revalidator.revalidate();
					setShowAddVoicemailTaskModal(false);
				}}
			/>

			<MhicScheduleCallModal
				patientOrder={patientOrder}
				show={showScheduleCallModal}
				onHide={() => {
					setShowScheduleCallModal(false);
				}}
				onSave={() => {
					revalidator.revalidate();
					setShowScheduleCallModal(false);
				}}
			/>

			<MhicCloseEpisodeModal
				show={showCloseEpisodeModal}
				onHide={() => {
					setShowCloseEpisodeModal(false);
				}}
				onSave={async (patientOrderClosureReasonId) => {
					try {
						await integratedCareService
							.closePatientOrder(patientOrder.patientOrderId, { patientOrderClosureReasonId })
							.fetch();

						revalidator.revalidate();
						setShowCloseEpisodeModal(false);
						addFlag({
							variant: 'success',
							title: 'Episode Closed',
							actions: [],
						});
					} catch (error) {
						handleError(error);
					}
				}}
			/>

			<Dropdown className={classNames(classes.shelfMoreButton, 'position-absolute')}>
				<Dropdown.Toggle as={DropdownToggle} id={`mhic-shelf__dropdown-menu`} className="p-2 border-0">
					<MoreIcon className="d-flex" />
				</Dropdown.Toggle>
				<Dropdown.Menu as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
					<Dropdown.Item
						onClick={() => {
							setShowAssignOrderModal(true);
						}}
					>
						<SvgIcon kit="far" icon="user-plus" size={24} className="text-gray" /> Assign MHIC
					</Dropdown.Item>
					<Dropdown.Item
						onClick={() => {
							setShowAddVoicemailTaskModal(true);
						}}
					>
						<CallMsgIcon className="text-gray" /> Add Voicemail Task
					</Dropdown.Item>
					<Dropdown.Item
						onClick={() => {
							setShowScheduleCallModal(true);
						}}
					>
						<EventIcon className="text-gray" /> Schedule Call
					</Dropdown.Item>

					{!assessmentInProgress && !assessmentCompleted && (
						<>
							<Dropdown.Divider />
							<Dropdown.Item
								onClick={() => {
									navigate(`/ic/mhic/order-assessment/${patientOrder.patientOrderId}`);
								}}
							>
								<AssessmentIcon className="text-gray" /> Start Assessment
							</Dropdown.Item>
							<Dropdown.Item
								onClick={() => {
									setShowScheduleAssessmentModal(true);
								}}
							>
								<EditCalendarIcon className="text-gray" /> Schedule Assessment
							</Dropdown.Item>
						</>
					)}
					{assessmentCompleted && canAddResourceRequest && (
						<>
							<Dropdown.Divider />
							<Dropdown.Item
								onClick={async () => {
									await integratedCareService
										.updateResourcingStatus(patientOrder.patientOrderId, {
											patientOrderResourcingStatusId:
												PatientOrderResourcingStatusId.NEEDS_RESOURCES,
										})
										.fetch();

									revalidator.revalidate();
								}}
							>
								<AddNotesIcon className="text-gray" /> Add Resource Request
							</Dropdown.Item>
						</>
					)}
					<Dropdown.Divider />
					<Dropdown.Item
						onClick={() => {
							setShowCloseEpisodeModal(true);
						}}
					>
						<CloseIcon className="text-gray" /> Close Episode
					</Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
		</>
	);
};
