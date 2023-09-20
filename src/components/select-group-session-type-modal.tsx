import React, { FC, useCallback, useEffect, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { GroupSessionSchedulingSystemId } from '@/lib/services';
import { GroupSessionLocationTypeId } from '@/lib/models';
import InputHelper from './input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onContinue(options: {
		groupSessionLocationTypeId: GroupSessionLocationTypeId;
		groupSessionSchedulingSystemId?: GroupSessionSchedulingSystemId;
	}): void;
}

const SelectGroupSessionTypeModal: FC<Props> = ({ onContinue, ...props }) => {
	const classes = useStyles();
	const [groupSessionLocationTypeId, setGroupSessionLocationTypeId] = useState<GroupSessionLocationTypeId>();
	const [groupSessionSchedulingSystemId, setGroupSessionSchedulingSystemId] =
		useState<GroupSessionSchedulingSystemId>();

	const handleOnEnter = useCallback(() => {
		setGroupSessionLocationTypeId(undefined);
	}, []);

	useEffect(() => {
		if (groupSessionLocationTypeId) {
			setGroupSessionSchedulingSystemId(undefined);
		}
	}, [groupSessionLocationTypeId]);

	const canContinue =
		groupSessionLocationTypeId === GroupSessionLocationTypeId.IN_PERSON || !!groupSessionSchedulingSystemId;

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Add Group Session</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label className="mb-1">Which type of session would you like to add?</Form.Label>
				<Form.Check
					type="radio"
					name="group-session-location-type"
					id={`group-session-location-type${GroupSessionLocationTypeId.IN_PERSON}`}
					label="In-person"
					value={GroupSessionLocationTypeId.IN_PERSON}
					checked={GroupSessionLocationTypeId.IN_PERSON === groupSessionLocationTypeId}
					onChange={() => {
						setGroupSessionLocationTypeId(GroupSessionLocationTypeId.IN_PERSON);
					}}
				/>
				<Form.Check
					type="radio"
					name="group-session-location-type"
					id={`group-session-location-type${GroupSessionLocationTypeId.VIRTUAL}`}
					label="Online"
					value={GroupSessionLocationTypeId.VIRTUAL}
					checked={GroupSessionLocationTypeId.VIRTUAL === groupSessionLocationTypeId}
					onChange={() => {
						setGroupSessionLocationTypeId(GroupSessionLocationTypeId.VIRTUAL);
					}}
				/>
				{groupSessionLocationTypeId === GroupSessionLocationTypeId.VIRTUAL && (
					<InputHelper
						as="select"
						className="ms-8 mt-2"
						label="Select scheduling platform"
						required
						value={groupSessionSchedulingSystemId ?? ''}
						onChange={({ currentTarget }) => {
							setGroupSessionSchedulingSystemId(currentTarget.value as GroupSessionSchedulingSystemId);
						}}
					>
						<option value="" disabled>
							Select scheduling platform
						</option>
						<option value={GroupSessionSchedulingSystemId.COBALT}>Cobalt</option>
						<option value={GroupSessionSchedulingSystemId.EXTERNAL}>External</option>
					</InputHelper>
				)}
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button
					variant="primary"
					onClick={() => {
						if (!canContinue || !groupSessionLocationTypeId) {
							return;
						}

						onContinue({ groupSessionSchedulingSystemId, groupSessionLocationTypeId });
					}}
					disabled={!canContinue}
				>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SelectGroupSessionTypeModal;
