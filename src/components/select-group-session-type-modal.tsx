import React, { FC, useCallback, useState } from 'react';
import { Modal, Button, ModalProps, Form } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { GroupSessionSchedulingSystemId } from '@/lib/services';
import { GroupSessionLocationTypeId } from '@/lib/models';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	onContinue(options: {
		groupSessionLocationTypeId: GroupSessionLocationTypeId;
		groupSessionSchedulingSystemId: GroupSessionSchedulingSystemId;
	}): void;
}

const SelectGroupSessionTypeModal: FC<Props> = ({ onContinue, ...props }) => {
	const classes = useStyles();
	const [groupSessionLocationTypeId, setGroupSessionLocationTypeId] = useState<GroupSessionLocationTypeId>();
	const [groupSessionSchedulingSystemId, setGroupSessionSchedulingSystemId] =
		useState<GroupSessionSchedulingSystemId>(GroupSessionSchedulingSystemId.COBALT);

	const handleOnEnter = useCallback(() => {
		setGroupSessionLocationTypeId(undefined);
		setGroupSessionSchedulingSystemId(GroupSessionSchedulingSystemId.COBALT);
	}, []);

	const canContinue = !!groupSessionLocationTypeId && !!groupSessionSchedulingSystemId;

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Add Group Session</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Label className="mb-1">What type of session would you like to add?</Form.Label>
				<Form.Check
					type="radio"
					name="group-session-location-type"
					id={`group-session-location-type${GroupSessionLocationTypeId.VIRTUAL}`}
					label="Online"
					value={GroupSessionLocationTypeId.VIRTUAL}
					checked={groupSessionLocationTypeId === GroupSessionLocationTypeId.VIRTUAL}
					onChange={() => {
						setGroupSessionLocationTypeId(GroupSessionLocationTypeId.VIRTUAL);
					}}
				/>
				<Form.Check
					type="radio"
					name="group-session-location-type"
					id={`group-session-location-type${GroupSessionLocationTypeId.IN_PERSON}`}
					label="In-person"
					value={GroupSessionLocationTypeId.IN_PERSON}
					checked={groupSessionLocationTypeId === GroupSessionLocationTypeId.IN_PERSON}
					onChange={() => {
						setGroupSessionLocationTypeId(GroupSessionLocationTypeId.IN_PERSON);
					}}
				/>

				{groupSessionLocationTypeId && (
					<>
						<hr className="my-4" />

						<Form.Label className="mb-1">Where will people register for the session?</Form.Label>
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
					</>
				)}
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button
					variant="primary"
					disabled={!canContinue}
					onClick={() => {
						if (!canContinue) {
							throw new Error('Unable to Continue. Button should be disabled');
						}

						onContinue({ groupSessionSchedulingSystemId, groupSessionLocationTypeId });
					}}
				>
					Continue
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SelectGroupSessionTypeModal;
