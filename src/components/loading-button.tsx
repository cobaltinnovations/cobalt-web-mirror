import React from 'react';

import { Button, ButtonProps, Spinner } from 'react-bootstrap';

interface LoadingButtonProps extends ButtonProps {
	isLoading: boolean;
}

const LoadingButton = ({ isLoading, disabled, children, ...buttonProps }: LoadingButtonProps) => {
	return (
		<Button {...buttonProps}>
			{isLoading ? <Spinner className="me-2" animation="border" size="sm" /> : children}
		</Button>
	);
};

export default LoadingButton;
