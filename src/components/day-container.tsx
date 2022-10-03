import React, { FC, PropsWithChildren } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import mediaQueries from '@/jss/media-queries';
import { createUseThemedStyles } from '@/jss/theme';

const useDayContainerStyles = createUseThemedStyles((theme) => ({
	dayContainer: {
		backgroundColor: 'transparent',
		[mediaQueries.md]: {
			backgroundColor: theme.colors.n0,
		},
	},
	dayContainerInner: {
		[mediaQueries.md]: {
			paddingTop: 5,
			paddingBottom: 5,
		},
	},
}));

interface DayContainerProps extends PropsWithChildren {
	className?: string;
}

const DayContainer: FC<DayContainerProps> = (props) => {
	const classes = useDayContainerStyles();

	return (
		<Container fluid className={classNames(props.className, classes.dayContainer)}>
			<Container className={classes.dayContainerInner}>
				<Row>
					<Col>{props.children}</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default DayContainer;
