import React, { useMemo } from 'react';

import { InstitutionLocation } from '@/lib/models';

interface InstitutionLocationSelectOptionsProps {
	institutionLocations: InstitutionLocation[];
}

type InstitutionLocationSelectEntry =
	| {
			type: 'group';
			groupName: string;
			institutionLocations: InstitutionLocation[];
	  }
	| {
			type: 'location';
			institutionLocation: InstitutionLocation;
	  };

const buildInstitutionLocationSelectEntries = (institutionLocations: InstitutionLocation[]) => {
	const entries: InstitutionLocationSelectEntry[] = [];
	const entriesByGroupName = new Map<string, Extract<InstitutionLocationSelectEntry, { type: 'group' }>>();

	institutionLocations.forEach((institutionLocation) => {
		const groupName = institutionLocation.groupName?.trim();

		if (!groupName) {
			entries.push({ type: 'location', institutionLocation });
			return;
		}

		const existingEntry = entriesByGroupName.get(groupName);
		if (existingEntry) {
			existingEntry.institutionLocations.push(institutionLocation);
			return;
		}

		const entry: Extract<InstitutionLocationSelectEntry, { type: 'group' }> = {
			type: 'group',
			groupName,
			institutionLocations: [institutionLocation],
		};
		entriesByGroupName.set(groupName, entry);
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
					<optgroup key={`group--${entry.groupName}`} label={entry.groupName}>
						{entry.institutionLocations.map(renderInstitutionLocationOption)}
					</optgroup>
				);
			})}
		</>
	);
};

export default InstitutionLocationSelectOptions;
