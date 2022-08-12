import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ProviderAvailability } from '@/lib/models';
import { cloneDeep } from 'lodash';
import useAnalytics from '@/hooks/use-analytics';
import { ProviderSearchAnalyticsEvent } from '@/contexts/analytics-context';
import useTrackModalView from '@/hooks/use-track-modal-view';

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
	useTrackModalView('FilterAvailabilityModal', props.show);
	const classes = useFilterAvailabilityModalStyles();

	const [allAvailabilites, setAllAvailabilities] = useState<ProviderAvailability[]>([]);
	const [selected, setSelected] = useState(selectedAvailability);
	const [visitTypeIds, setVisitTypeIds] = useState<string[]>([]);
	const { trackEvent } = useAnalytics();

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
			<Modal.Header closeButton>
				<Modal.Title>availability</Modal.Title>
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
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						cancel
					</Button>
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							trackEvent(ProviderSearchAnalyticsEvent.applyFilter('Availability'));
							onSave(selected, visitTypeIds);
						}}
					>
						save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterAvailabilityModal;
