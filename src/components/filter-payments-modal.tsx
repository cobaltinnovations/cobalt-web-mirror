import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { PaymentType } from '@/lib/models';
import useAnalytics from '@/hooks/use-analytics';
import { ProviderSearchAnalyticsEvent } from '@/contexts/analytics-context';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useFilterPaymentsModalStyles = createUseStyles({
	filterPaymentsModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterPaymentsModalProps extends ModalProps {
	paymentTypes: PaymentType[];
	selectedTypes: PaymentType['paymentTypeId'][];
	onSave(selectedTypes: PaymentType['paymentTypeId'][]): void;
}

const FilterPaymentsModal: FC<FilterPaymentsModalProps> = ({ paymentTypes, selectedTypes, onSave, ...props }) => {
	useTrackModalView('FilterPaymentsModal', props.show);
	const classes = useFilterPaymentsModalStyles();

	const { trackEvent } = useAnalytics();
	const [allTypes, setAllTypes] = useState<PaymentType[]>([]);
	const [selected, setSelected] = useState<PaymentType['paymentTypeId'][]>([]);

	useEffect(() => {
		if (props.show) {
			setSelected(selectedTypes);
		}
	}, [props.show, selectedTypes]);

	useEffect(() => {
		setAllTypes(paymentTypes);
	}, [paymentTypes]);

	useEffect(() => {
		setSelected(selectedTypes);
	}, [selectedTypes]);

	return (
		<Modal {...props} dialogClassName={classes.filterPaymentsModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>payment type</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{allTypes.map((paymentType) => {
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
						cancel
					</Button>
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							trackEvent(ProviderSearchAnalyticsEvent.applyFilter('Payment Type'));
							onSave(selected);
						}}
					>
						save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterPaymentsModal;
