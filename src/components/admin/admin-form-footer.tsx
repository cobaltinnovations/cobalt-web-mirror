import { createUseThemedStyles } from '@/jss/theme';
import React, { ReactNode } from 'react';
import { Button, Container } from 'react-bootstrap';

const useStyles = createUseThemedStyles((theme) => ({
	formFooter: {
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1,
		padding: '20px 0',
		position: 'fixed',
		textAlign: 'center',
		backgroundColor: theme.colors.n0,
		borderTop: `1px solid ${theme.colors.border}`,
	},
}));

interface AdminFormFooterProps {
	exitButtonType: 'button' | 'submit';
	onExit: () => void;
	exitLabel: ReactNode;
	nextButtonType: 'button' | 'submit';
	onNext: () => void;
	nextLabel: ReactNode;
	nextVariant?: 'primary' | 'outline-primary';
	extraAction?: ReactNode;
}

export const AdminFormFooter = ({
	exitButtonType,
	onExit,
	exitLabel,
	extraAction,
	nextButtonType,
	onNext,
	nextLabel,
	nextVariant = 'primary',
}: AdminFormFooterProps) => {
	const classes = useStyles();

	return (
		<div className={classes.formFooter}>
			<Container>
				<div className="d-flex justify-content-between">
					<div>
						<Button
							variant="outline-primary"
							type={exitButtonType}
							value="exit"
							onClick={() => {
								onExit();
							}}
						>
							{exitLabel}
						</Button>

						{extraAction}
					</div>

					<Button
						variant={nextVariant}
						type={nextButtonType}
						onClick={() => {
							onNext();
						}}
					>
						{nextLabel}
					</Button>
				</div>
			</Container>
		</div>
	);
};
