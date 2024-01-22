import React from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import classNames from 'classnames';

import Loader from '@/components/loader';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles({
	loader: {
		top: '50%',
		left: '50%',
		position: 'absolute',
		transform: 'translate(-50%, -50%)',
	},
	children: ({ isLoading }: { isLoading?: boolean }) => ({
		opacity: isLoading ? 0 : 1,
	}),
});

interface LoadingButtonProps extends ButtonProps {
	isLoading?: boolean;
}

const LoadingButton = ({ isLoading, disabled, onClick, children, className, ...buttonProps }: LoadingButtonProps) => {
	const classes = useStyles({ isLoading });

	return (
		<Button
			className={classNames('position-relative', className)}
			onClick={(event) => {
				if (isLoading) {
					event.preventDefault();
					return;
				}

				if (onClick) {
					onClick(event);
				}
			}}
			{...buttonProps}
		>
			{isLoading && <Loader className={classes.loader} size={24} />}
			<span className={classes.children}>{children}</span>
		</Button>
	);
};

export default LoadingButton;
