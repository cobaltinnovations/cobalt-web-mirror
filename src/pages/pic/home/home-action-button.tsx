import React, { FC, ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface ButtonLinkProps {
	icon: ReactElement;
	destination: string;
}

const HomeButtonLink: FC<ButtonLinkProps> = ({ icon, destination, children }) => {
	const iconWithProps = React.cloneElement(icon, { className: 'mr-2' });
	return (
		<Link className="text-decoration-none" to={destination}>
			<Button className={'mx-auto w-80 d-flex align-items-center justify-content-center'} data-cy={'take-screening'}>
				{iconWithProps}
				{children}
			</Button>
		</Link>
	);
};

export { HomeButtonLink };
