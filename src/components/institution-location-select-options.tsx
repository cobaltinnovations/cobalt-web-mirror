import React, { useMemo } from 'react';

import { InstitutionLocation } from '@/lib/models';

interface InstitutionLocationSelectOptionsProps {
	institutionLocations: InstitutionLocation[];
}

export type InstitutionLocationSelectEntry =
	| {
			type: 'group';
			institutionLocationGroupId: string;
			groupLabel: string;
			institutionLocations: InstitutionLocation[];
	  }
	| {
			type: 'location';
			institutionLocation: InstitutionLocation;
	  };

export const buildInstitutionLocationSelectEntries = (institutionLocations: InstitutionLocation[]) => {
	const entries: InstitutionLocationSelectEntry[] = [];
	const entriesByGroupId = new Map<string, Extract<InstitutionLocationSelectEntry, { type: 'group' }>>();

	institutionLocations.forEach((institutionLocation) => {
		const institutionLocationGroup = institutionLocation.institutionLocationGroup;

		if (!institutionLocationGroup) {
			entries.push({ type: 'location', institutionLocation });
			return;
		}

		const existingEntry = entriesByGroupId.get(institutionLocationGroup.institutionLocationGroupId);
		if (existingEntry) {
			existingEntry.institutionLocations.push(institutionLocation);
			return;
		}

		const entry: Extract<InstitutionLocationSelectEntry, { type: 'group' }> = {
			type: 'group',
			institutionLocationGroupId: institutionLocationGroup.institutionLocationGroupId,
			groupLabel: institutionLocationGroup.name,
			institutionLocations: [institutionLocation],
		};
		entriesByGroupId.set(institutionLocationGroup.institutionLocationGroupId, entry);
		entries.push(entry);
	});

	return entries;
};

const renderInstitutionLocationOption = (institutionLocation: InstitutionLocation) => (
	<option key={institutionLocation.institutionLocationId} value={institutionLocation.institutionLocationId}>
		{institutionLocation.name}
	</option>
);

export const InstitutionLocationSelectOptions = ({ institutionLocations }: InstitutionLocationSelectOptionsProps) => {
	const entries = useMemo(() => buildInstitutionLocationSelectEntries(institutionLocations), [institutionLocations]);

	return (
		<>
			{entries.map((entry) => {
				if (entry.type === 'location') {
					return renderInstitutionLocationOption(entry.institutionLocation);
				}

				return (
					<optgroup key={`group--${entry.institutionLocationGroupId}`} label={entry.groupLabel}>
						{entry.institutionLocations.map(renderInstitutionLocationOption)}
					</optgroup>
				);
			})}
		</>
	);
};

export default InstitutionLocationSelectOptions;
