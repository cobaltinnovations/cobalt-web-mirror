import InputHelper from '@/components/input-helper';
import { TypeaheadHelper } from '@/components/typeahead-helper';
import React from 'react';
import { Card, Form } from 'react-bootstrap';

interface MhicLocationCardProps {
	id: string;
	location?: string;
	wheelchairAccessible?: boolean;
	languages?: string[];
	uniquePhoneNumber?: boolean;
	notes?: string;
	onChange(): void;
	className?: string;
}

export const MhicCareResourceLocationCard = ({
	id,
	location,
	wheelchairAccessible,
	languages,
	uniquePhoneNumber,
	notes,
	onChange,
	className,
}: MhicLocationCardProps) => {
	return (
		<Card bsPrefix="ic-card ic-card--care-resource-location" className={className}>
			<Card.Body>
				<TypeaheadHelper
					className="mb-3"
					id={`mhic-location-card__location--${id}`}
					label="Location"
					labelKey="name"
					options={[]}
					selected={location ? [location] : []}
					onChange={onChange}
				/>
				<Form.Check
					className="mb-3"
					type="checkbox"
					id={`mhic-location-card__wheelchair-accessible--${id}`}
					value="WHEELCHAIR_ACCESSIBLE"
					label="Wheelchair Accessible"
					checked={wheelchairAccessible ?? false}
					onChange={onChange}
				/>
				<TypeaheadHelper
					className="mb-3"
					id={`mhic-location-card__languages--${id}`}
					label="Languages"
					multiple
					labelKey="name"
					options={[]}
					selected={languages ?? []}
					onChange={onChange}
				/>
				<Form.Check
					className="mb-3"
					type="checkbox"
					id={`mhic-location-card__unique-phone-number--${id}`}
					value="UNIQUE_PHONE_NUMBER"
					label="Phone number different than main"
					checked={uniquePhoneNumber ?? false}
					onChange={onChange}
				/>
				<InputHelper as="textarea" label="Location Notes" value={notes} onChange={onChange} />
			</Card.Body>
		</Card>
	);
};
