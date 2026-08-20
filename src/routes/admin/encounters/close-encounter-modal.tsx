import React, { FC, useCallback, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import LoadingButton from '@/components/loading-button';
import useHandleError from '@/hooks/use-handle-error';
import { CareEncounterCancellationReasonId, CareEncounterCancellationReasonModel } from '@/lib/models';
import { CancelCareEncounterRequestBody, careEncounterService } from '@/lib/services';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onSave(data: CancelCareEncounterRequestBody): Promise<void>;
}

export const CloseEncounterModal: FC<Props> = ({ onSave, ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const [selectedReasonId, setSelectedReasonId] = useState<CareEncounterCancellationReasonId>();
	const [otherReason, setOtherReason] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [careEncounterCancellationReasons, setCareEncounterCancellationReasons] = useState<
		CareEncounterCancellationReasonModel[]
	>([]);
	const selectedReason = careEncounterCancellationReasons.find(
		(cancellationReason) => cancellationReason.careEncounterCancellationReasonId === selectedReasonId
	);
	const otherReasonRequired = selectedReason?.freeformTextRequired ?? false;
	const normalizedOtherReason = otherReason.trim();

	const getCancellationReasons = useCallback(async () => {
		setIsLoading(true);

		try {
			const response = await careEncounterService.getCareEncounterCancellationReasons().fetch();
			setCareEncounterCancellationReasons(response.careEncounterCancellationReasons);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [handleError]);

	const handleOnEnter = useCallback(() => {
		setSelectedReasonId(undefined);
		setOtherReason('');
		setCareEncounterCancellationReasons([]);
		getCancellationReasons();
	}, [getCancellationReasons]);

	const handleSave = useCallback(async () => {
		if (!selectedReasonId || (otherReasonRequired && !normalizedOtherReason)) {
			return;
		}

		setIsLoading(true);

		try {
			await onSave({
				careEncounterCancellationReasonId: selectedReasonId,
				...(otherReasonRequired ? { careEncounterCancellationReasonOtherText: normalizedOtherReason } : {}),
			});
		} finally {
			setIsLoading(false);
		}
	}, [normalizedOtherReason, onSave, otherReasonRequired, selectedReasonId]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Close Encounter</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label className="mb-1">Reason for Closure:</Form.Label>
				{!isLoading && careEncounterCancellationReasons.length <= 0 && (
					<p className="mb-0 text-danger">No closure reasons found.</p>
				)}
				{careEncounterCancellationReasons.map((cancellationReason) => (
					<Form.Check
						key={cancellationReason.careEncounterCancellationReasonId}
						type="radio"
						name="reason-for-closure"
						id={`reason-for-closure__${cancellationReason.careEncounterCancellationReasonId}`}
						label={cancellationReason.description}
						value={cancellationReason.careEncounterCancellationReasonId}
						checked={cancellationReason.careEncounterCancellationReasonId === selectedReasonId}
						disabled={isLoading}
						onChange={({ currentTarget }) => {
							setSelectedReasonId(currentTarget.value as CareEncounterCancellationReasonId);
							setOtherReason('');
						}}
					/>
				))}
				{otherReasonRequired && (
					<Form.Group controlId="reason-for-closure__other-reason" className="mt-3">
						<Form.Label>Other reason</Form.Label>
						<Form.Control
							as="textarea"
							rows={3}
							maxLength={2000}
							required
							disabled={isLoading}
							value={otherReason}
							onChange={({ currentTarget }) => {
								setOtherReason(currentTarget.value);
							}}
						/>
					</Form.Group>
				)}
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide} disabled={isLoading}>
					Cancel
				</Button>
				<LoadingButton
					variant="primary"
					isLoading={isLoading}
					onClick={handleSave}
					disabled={isLoading || !selectedReasonId || (otherReasonRequired && !normalizedOtherReason)}
				>
					Close Encounter
				</LoadingButton>
			</Modal.Footer>
		</Modal>
	);
};
