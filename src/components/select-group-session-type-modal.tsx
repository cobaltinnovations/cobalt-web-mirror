import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { GroupSessionSchedulingSystemId } from '@/lib/services';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onContinue(options: { groupSessionSchedulingSystemId: GroupSessionSchedulingSystemId }): void;
}

const SelectGroupSessionTypeModal: FC<Props> = ({ onContinue, ...props }) => {
	const classes = useStyles();

	const [groupSessionSchedulingSystemId, setGroupSessionSchedulingSystemId] =
		useState<GroupSessionSchedulingSystemId>(GroupSessionSchedulingSystemId.COBALT);

	const handleOnEnter = useCallback(() => {
		setGroupSessionSchedulingSystemId(GroupSessionSchedulingSystemId.COBALT);
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Add Group Session</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label className="mb-1">How will people register for the session?</Form.Label>
				<Form.Check
					type="radio"
					name="group-session-scheduling-system"
					id={`group-session-scheduling-system${GroupSessionSchedulingSystemId.COBALT}`}
					label={
						<>
							On Cobalt <span className="text-muted">(recommended)</span>
						</>
					}
					value={GroupSessionSchedulingSystemId.COBALT}
					checked={groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.COBALT}
					onChange={() => {
						setGroupSessionSchedulingSystemId(GroupSessionSchedulingSystemId.COBALT);
					}}
				/>
				<Form.Check
					type="radio"
					name="group-session-scheduling-system"
					id={`group-session-scheduling-system${GroupSessionSchedulingSystemId.EXTERNAL}`}
					label="Through a different website"
					value={GroupSessionSchedulingSystemId.EXTERNAL}
					checked={groupSessionSchedulingSystemId === GroupSessionSchedulingSystemId.EXTERNAL}
					onChange={() => {
						setGroupSessionSchedulingSystemId(GroupSessionSchedulingSystemId.EXTERNAL);
					}}
				/>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button
					variant="primary"
					onClick={() => {
						onContinue({ groupSessionSchedulingSystemId });
					}}
				>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SelectGroupSessionTypeModal;
