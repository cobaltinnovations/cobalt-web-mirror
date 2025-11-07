import React, { useState } from 'react';
import { mailingListsService } from '@/lib/services';
import { LoaderFunctionArgs, useLoaderData } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import LoadingButton from '@/components/loading-button';
import useHandleError from '@/hooks/use-handle-error';

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { mailingListEntryId } = params;

	if (!mailingListEntryId) {
		throw new Error('mailingListEntryId is undefined');
	}

	const { pages, mailingListEntry } = await mailingListsService.getEntries(mailingListEntryId).fetch();
	const firstPage = pages[0];
	const displayName = firstPage ? firstPage.headline ?? firstPage.name ?? 'Unsubscribe' : 'Unsubscribe';

	return { displayName, mailingListEntry };
};

export const Component = () => {
	const handleError = useHandleError();
	const { displayName, mailingListEntry } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const [isLoading, setIsLoading] = useState(false);
	const [hasSubmitted, setHasSubmitted] = useState(false);

	const handleUnsubscribeButtonClick = async () => {
		setIsLoading(true);

		try {
			await mailingListsService.unsubscribeFromMailingListEntry(mailingListEntry.mailingListEntryId).fetch();
			setHasSubmitted(true);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Container className="py-16">
			<Row>
				<Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
					{hasSubmitted ? (
						<>
							<h1 className="mb-6">Unsubscribe from {displayName}</h1>
							<p className="mb-6">{mailingListEntry.value} will no longer recieve updates.</p>
						</>
					) : (
						<>
							<h1 className="mb-6">Unsubscribe from {displayName}</h1>
							<p className="mb-6">Stop receiving updates sent to {mailingListEntry.value}.</p>
							<LoadingButton
								size="lg"
								className="d-block w-100 text-center"
								type="button"
								isLoading={isLoading}
								disabled={isLoading}
								onClick={handleUnsubscribeButtonClick}
							>
								Unsubscribe
							</LoadingButton>
						</>
					)}
				</Col>
			</Row>
		</Container>
	);
};
