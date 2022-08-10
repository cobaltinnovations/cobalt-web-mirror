import React, { FC, useState, useEffect } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { SupportRole, SupportRoleId } from '@/lib/models';
import { useLocation, useSearchParams } from 'react-router-dom';

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
}

const FilterProviderTypesModal: FC<FilterProviderTypesModalProps> = ({ providerTypes, recommendedTypes, ...props }) => {
	const classes = useFilterProviderTypesModalStyles();

	const [searchParams, setSearchParams] = useSearchParams();
	const location = useLocation();
	const [selected, setSelected] = useState(searchParams.getAll('supportRoleId') as SupportRoleId[]);

	useEffect(() => {
		const selections = searchParams.getAll('supportRoleId') as SupportRoleId[];
		setSelected(selections.length > 0 ? selections : [...recommendedTypes]);
	}, [recommendedTypes, searchParams]);

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
						setSelected([...recommendedTypes]);
					}}
				>
					recommended for you
				</Button>

				{providerTypes.map((providerType, index) => {
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
					<Button
						className="ms-2"
						variant="primary"
						onClick={() => {
							searchParams.delete('supportRoleId');
							for (const role of selected) {
								searchParams.append('supportRoleId', role);
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

export default FilterProviderTypesModal;
