import React, { useState } from 'react';
import { PageSectionModel } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme/create-use-themed-styles';
import { Button } from 'react-bootstrap';

const PAGE_SECTION_SHELF_HEADER_HEIGHT = 57;

const useStyles = createUseThemedStyles((theme) => ({
	header: {
		display: 'flex',
		padding: '0 24px',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: PAGE_SECTION_SHELF_HEADER_HEIGHT,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	body: {
		padding: 24,
		overflowY: 'auto',
		height: `calc(100% - ${PAGE_SECTION_SHELF_HEADER_HEIGHT}px)`,
	},
}));

interface SectionShelfProps {
	pageSection: PageSectionModel;
	onClose(): void;
	onDelete(): void;
}

enum PAGE_STATES {}

export const PageSectionShelf = ({ pageSection, onDelete, onClose }: SectionShelfProps) => {
	const classes = useStyles();
	const [pageState, setPageState] = useState();

	return (
		<>
			<div className={classes.header}>
				<div>
					<h5 className="mb-0">{pageSection.name}</h5>
					<span className="small text-gray">{pageSection.pageSectionId}</span>
				</div>
				<div className="d-flex align-items-center justify-end">
					<Button className="me-2" variant="danger" onClick={onDelete}>
						Delete
					</Button>
					<Button onClick={onClose}>Close</Button>
				</div>
			</div>
			<div className={classes.body}>
				<Button>Add Row</Button>
			</div>
		</>
	);
};
