import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { PaymentType } from '@/lib/models';
import { useLocation, useSearchParams } from 'react-router-dom';
import useAnalytics from '@/hooks/use-analytics';
import { ProviderSearchAnalyticsEvent } from '@/contexts/analytics-context';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useFilterPaymentsModalStyles = createUseStyles({
	filterPaymentsModal: {
		maxWidth: 295,
	},
});

interface FilterPaymentsModalProps extends ModalProps {
	paymentTypes: PaymentType[];
}

const FilterPaymentsModal: FC<FilterPaymentsModalProps> = ({ paymentTypes, ...props }) => {
	useTrackModalView('FilterPaymentsModal', props.show);
	const classes = useFilterPaymentsModalStyles();

	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const { trackEvent } = useAnalytics();
	const [selected, setSelected] = useState(searchParams.getAll('paymentTypeId') as PaymentType['paymentTypeId'][]);

	useEffect(() => {
		if (props.show) {
			const selections = searchParams.getAll('paymentTypeId') as PaymentType['paymentTypeId'][];
			setSelected(selections.length > 0 ? selections : []);
		}
	}, [props.show, searchParams]);

	return (
		<Modal {...props} dialogClassName={classes.filterPaymentsModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>Payment Type</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{paymentTypes.map((paymentType) => {
					const isSelected = selected.includes(paymentType.paymentTypeId);

					return (
						<Form.Check
							key={paymentType.paymentTypeId}
							type="checkbox"
							id={paymentType.paymentTypeId}
							name={paymentType.paymentTypeId}
							label={paymentType.description}
							checked={isSelected}
							onChange={() => {
								if (isSelected) {
									setSelected(selected.filter((s) => s !== paymentType.paymentTypeId));
								} else {
									setSelected([...selected, paymentType.paymentTypeId]);
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
							trackEvent(ProviderSearchAnalyticsEvent.applyFilter('Payment Type'));

							searchParams.delete('paymentTypeId');

							for (const paymentTypeId of selected) {
								searchParams.append('paymentTypeId', paymentTypeId);
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

export default FilterPaymentsModal;
