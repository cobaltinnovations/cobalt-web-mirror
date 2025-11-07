import React, { useEffect } from 'react';
import { mailingListsService } from '@/lib/services';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { mailingListEntryId } = params;

	if (!mailingListEntryId) {
		throw new Error('mailingListEntryId is undefined');
	}

	const { pages, mailinglistEntry } = await mailingListsService.getEntries(mailingListEntryId).fetch();
	const firstPage = pages[0];
	const displayName = firstPage ? firstPage.headline ?? firstPage.name ?? 'Unsubscribe' : 'Unsubscribe';

	return { displayName, mailinglistEntry };
};

export const Component = () => {
	const { displayName, mailinglistEntry } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

	useEffect(() => {
		console.log('displayName', displayName);
	}, [displayName]);

	useEffect(() => {
		console.log('mailinglistEntry', mailinglistEntry);
	}, [mailinglistEntry]);

	return <h1>Unsubscribe</h1>;
};
