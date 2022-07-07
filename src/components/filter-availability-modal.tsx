import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ProviderAvailability } from '@/lib/models';
import { cloneDeep } from 'lodash';

const useFilterAvailabilityModalStyles = createUseStyles({
	filterAvailabilityModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterAvailabilityModalProps extends ModalProps {
	availabilities: ProviderAvailability[];
	selectedAvailability: ProviderAvailability['availability'];
	selectedVisitTypeIds: string[];
	onSave(availability: ProviderAvailability['availability'], visitTypeIds: string[]): void;
}

const FilterAvailabilityModal: FC<FilterAvailabilityModalProps> = ({
	availabilities,
	selectedAvailability,
	selectedVisitTypeIds,
	onSave,
	...props
}) => {
	const classes = useFilterAvailabilityModalStyles();

	const [allAvailabilites, setAllAvailabilities] = useState<ProviderAvailability[]>([]);
	const [selected, setSelected] = useState(selectedAvailability);
	const [visitTypeIds, setVisitTypeIds] = useState<string[]>([]);

	useEffect(() => {
		if (props.show) {
			setSelected(selectedAvailability);
		}
	}, [props.show, selectedAvailability]);

	useEffect(() => {
		setAllAvailabilities(availabilities);
	}, [availabilities]);

	useEffect(() => {
		setSelected(selectedAvailability);
	}, [selectedAvailability]);

	useEffect(() => {
		setVisitTypeIds(selectedVisitTypeIds);
	}, [selectedVisitTypeIds]);

	function handleVisitTypeCheckboxChange(value: string) {
		const visitTypeIdsClone = cloneDeep(visitTypeIds);
		const indexToRemove = visitTypeIdsClone.findIndex((id) => id === value);

		if (indexToRemove > -1) {
			visitTypeIdsClone.splice(indexToRemove, 1);
		} else {
			visitTypeIdsClone.push(value);
		}

		setVisitTypeIds(visitTypeIdsClone);
	}

	return (
		<Modal {...props} dialogClassName={classes.filterAvailabilityModal} centered>
			<Modal.Header>
				<h3 className="mb-0">availability</h3>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-4">
					{allAvailabilites.map(({ availability, description }) => {
						return (
							<Form.Check
								key={availability}
								type="radio"
								id={availability}
								name={availability}
								label={description}
								checked={availability === selected}
								onChange={() => {
									setSelected(availability);
								}}
							/>
						);
					})}
				</div>
				<div className="mb-2">
					<h3 className="mb-3">visit type</h3>
					<Form.Check
						type="checkbox"
						id="visit-type__initial"
						name="visit-type"
						label="First session"
						value="INITIAL"
						checked={visitTypeIds.includes('INITIAL')}
						onChange={() => {
							handleVisitTypeCheckboxChange('INITIAL');
						}}
					/>
					<Form.Check
						type="checkbox"
						id="visit-type__followup"
						name="visit-type"
						label="Follow-up session"
						value="FOLLOWUP"
						checked={visitTypeIds.includes('FOLLOWUP')}
						onChange={() => {
							handleVisitTypeCheckboxChange('FOLLOWUP');
						}}
					/>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button variant="primary" size="sm" onClick={() => onSave(selected, visitTypeIds)}>
					save
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterAvailabilityModal;
