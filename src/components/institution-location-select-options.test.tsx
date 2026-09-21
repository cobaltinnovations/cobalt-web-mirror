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

it('groups employer locations by their API-provided group name', () => {
	renderOptions([
		{
			institutionId: 'penn',
			institutionLocationId: 'pah',
			name: 'Pennsylvania Hospital (PAH)',
			groupName: 'University of Pennsylvania Health System (UPHS)',
		},
		{
			institutionId: 'penn',
			institutionLocationId: 'hup',
			name: 'Hospital of the University of Pennsylvania (HUP)',
			groupName: 'University of Pennsylvania Health System (UPHS)',
		},
		{
			institutionId: 'penn',
			institutionLocationId: 'psom',
			name: 'Perelman School of Medicine',
			groupName: 'University of Pennsylvania (UPenn)',
		},
	]);

	const uphsGroup = screen.getByRole('group', {
		name: 'University of Pennsylvania Health System (UPHS)',
	});
	const upennGroup = screen.getByRole('group', { name: 'University of Pennsylvania (UPenn)' });

	expect(within(uphsGroup).getAllByRole('option')).toHaveLength(2);
	expect(within(upennGroup).getByRole('option', { name: 'Perelman School of Medicine' })).toHaveValue('psom');
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
