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

export enum ADMIN_RESOURCE_FORM_FOOTER_SUBMIT_ACTION {
	DRAFT = 'DRAFT',
	PUBLISH = 'PUBLISH',
}

interface AdminResourceFormFooterProps {
	showDraftButton: boolean;
	draftButtonText: string;
	showPreviewButton: boolean;
	previewActionText: string;
	mainActionText: string;
	onCancel(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	onPreview(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
}

export const AdminResourceFormFooter = ({
	showDraftButton,
	draftButtonText,
	showPreviewButton,
	previewActionText,
	mainActionText,
	onCancel,
	onPreview,
}: AdminResourceFormFooterProps) => {
	const classes = useStyles();

	return (
		<div className={classes.formFooter}>
			<Container>
				<Row>
					<Col>
						<div className="d-flex justify-content-between">
							<div>
								<Button variant="outline-primary" className="me-2" onClick={onCancel}>
									Cancel
								</Button>
								{showDraftButton && (
									<Button
										variant="outline-primary"
										type="submit"
										value={ADMIN_RESOURCE_FORM_FOOTER_SUBMIT_ACTION.DRAFT}
									>
										{draftButtonText}
									</Button>
								)}
							</div>
							<div>
								{showPreviewButton && (
									<Button variant="outline-primary" className="me-2" onClick={onPreview}>
										{previewActionText}
									</Button>
								)}
								<Button
									variant="primary"
									type="submit"
									value={ADMIN_RESOURCE_FORM_FOOTER_SUBMIT_ACTION.PUBLISH}
								>
									{mainActionText}
								</Button>
							</div>
						</div>
					</Col>
				</Row>
			</Container>
		</div>
	);
};
