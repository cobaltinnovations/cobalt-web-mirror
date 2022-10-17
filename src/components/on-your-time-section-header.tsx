import React, { PropsWithChildren } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	containerOuter: {
		backgroundColor: 'transparent',
		[mediaQueries.md]: {
			backgroundColor: theme.colors.n0,
		},
	},
	container: {
		[mediaQueries.md]: {
			paddingTop: 5,
			paddingBottom: 5,
		},
	},
}));

interface Props {
	className?: string;
}

const OnYourTimeSectionHeader = ({ className, children }: PropsWithChildren<Props>) => {
	const classes = useStyles();

	return (
		<Container fluid className={classNames(className, classes.containerOuter)}>
			<Container className={classes.container}>
				<Row>
					<Col>{children}</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default OnYourTimeSectionHeader;
