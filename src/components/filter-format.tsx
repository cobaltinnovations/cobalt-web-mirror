import { cloneDeep } from 'lodash';
import React, { FC, useEffect, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ContentListFormat } from '@/lib/services';
import useAnalytics from '@/hooks/use-analytics';
import { ContentAnalyticsEvent } from '@/contexts/analytics-context';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useStyles = createUseStyles({
	modal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterFormatProps extends ModalProps {
	formats: ContentListFormat[];
	selectedFormatIds: string[];
	onSave(selectedFormatIds: string[]): void;
}

const FilterFormat: FC<FilterFormatProps> = ({ formats, selectedFormatIds, onSave, ...props }) => {
	useTrackModalView('FilterFormat', props.show);
	const classes = useStyles();
	const { trackEvent } = useAnalytics();
	const [internalSelectedFormatIds, setInternalSelectedFormatIds] = useState<string[]>([]);

	useEffect(() => {
		if (props.show) {
			setInternalSelectedFormatIds(selectedFormatIds);
		}
	}, [props.show, selectedFormatIds]);

	function handleSelectAllButtonClick() {
		const allOptionValues = formats.map((format) => format.contentTypeLabelId);
		setInternalSelectedFormatIds(allOptionValues);
	}

	function handleDeselectAllButtonClick() {
		setInternalSelectedFormatIds([]);
	}

	function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { checked, value } = event.currentTarget;
		const internalSelectedFormatIdsClone = cloneDeep(internalSelectedFormatIds);

		if (checked) {
			internalSelectedFormatIdsClone.push(value);
		} else {
			const targetIndex = internalSelectedFormatIdsClone.findIndex((sf) => sf === value);
			internalSelectedFormatIdsClone.splice(targetIndex, 1);
		}

		setInternalSelectedFormatIds(internalSelectedFormatIdsClone);
	}

	function handleSaveButtonClick() {
		trackEvent(ContentAnalyticsEvent.applyFilter('Format'));
		onSave(internalSelectedFormatIds);
	}

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header closeButton>
				<Modal.Title>format</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="d-flex mb-3">
					<Button variant="link" className="p-0" onClick={handleSelectAllButtonClick}>
						Select All
					</Button>
					<Button variant="link" className="ms-3 p-0" onClick={handleDeselectAllButtonClick}>
						Deselect All
					</Button>
				</div>
				<Form>
					{formats.map((format, index) => {
						return (
							<Form.Check
								key={`${format.contentTypeLabelId}-${index}`}
								type="checkbox"
								name="on-your-time__filter-format"
								id={`on-your-time__filter-format--${format.contentTypeLabelId}`}
								label={format.description}
								value={format.contentTypeLabelId}
								checked={internalSelectedFormatIds.includes(format.contentTypeLabelId)}
								onChange={handleCheckboxChange}
							/>
						);
					})}
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button variant="outline-primary" onClick={props.onHide}>
						Cancel
					</Button>
					<Button className="ms-2" variant="primary" onClick={handleSaveButtonClick}>
						Save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterFormat;
