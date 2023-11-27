import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	formFooter: {
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 2,
		padding: '24px 0',
		position: 'fixed',
		textAlign: 'center',
		backgroundColor: theme.colors.n0,
		borderTop: `1px solid ${theme.colors.border}`,
	},
}));

interface AdminResourceFormFooterExternalProps {
	onAdd(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const AdminResourceFormFooterExternal = ({ onAdd }: AdminResourceFormFooterExternalProps) => {
	const classes = useStyles();

	return (
		<div className={classes.formFooter}>
			<Container>
				<Row>
					<Col>
						<div className="d-flex justify-content-between">
							<div></div>
							<div>
								<Button variant="primary" onClick={onAdd}>
									Add Resource
								</Button>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
};
