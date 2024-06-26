import { createUseThemedStyles } from '@/jss/theme';
import React, { FC, PropsWithChildren } from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const useStyles = createUseThemedStyles((theme) => ({
	sessionFormSubmitBanner: {
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

interface SessionFormSubmitBannerProps extends PropsWithChildren {
	title: string;
	disabled?: boolean;
}

const SessionFormSubmitBanner: FC<SessionFormSubmitBannerProps> = ({ title, disabled = false, children }) => {
	const classes = useStyles();
	const navigate = useNavigate();

	return (
		<div className={classes.sessionFormSubmitBanner}>
			<Container>
				<div className="d-flex justify-content-between">
					<Button size="sm" variant="outline-primary" onClick={() => navigate(-1)}>
						Cancel
					</Button>
					<Button size="sm" type="submit" disabled={disabled}>
						{title}
					</Button>
				</div>
				<div>{children}</div>
			</Container>
		</div>
	);
};

export default SessionFormSubmitBanner;
