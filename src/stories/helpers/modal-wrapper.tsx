import React, { useState } from 'react';
import { ReactNode } from 'react';
import { Button } from 'react-bootstrap';

export const ModalStoryWrapper = ({
	children,
}: {
	children: (showingState: [boolean, React.Dispatch<React.SetStateAction<boolean>>]) => ReactNode;
}) => {
	const modalShowingState = useState(false);

	return (
		<>
			<Button
				onClick={() => {
					modalShowingState[1]((curr) => !curr);
				}}
			>
				Show Modal
			</Button>

			{children(modalShowingState)}
		</>
	);
};
