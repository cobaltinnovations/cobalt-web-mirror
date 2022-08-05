import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { Specialty } from '@/lib/models';

const useStyles = createUseStyles({
	modal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterSpecialtyModalProps extends ModalProps {
	specialties: Specialty[];
	selectedSpecialties: string[];
	onSave(selectedSpecialties: string[]): void;
}

const FilterSpecialtyModal: FC<FilterSpecialtyModalProps> = ({
	specialties,
	selectedSpecialties,
	onSave,
	...props
}) => {
	const classes = useStyles();
	const [internalSelectedSpecialties, setInternalSelectedSpecialties] = useState<string[]>([]);

	useEffect(() => {
		if (props.show) {
			setInternalSelectedSpecialties(selectedSpecialties);
		}
	}, [props.show, selectedSpecialties]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header closeButton>
				<Modal.Title>focus</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{specialties.map((specialty) => {
					return (
						<Form.Check
							key={specialty.specialtyId}
							type="checkbox"
							id={specialty.specialtyId}
							name={specialty.specialtyId}
							label={specialty.description}
							checked={internalSelectedSpecialties.includes(specialty.specialtyId)}
							onChange={(event) => {
								if (event.currentTarget.checked) {
									setInternalSelectedSpecialties([
										...internalSelectedSpecialties,
										specialty.specialtyId,
									]);
								} else {
									setInternalSelectedSpecialties(
										internalSelectedSpecialties.filter((s) => s !== specialty.specialtyId)
									);
								}
							}}
						/>
					);
				})}
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						cancel
					</Button>
					<Button className="ms-2" variant="primary" onClick={() => onSave(internalSelectedSpecialties)}>
						save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterSpecialtyModal;