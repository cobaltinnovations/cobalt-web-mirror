import React from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import InputHelper from '@/components/input-helper';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import { ReactComponent as DeleteIcon } from '@/assets/icons/icon-delete.svg';

export interface CareResourceLocationCardValueModel {
	id: string;
	location: string;
	wheelchairAccessible: boolean;
	languages: string[];
	uniquePhoneNumber: boolean;
	phoneNumber: string;
	notes: string;
}

interface MhicLocationCardProps {
	value: CareResourceLocationCardValueModel;
	className?: string;
	onChange(value: CareResourceLocationCardValueModel): void;
	onDelete(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const MhicCareResourceLocationCard = ({ value, className, onChange, onDelete }: MhicLocationCardProps) => {
	return (
		<Card bsPrefix="ic-card ic-card--care-resource-location" className={className}>
			<Card.Body>
				<TypeaheadHelper
					className="mb-3"
					id={`mhic-location-card__location--${value.id}`}
					label="Location"
					labelKey="name"
					options={[]}
					selected={value.location ? [value.location] : []}
					onChange={([selected]) =>
						onChange({
							...value,
							location: selected as string,
						})
					}
				/>
				<Form.Check
					className="mb-3"
					type="checkbox"
					id={`mhic-location-card__wheelchair-accessible--${value.id}`}
					value="WHEELCHAIR_ACCESSIBLE"
					label="Wheelchair Accessible"
					checked={value.wheelchairAccessible ?? false}
					onChange={({ currentTarget }) =>
						onChange({
							...value,
							wheelchairAccessible: currentTarget.checked,
						})
					}
				/>
				<Form.Check
					className="mb-3"
					type="checkbox"
					id={`mhic-location-card__unique-phone-number--${value.id}`}
					value="UNIQUE_PHONE_NUMBER"
					label="Phone number different than main"
					checked={value.uniquePhoneNumber ?? false}
					onChange={({ currentTarget }) =>
						onChange({
							...value,
							uniquePhoneNumber: currentTarget.checked,
						})
					}
				/>
				{value.uniquePhoneNumber && (
					<InputHelper
						className="mb-3"
						type="tel"
						label="Phone Number"
						value={value.phoneNumber}
						onChange={({ currentTarget }) => {
							onChange({
								...value,
								phoneNumber: currentTarget.value,
							});
						}}
					/>
				)}
				<TypeaheadHelper
					className="mb-3"
					id={`mhic-location-card__languages--${value.id}`}
					label="Languages"
					multiple
					labelKey="name"
					options={[]}
					selected={value.languages ?? []}
					onChange={(selected) =>
						onChange({
							...value,
							languages: selected as string[],
						})
					}
				/>
				<InputHelper
					className="mb-3"
					as="textarea"
					label="Location Notes"
					value={value.notes}
					onChange={({ currentTarget }) =>
						onChange({
							...value,
							notes: currentTarget.value,
						})
					}
				/>
				<div className="d-flex justify-content-end">
					<Button type="button" variant="light" className="d-flex align-items-center" onClick={onDelete}>
						<DeleteIcon className="me-2" width={20} height={20} />
						Delete
					</Button>
				</div>
			</Card.Body>
		</Card>
	);
};