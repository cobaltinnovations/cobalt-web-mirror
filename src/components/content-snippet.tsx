import React, { FC } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import classNames from 'classnames';

import { ContentSnippet, ContentSnippetTableColumn, InstitutionReferrerSharedContent } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	modal: {
		maxWidth: 720,
	},
	modalHeader: {
		alignItems: 'center',
		backgroundColor: theme.colors.n50,
		borderBottom: `1px solid ${theme.colors.n100}`,
		padding: '16px 24px',
	},
	modalTitle: {
		...theme.fonts.bodyBold,
		color: theme.colors.n900,
		fontSize: 16,
		lineHeight: '24px',
		margin: 0,
	},
	modalBody: {
		padding: 24,
	},
	modalFooter: {
		backgroundColor: theme.colors.n0,
		borderTop: `1px solid ${theme.colors.n100}`,
		padding: '12px 16px',
	},
	tableWrap: {
		backgroundColor: theme.colors.n0,
		border: `1px solid ${theme.colors.n100}`,
		borderRadius: 4,
		overflowX: 'auto',
		width: '100%',
	},
	table: {
		borderCollapse: 'separate',
		borderSpacing: 0,
		minWidth: '100%',
	},
	tableHeaderCell: {
		...theme.fonts.bodyNormal,
		backgroundColor: theme.colors.n50,
		borderBottom: `1px solid ${theme.colors.n100}`,
		color: theme.colors.n900,
		fontSize: 16,
		fontWeight: theme.fonts.bodyNormal.fontWeight,
		lineHeight: '24px',
		padding: 12,
		textAlign: 'left',
		verticalAlign: 'top',
	},
	tableCell: {
		...theme.fonts.bodyNormal,
		borderBottom: `1px solid ${theme.colors.n100}`,
		color: theme.colors.n900,
		fontSize: 16,
		lineHeight: '24px',
		padding: 12,
		textAlign: 'left',
		verticalAlign: 'top',
	},
	lastRowCell: {
		borderBottom: 0,
	},
	rightAligned: {
		textAlign: 'right',
	},
	bodyHtml: {
		'& > :last-child': {
			marginBottom: 0,
		},
	},
}));

interface ContentSnippetViewProps {
	contentSnippet: ContentSnippet;
	className?: string;
}

interface ContentSnippetModalProps extends Pick<ModalProps, 'show' | 'onHide'> {
	contentSnippet: ContentSnippet | null;
}

const isRightAligned = (column: ContentSnippetTableColumn) => column.align === 'right';

export const contentSnippetFromLegacySharedContent = (
	contentSnippetKey: string,
	content: InstitutionReferrerSharedContent
): ContentSnippet | null => {
	if (content.type !== 'table') {
		return null;
	}

	return {
		contentSnippetKey,
		contentSnippetTypeId: 'TABLE',
		title: content.title,
		dismissButtonText: content.dismissText,
		content: {
			columns: content.columns,
			rows: content.rows,
		},
	};
};

export const ContentSnippetView: FC<ContentSnippetViewProps> = ({ className, contentSnippet }) => {
	const classes = useStyles();

	if (contentSnippet.contentSnippetTypeId === 'HTML') {
		if (!contentSnippet.bodyHtml) {
			return null;
		}

		return (
			<div
				className={classNames(classes.bodyHtml, className)}
				dangerouslySetInnerHTML={{ __html: contentSnippet.bodyHtml }}
			/>
		);
	}

	return (
		<div className={classNames(classes.tableWrap, className)}>
			<table className={classes.table}>
				<thead>
					<tr>
						{contentSnippet.content.columns.map((column) => (
							<th
								key={column.key}
								className={classNames(classes.tableHeaderCell, {
									[classes.rightAligned]: isRightAligned(column),
								})}
							>
								{column.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{contentSnippet.content.rows.map((row, rowIndex) => {
						const isLastRow = rowIndex === contentSnippet.content.rows.length - 1;

						return (
							<tr key={rowIndex}>
								{contentSnippet.content.columns.map((column) => (
									<td
										key={column.key}
										className={classNames(classes.tableCell, {
											[classes.lastRowCell]: isLastRow,
											[classes.rightAligned]: isRightAligned(column),
										})}
										dangerouslySetInnerHTML={{ __html: row[column.key] ?? '' }}
									/>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};

export const ContentSnippetModal: FC<ContentSnippetModalProps> = ({ contentSnippet, onHide, show }) => {
	const classes = useStyles();

	if (!contentSnippet) {
		return null;
	}

	return (
		<Modal centered dialogClassName={classes.modal} onHide={onHide} show={show}>
			{contentSnippet.title && (
				<Modal.Header className={classes.modalHeader} closeButton>
					<Modal.Title className={classes.modalTitle}>{contentSnippet.title}</Modal.Title>
				</Modal.Header>
			)}
			<Modal.Body className={classes.modalBody}>
				<ContentSnippetView contentSnippet={contentSnippet} />
			</Modal.Body>
			<Modal.Footer className={classes.modalFooter}>
				<Button onClick={onHide}>{contentSnippet.dismissButtonText ?? 'Done'}</Button>
			</Modal.Footer>
		</Modal>
	);
};
