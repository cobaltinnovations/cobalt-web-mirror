import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { Specialty } from '@/lib/models';
import { useLocation, useSearchParams } from 'react-router-dom';

const useStyles = createUseStyles({
	modal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterSpecialtyModalProps extends ModalProps {
	specialties: Specialty[];
}

const FilterSpecialtyModal: FC<FilterSpecialtyModalProps> = ({ specialties, ...props }) => {
	const classes = useStyles();

	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const [selected, setSelected] = useState(searchParams.getAll('specialtyId'));

	useEffect(() => {
		if (props.show) {
			const selections = searchParams.getAll('specialtyId');
			setSelected(selections.length > 0 ? selections : []);
		}
	}, [props.show, searchParams]);

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
							checked={selected.includes(specialty.specialtyId)}
							onChange={(event) => {
								if (event.currentTarget.checked) {
									setSelected([...selected, specialty.specialtyId]);
								} else {
									setSelected(selected.filter((s) => s !== specialty.specialtyId));
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
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							searchParams.delete('specialtyId');

							for (const specialtyId of selected) {
								searchParams.append('specialtyId', specialtyId);
							}

							setSearchParams(searchParams, { state: location.state });

							props.onHide?.();
						}}
					>
						save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterSpecialtyModal;
