import React from 'react';
import { pagesService } from '@/lib/services';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { PagePreview } from '@/components/admin/pages';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { urlName } = params;

	if (!urlName) {
		throw new Error('urlName is undefined.');
	}

	const { page } = await pagesService.getPage(urlName).fetch();
	return { page };
};

export const Component = () => {
	const { page } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	return <PagePreview page={page} />;
};
