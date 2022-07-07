import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps, ModalTitle } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { SupportRole, SupportRoleId } from '@/lib/models';

const useFilterProviderTypesModalStyles = createUseStyles({
	filterProviderTypesModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface FilterProviderTypesModalProps extends ModalProps {
	providerTypes: SupportRole[];
	recommendedTypes: SupportRoleId[];
	selectedTypes: SupportRoleId[];
	onSave(selectedTypes: SupportRoleId[]): void;
}

const FilterProviderTypesModal: FC<FilterProviderTypesModalProps> = ({
	providerTypes,
	recommendedTypes,
	selectedTypes,
	onSave,
	...props
}) => {
	const classes = useFilterProviderTypesModalStyles();

	const [allTypes, setAllTypes] = useState<SupportRole[]>([]);
	const [defaults, setDefaults] = useState<SupportRoleId[]>([]);
	const [selected, setSelected] = useState<SupportRoleId[]>([]);

	useEffect(() => {
		if (props.show) {
			setSelected(selectedTypes);
		}
	}, [props.show, selectedTypes]);

	useEffect(() => {
		setAllTypes(providerTypes);
	}, [providerTypes]);

	useEffect(() => {
		setDefaults(recommendedTypes);
	}, [recommendedTypes]);

	useEffect(() => {
		setSelected(selectedTypes);
	}, [selectedTypes]);

	return (
		<Modal {...props} dialogClassName={classes.filterProviderTypesModal} centered>
			<Modal.Header closeButton>
				<Modal.Title>provider type</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Button
					type="button"
					variant="link"
					className="p-0 mb-1"
					size="sm"
					onClick={() => {
						setSelected([...defaults]);
					}}
				>
					recommended for you
				</Button>

				{allTypes.map((providerType, index) => {
					const isSelected = selected.includes(providerType.supportRoleId);

					return (
						<Form.Check
							key={`${providerType.supportRoleId}-${index}`}
							type="checkbox"
							id={providerType.supportRoleId}
							name={providerType.supportRoleId}
							label={providerType.description}
							checked={isSelected}
							onChange={() => {
								if (isSelected) {
									setSelected(selected.filter((s) => s !== providerType.supportRoleId));
								} else {
									setSelected([...selected, providerType.supportRoleId]);
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
					<Button className="ms-2" variant="primary" onClick={() => onSave(selected)}>
						save
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default FilterProviderTypesModal;
