import React from 'react';
import { LoaderFunctionArgs, useLoaderData, useLocation, useNavigate } from 'react-router-dom';
import { MhicCareResourceLocationDetails } from '@/components/integrated-care/mhic';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { careResourceLocationId } = params;
	return { careResourceLocationId };
};

export const Component = () => {
	const { careResourceLocationId } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<MhicCareResourceLocationDetails
			careResourceLocationId={careResourceLocationId ?? ''}
			onClose={() => {
				navigate({
					pathname: '..',
					search: location.search,
				});
			}}
		/>
	);
};
