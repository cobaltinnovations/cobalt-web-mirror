import React from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';
import InputHelperSearch from '@/components/input-helper-search';
import MegaFilter, { Filter } from '@/components/mega-filter';

const useStyles = createUseThemedStyles((theme) => ({
	modal: {
		maxWidth: 960,
		'& .cobalt-modal__body': {
			display: 'flex',
			overflow: 'hidden',
			flexDirection: 'column',
		},
	},
	subHeader: {
		height: 72,
		flexShrink: 0,
		display: 'flex',
		backgroundColor: theme.colors.n0,
		borderBottom: `1px solid ${theme.colors.border}`,
	},
	resourceHeaderCol: {
		width: '60%',
		display: 'flex',
		padding: '0 16px',
		alignItems: 'center',
		borderRight: `1px solid ${theme.colors.border}`,
	},
	searchInput: {
		flex: 1,
		display: 'flex',
		marginRight: 16,
	},
	addedHeaderCol: {
		width: '40%',
		display: 'flex',
		padding: '0 16px',
		alignItems: 'center',
	},
	bodyInner: {
		flex: 1,
		display: 'flex',
		overflow: 'hidden',
	},
	resourcesCol: {
		width: '60%',
		overflowY: 'auto',
		borderRight: `1px solid ${theme.colors.border}`,
	},
	addedCol: {
		padding: 16,
		width: '40%',
		overflowY: 'auto',
		'& ul': {
			margin: 0,
			padding: 0,
			listStyle: 'none',
			'& li': {
				marginBottom: 16,
				'&:last-of-type': {
					marginBottom: 0,
				},
			},
		},
	},
}));

interface SelectResourcesModalProps extends ModalProps {
	onAdd(resources: void[]): void;
}

export const SelectResourcesModal = ({ onAdd, ...props }: SelectResourcesModalProps) => {
	const classes = useStyles();

	const handleOnEnter = () => {
		// TODO: reset form
	};

	const handleOnEntered = () => {
		// TODO: focus search input
	};

	return (
		<Modal dialogClassName={classes.modal} centered onEnter={handleOnEnter} onEntered={handleOnEntered} {...props}>
			<Modal.Header closeButton>
				<Modal.Title>Select resources</Modal.Title>
			</Modal.Header>
			<Modal.Body className="p-0">
				<div className={classes.subHeader}>
					<div className={classes.resourceHeaderCol}>
						<InputHelperSearch
							className={classes.searchInput}
							onClear={function (event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
								throw new Error('Function not implemented.');
							}}
						/>
						<MegaFilter
							className="flex-shrink-0"
							displayCount={false}
							displayFilterIcon
							buttonTitle="Filter"
							modalTitle="Filter"
							value={[]}
							onChange={function (value: Filter[]): void {
								throw new Error('Function not implemented.');
							}}
						/>
					</div>
					<div className={classes.addedHeaderCol}>
						<span className="fw-bold">Resources to add</span>
					</div>
				</div>
				<div className={classes.bodyInner}>
					<div className={classes.resourcesCol}>
						<ul>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
							<li>1</li>
						</ul>
					</div>
					<div className={classes.addedCol}>
						<ul>
							<li>Resource Title</li>
							<li>Resource Title</li>
							<li>Resource Title</li>
						</ul>
					</div>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button type="button" variant="outline-primary" onClick={props.onHide}>
						Cancel
					</Button>
					<Button
						type="button"
						className="ms-2"
						variant="primary"
						onClick={() => {
							onAdd([]);
						}}
					>
						Add Resources
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};
