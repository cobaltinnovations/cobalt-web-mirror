import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ProviderAvailability, ProviderVisitType } from '@/lib/models';
import { useLocation, useSearchParams } from 'react-router-dom';
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
	visitTypes: ProviderVisitType[];
	defaultAvailability?: string;
	defaultVisitTypeIds: string[];
}

const FilterAvailabilityModal: FC<FilterAvailabilityModalProps> = ({
	availabilities,
	visitTypes,
	defaultAvailability,
	defaultVisitTypeIds,
	...props
}) => {
	useTrackModalView('FilterAvailabilityModal', props.show);
	const classes = useFilterAvailabilityModalStyles();

	const { trackEvent } = useAnalytics();
	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const [selectedAvailability, setSelectedAvailability] = useState(
		searchParams.get('availability') || defaultAvailability || ''
	);
	const [selectedVisitTypeIds, setSelectedVisitTypeIds] = useState(searchParams.getAll('visitTypeId'));

	useEffect(() => {
		if (props.show) {
			setSelectedAvailability(searchParams.get('availability') || defaultAvailability || '');

			const selections = searchParams.getAll('visitTypeId');
			setSelectedVisitTypeIds(selections.length > 0 ? selections : [...defaultVisitTypeIds]);
		}
	}, [defaultAvailability, defaultVisitTypeIds, props.show, searchParams]);

	return (
		<Modal {...props} dialogClassName={classes.filterAvailabilityModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>availability</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-4">
					{availabilities.map(({ availability, description }) => {
						return (
							<Form.Check
								key={availability}
								type="radio"
								id={availability}
								name={availability}
								label={description}
								checked={availability === selectedAvailability}
								onChange={() => {
									setSelectedAvailability(availability);
								}}
							/>
						);
					})}
				</div>
				<div className="mb-2">
					<h3 className="mb-3">visit type</h3>
					{visitTypes.map((visitType) => {
						return (
							<Form.Check
								type="checkbox"
								key={visitType.visitTypeId}
								id={visitType.visitTypeId}
								name="visit-type"
								label={visitType.description}
								value={visitType.visitTypeId}
								checked={selectedVisitTypeIds.includes(visitType.visitTypeId)}
								onChange={(event) => {
									if (event.currentTarget.checked) {
										setSelectedVisitTypeIds([...selectedVisitTypeIds, visitType.visitTypeId]);
									} else {
										setSelectedVisitTypeIds(
											selectedVisitTypeIds.filter((v) => v !== visitType.visitTypeId)
										);
									}
								}}
							/>
						);
					})}
				</div>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						Cancel
					</Button>
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							trackEvent(ProviderSearchAnalyticsEvent.applyFilter('Availability'));
							searchParams.set('availability', selectedAvailability);
							searchParams.delete('visitTypeId');

							for (const visitTypeId of selectedVisitTypeIds) {
								searchParams.append('visitTypeId', visitTypeId);
							}

							setSearchParams(searchParams, { state: location.state });
							props.onHide?.();
						}}
					>
						Save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterAvailabilityModal;
