import React, { useEffect, useState } from 'react';
import InputHelper from '@/components/input-helper';
import useHandleError from '@/hooks/use-handle-error';
import { PAGE_LOCATION_ID, PageLocationModel } from '@/lib/models/pages-models';
import { pagesService } from '@/lib/services/pages-service';

interface PageLocationSelectProps {
	value: PAGE_LOCATION_ID;
	description?: string;
	onChange(value: PAGE_LOCATION_ID): void;
	enabled?: boolean;
	className?: string;
}

export const PageLocationSelect = ({
	value,
	description,
	onChange,
	enabled = true,
	className,
}: PageLocationSelectProps) => {
	const handleError = useHandleError();
	const [pageLocations, setPageLocations] = useState<PageLocationModel[]>([]);
	const [hasLoadError, setHasLoadError] = useState(false);

	useEffect(() => {
		if (!enabled) return;
		setHasLoadError(false);
		const request = pagesService.getPageLocations();
		let active = true;
		request
			.fetch()
			.then(({ pageLocations }) => {
				if (active) setPageLocations(pageLocations);
			})
			.catch((error) => {
				if (active) {
					setHasLoadError(true);
					handleError(error);
				}
			});
		return () => {
			active = false;
			request.abort();
		};
	}, [enabled, handleError]);

	return (
		<InputHelper
			as="select"
			label="Location"
			helperText="Where the page will live on Cobalt"
			className={className}
			value={value}
			disabled={pageLocations.length === 0}
			onChange={({ currentTarget }) => onChange(currentTarget.value as PAGE_LOCATION_ID)}
		>
			{pageLocations.length === 0 && (
				<option value={value}>
					{description ?? (hasLoadError ? 'Unable to load locations' : 'Loading locations...')}
				</option>
			)}
			{pageLocations.map((location) => (
				<option key={location.pageLocationId} value={location.pageLocationId}>
					{location.description}
				</option>
			))}
		</InputHelper>
	);
};
