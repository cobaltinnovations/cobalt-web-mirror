import React from 'react';
import { pagesService } from '@/lib/services';
import { useLoaderData } from 'react-router-dom';
import { PagePreview } from '@/components/admin/pages';

export const loader = async () => {
	const { page } = await pagesService.getPublicPage('about').fetch();
	return { page };
};

export const Component = () => {
	const { page } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	return <PagePreview page={page} enableAnalytics={true} />;
};
