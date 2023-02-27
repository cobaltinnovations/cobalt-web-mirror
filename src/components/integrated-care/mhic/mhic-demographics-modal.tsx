import React, { FC, useCallback } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { Ethnicity, GenderIdentity, Race } from '@/lib/models';
import InputHelper from '@/components/input-helper';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 480,
	},
});

interface Props extends ModalProps {
	raceOptions: Race[];
	ethnicityOptions: Ethnicity[];
	genderIdentityOptions: GenderIdentity[];
	onSave(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicDemographicsModal: FC<Props> = ({
	raceOptions,
	ethnicityOptions,
	genderIdentityOptions,
	onSave,
	...props
}) => {
	const classes = useStyles();

	const handleOnEnter = useCallback(() => {
		//TODO: Set <select/> values to Patient's values
	}, []);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Edit Demographics</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<InputHelper
					as="select"
					className="mb-4"
					label="Race"
					value=""
					onChange={({ currentTarget }) => {
						window.alert(`Set race: ${currentTarget.value}`);
					}}
				>
					{raceOptions.map((option) => (
						<option key={option.raceId} value={option.raceId}>
							{option.description}
						</option>
					))}
				</InputHelper>
				<InputHelper
					as="select"
					className="mb-4"
					label="Ethnicity"
					value=""
					onChange={({ currentTarget }) => {
						window.alert(`Set race: ${currentTarget.value}`);
					}}
				>
					{ethnicityOptions.map((option) => (
						<option key={option.ethnicityId} value={option.ethnicityId}>
							{option.description}
						</option>
					))}
				</InputHelper>
				<InputHelper
					as="select"
					label="Gender Identity"
					value=""
					onChange={({ currentTarget }) => {
						window.alert(`Set race: ${currentTarget.value}`);
					}}
				>
					{genderIdentityOptions.map((option) => (
						<option key={option.genderIdentityId} value={option.genderIdentityId}>
							{option.description}
						</option>
					))}
				</InputHelper>
			</Modal.Body>
			<Modal.Footer className="text-right">
				<Button variant="outline-primary" className="me-2" onClick={props.onHide}>
					Cancel
				</Button>
				<Button variant="primary" onClick={onSave}>
					Save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
