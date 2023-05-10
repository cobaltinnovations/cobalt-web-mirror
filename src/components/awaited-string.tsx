import React, { Suspense } from 'react';
import { Spinner } from 'react-bootstrap';
import { Await } from 'react-router-dom';

interface AwaitedStringProps {
	resolve: Promise<string>;
}

export const AwaitedString = ({ resolve }: AwaitedStringProps) => {
	return (
		<Suspense fallback={<Spinner as="span" animation="border" size="sm" />}>
			<Await resolve={resolve}>{(resolvedString: string) => resolvedString}</Await>
		</Suspense>
	);
};
