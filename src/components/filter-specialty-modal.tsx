import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { Specialty } from '@/lib/models';
import { useLocation, useSearchParams } from 'react-router-dom';
import useAnalytics from '@/hooks/use-analytics';
import { ProviderSearchAnalyticsEvent } from '@/contexts/analytics-context';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 295,
	},
});

interface FilterSpecialtyModalProps extends ModalProps {
	specialties: Specialty[];
}

const FilterSpecialtyModal: FC<FilterSpecialtyModalProps> = ({ specialties, ...props }) => {
	useTrackModalView('FilterSpecialtyModal', props.show);
	const classes = useStyles();

	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const { trackEvent } = useAnalytics();
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
				<Modal.Title>Focus</Modal.Title>
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
						Cancel
					</Button>
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							trackEvent(ProviderSearchAnalyticsEvent.applyFilter('Focus'));

							searchParams.delete('specialtyId');

							for (const specialtyId of selected) {
								searchParams.append('specialtyId', specialtyId);
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

export default FilterSpecialtyModal;
