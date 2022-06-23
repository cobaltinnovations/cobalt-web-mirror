import React, {FC, PropsWithChildren} from 'react';
import {Button, Container} from 'react-bootstrap';
import {createUseStyles} from 'react-jss';
import {useHistory} from 'react-router-dom';
import colors from '@/jss/colors';

const useStyles = createUseStyles({
	sessionFormSubmitBanner: {
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1,
		padding: '20px 0',
		position: 'fixed',
		textAlign: 'center',
		backgroundColor: colors.white,
		borderTop: `1px solid ${colors.border}`,
	},
});

interface SessionFormSubmitBannerProps extends PropsWithChildren {
	title: string;
	disabled?: boolean
}

const SessionFormSubmitBanner: FC<SessionFormSubmitBannerProps> = ({title, disabled = false, children}) => {
	const classes = useStyles();
	const history = useHistory();

	return (
		<div className={classes.sessionFormSubmitBanner}>
			<Container>
				<div className="d-flex justify-content-between">
					<Button size="sm" variant="outline-primary" onClick={() => history.goBack()}>Cancel</Button>
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
