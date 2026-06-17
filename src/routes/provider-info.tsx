import ProviderInfoDetail from '@/components/provider-info-detail';
import React from 'react';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

export const loader = ({ params }: LoaderFunctionArgs) => {
	return {
		providerId: params.providerId,
		clinicId: params.clinicId,
	};
};

export const Component = () => {
	const { providerId, clinicId } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	return <ProviderInfoDetail providerId={providerId} clinicId={clinicId} />;
};
