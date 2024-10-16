import InputHelper from '@/components/input-helper';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import React from 'react';
import { Card, Form } from 'react-bootstrap';

interface MhicLocationCardValueModel {
	id: string;
	location: string;
	wheelchairAccessible: boolean;
	languages: string[];
	uniquePhoneNumber: boolean;
	phoneNumber: string;
	notes: string;
}

interface MhicLocationCardProps {
	className?: string;
	value: MhicLocationCardValueModel;
	onChange(value: MhicLocationCardValueModel): void;
}

export const MhicCareResourceLocationCard = ({ value, onChange, className }: MhicLocationCardProps) => {
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
				<InputHelper
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
			</Card.Body>
		</Card>
	);
};
