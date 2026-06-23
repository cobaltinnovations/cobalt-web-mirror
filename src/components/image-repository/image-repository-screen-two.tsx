import React, { FC } from 'react';
import { Button } from 'react-bootstrap';

import { IMAGE_REPOSITORY_SCREEN_ID, ImageRepositoryScreenProps } from './image-repository.types';

const ImageRepositoryScreenTwo: FC<ImageRepositoryScreenProps> = ({ onNavigate }) => {
	return (
		<div>
			<p className="mb-2 text-uppercase text-muted">Active State: screenTwo</p>
			<h3 className="mb-2">Test Screen Two</h3>
			<p className="mb-4">This is the second placeholder screen in the image repository modal.</p>
			<div className="d-flex flex-wrap gap-2">
				<Button
					variant="outline-primary"
					onClick={() => {
						onNavigate(IMAGE_REPOSITORY_SCREEN_ID.SCREEN_ONE);
					}}
				>
					Go to Screen One
				</Button>
				<Button
					variant="outline-primary"
					onClick={() => {
						onNavigate(IMAGE_REPOSITORY_SCREEN_ID.SCREEN_THREE);
					}}
				>
					Go to Screen Three
				</Button>
			</div>
		</div>
	);
};

export default ImageRepositoryScreenTwo;
