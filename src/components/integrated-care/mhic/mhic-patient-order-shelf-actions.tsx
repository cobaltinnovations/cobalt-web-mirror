import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { Dropdown } from 'react-bootstrap';

import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';
import { MhicAssignOrderModal } from './mhic-assign-order-modal';
import useFlags from '@/hooks/use-flags';
import { PatientOrderDispositionId, PatientOrderModel, PatientOrderResourcingStatusId } from '@/lib/models';
import useFetchPanelAccounts from '@/routes/ic/hooks/use-fetch-panel-accounts';
import { integratedCareService } from '@/lib/services';

import { ReactComponent as SwapIcon } from '@/assets/icons/icon-swap.svg';
import { ReactComponent as CallMsgIcon } from '@/assets/icons/icon-call-msg.svg';
import { ReactComponent as AssessmentIcon } from '@/assets/icons/icon-assessment.svg';
import { ReactComponent as EditCalendarIcon } from '@/assets/icons/icon-edit-calendar.svg';
import { ReactComponent as AddNotesIcon } from '@/assets/icons/icon-add-notes.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { useNavigate } from 'react-router-dom';
import { MhicScheduleAssessmentModal } from './mhic-schedule-assessment-modal';
import { MhicVoicemailTaskModal } from './mhic-voicemail-task-modal';
import { MhicCloseEpisodeModal } from './mhic-close-episode-modal';
import useHandleError from '@/hooks/use-handle-error';

const useStyles = createUseThemedStyles(() => ({
	shelfMoreButton: {
		top: 20,
		right: 64,
	},
}));

interface MhicPatientOrderShelfActionsProps {
	patientOrder: PatientOrderModel;
	onDataChange: (updatedOrder: PatientOrderModel) => void;
}

const NO_ACTION_DISPOSITIONS = [PatientOrderDispositionId.CLOSED, PatientOrderDispositionId.ARCHIVED];

export const MhicPatientOrderShelfActions = ({ patientOrder, onDataChange }: MhicPatientOrderShelfActionsProps) => {
	const handleError = useHandleError();
	const classes = useStyles();
	const { addFlag } = useFlags();
	const navigate = useNavigate();

	const [showAssignOrderModal, setShowAssignOrderModal] = useState(false);
	const [showScheduleAssessmentModal, setShowScheduleAssessmentModal] = useState(false);
	const [showAddVoicemailTaskModal, setShowAddVoicemailTaskModal] = useState(false);
	const [showCloseEpisodeModal, setShowCloseEpisodeModal] = useState(false);

	const handleAssignOrdersSave = useCallback(
		async (patientOrderCount: number, panelAccountDisplayName: string) => {
			const response = await integratedCareService.getPatientOrder(patientOrder.patientOrderId).fetch();
			onDataChange(response.patientOrder);
			setShowAssignOrderModal(false);
			addFlag({
				variant: 'success',
				title: 'Patient assigned',
				description: `Patient assigned to ${panelAccountDisplayName}`,
				actions: [],
			});
		},
		[addFlag, onDataChange, patientOrder.patientOrderId]
	);

	const { fetchPanelAccounts, panelAccounts = [] } = useFetchPanelAccounts();

	useEffect(() => {
		fetchPanelAccounts();
	}, [fetchPanelAccounts]);

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
				panelAccounts={panelAccounts}
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
				onSave={(updatedPatientOrder) => {
					onDataChange(updatedPatientOrder);
					setShowScheduleAssessmentModal(false);
				}}
			/>

			<MhicVoicemailTaskModal
				patientOrder={patientOrder}
				show={showAddVoicemailTaskModal}
				panelAccounts={panelAccounts}
				onHide={() => {
					setShowAddVoicemailTaskModal(false);
				}}
				onSave={(updatedPatientOrder) => {
					onDataChange(updatedPatientOrder);
					setShowAddVoicemailTaskModal(false);
				}}
			/>

			<MhicCloseEpisodeModal
				show={showCloseEpisodeModal}
				onHide={() => {
					setShowCloseEpisodeModal(false);
				}}
				onSave={async (patientOrderClosureReasonId) => {
					try {
						const response = await integratedCareService
							.closePatientOrder(patientOrder.patientOrderId, { patientOrderClosureReasonId })
							.fetch();

						onDataChange(response.patientOrder);
						setShowCloseEpisodeModal(false);
						addFlag({
							variant: 'success',
							title: 'Episode Closed',
							description: '{Message}',
							actions: [],
						});
					} catch (error) {
						handleError(error);
					}
				}}
			/>

			<Dropdown className={classNames(classes.shelfMoreButton, 'position-absolute')}>
				<Dropdown.Toggle as={DropdownToggle} id={`mhic-shelf__dropdown-menu`} className="p-2">
					<MoreIcon className="d-flex" />
				</Dropdown.Toggle>
				<Dropdown.Menu as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
					<Dropdown.Item
						onClick={() => {
							setShowAssignOrderModal(true);
						}}
					>
						<SwapIcon className="text-gray" /> Assign to MHIC
					</Dropdown.Item>
					<Dropdown.Item
						onClick={() => {
							setShowAddVoicemailTaskModal(true);
						}}
					>
						<CallMsgIcon className="text-gray" /> Add Voicemail Task
					</Dropdown.Item>

					{!assessmentInProgress && !assessmentCompleted && (
						<>
							<Dropdown.Divider />
							<Dropdown.Item
								onClick={() => {
									navigate(`/ic/mhic/orders/${patientOrder.patientOrderId}/assessment`);
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
									const response = await integratedCareService
										.updateResourcingStatus(patientOrder.patientOrderId, {
											patientOrderResourcingStatusId:
												PatientOrderResourcingStatusId.NEEDS_RESOURCES,
										})
										.fetch();

									onDataChange(response.patientOrder);
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
