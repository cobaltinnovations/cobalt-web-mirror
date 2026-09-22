import React from 'react';
import { render, screen, within } from '@testing-library/react';

import { InstitutionLocation } from '@/lib/models';
import InstitutionLocationSelectOptions from './institution-location-select-options';

const renderOptions = (institutionLocations: InstitutionLocation[]) =>
	render(
		<select aria-label="Employer">
			<InstitutionLocationSelectOptions institutionLocations={institutionLocations} />
		</select>
	);

it('groups employer locations by stable group ID and preserves API ordering', () => {
	renderOptions([
		{
			institutionId: 'penn',
			institutionLocationId: 'pah',
			name: 'Pennsylvania Hospital (PAH)',
			institutionLocationGroup: {
				institutionLocationGroupId: 'uphs-group-id',
				name: 'University of Pennsylvania Health System (UPHS)',
				displayOrder: 1,
			},
		},
		{
			institutionId: 'penn',
			institutionLocationId: 'hup',
			name: 'Hospital of the University of Pennsylvania (HUP)',
			institutionLocationGroup: {
				institutionLocationGroupId: 'uphs-group-id',
				name: 'University of Pennsylvania Health System (UPHS)',
				displayOrder: 1,
			},
		},
		{
			institutionId: 'penn',
			institutionLocationId: 'psom',
			name: 'Perelman School of Medicine',
			institutionLocationGroup: {
				institutionLocationGroupId: 'upenn-group-id',
				name: 'University of Pennsylvania (UPenn)',
				displayOrder: 2,
			},
		},
	]);

	const uphsGroup = screen.getByRole('group', {
		name: 'University of Pennsylvania Health System (UPHS)',
	});
	const upennGroup = screen.getByRole('group', { name: 'University of Pennsylvania (UPenn)' });

	expect(within(uphsGroup).getAllByRole('option')).toHaveLength(2);
	expect(within(upennGroup).getByRole('option', { name: 'Perelman School of Medicine' })).toHaveValue('psom');
	expect(screen.getAllByRole('option').map((option) => option.getAttribute('value'))).toEqual(['pah', 'hup', 'psom']);
});

it('keeps locations without a group as ordinary select options', () => {
	renderOptions([
		{
			institutionId: 'existing-institution',
			institutionLocationId: 'existing-location',
			name: 'Existing Employer',
		},
	]);

	expect(screen.queryByRole('group')).not.toBeInTheDocument();
	expect(screen.getByRole('option', { name: 'Existing Employer' })).toHaveValue('existing-location');
});

it('does not merge distinct group IDs that share a display label', () => {
	renderOptions([
		{
			institutionId: 'example-institution',
			institutionLocationId: 'location-a',
			name: 'Location A',
			institutionLocationGroup: {
				institutionLocationGroupId: 'group-a',
				name: 'Shared Employer Label',
				displayOrder: 1,
			},
		},
		{
			institutionId: 'example-institution',
			institutionLocationId: 'location-b',
			name: 'Location B',
			institutionLocationGroup: {
				institutionLocationGroupId: 'group-b',
				name: 'Shared Employer Label',
				displayOrder: 2,
			},
		},
	]);

	expect(screen.getAllByRole('group', { name: 'Shared Employer Label' })).toHaveLength(2);
});
