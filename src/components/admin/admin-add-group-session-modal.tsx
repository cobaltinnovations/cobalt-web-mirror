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
	onContinue(groupSessionSchedulingSystemId: GroupSessionSchedulingSystemId): void;
}

export const AdminAddGroupSessionModal: FC<Props> = ({ onContinue, ...props }) => {
	const classes = useStyles();
	const [groupSessionSchedulingSystemId, setGroupSessionSchedulingSystemId] =
		useState<GroupSessionSchedulingSystemId>();

	const handleOnEnter = useCallback(() => {
		setGroupSessionSchedulingSystemId(undefined);
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Add Group Session</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label className="mb-1">Which scheduling platform will be used for this group session?</Form.Label>
				<Form.Check
					type="radio"
					name="group-session-scheduling-system"
					id={`group-session-scheduling-system__${GroupSessionSchedulingSystemId.COBALT}`}
					label="Cobalt"
					value={GroupSessionSchedulingSystemId.COBALT}
					checked={GroupSessionSchedulingSystemId.COBALT === groupSessionSchedulingSystemId}
					onChange={() => {
						setGroupSessionSchedulingSystemId(GroupSessionSchedulingSystemId.COBALT);
					}}
				/>
				<Form.Check
					type="radio"
					name="group-session-scheduling-system"
					id={`group-session-scheduling-system__${GroupSessionSchedulingSystemId.EXTERNAL}`}
					label="External"
					value={GroupSessionSchedulingSystemId.EXTERNAL}
					checked={GroupSessionSchedulingSystemId.EXTERNAL === groupSessionSchedulingSystemId}
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
						if (!groupSessionSchedulingSystemId) {
							return;
						}

						onContinue(groupSessionSchedulingSystemId);
					}}
					disabled={!groupSessionSchedulingSystemId}
				>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
