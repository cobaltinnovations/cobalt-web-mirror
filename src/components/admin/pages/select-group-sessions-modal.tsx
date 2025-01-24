import React, { useCallback, useRef, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseThemedStyles } from '@/jss/theme';
import InputHelperSearch from '@/components/input-helper-search';
import { groupSessionsService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { GroupSessionModel } from '@/lib/models';
import { AddOrRemoveValueFromArray } from '@/lib/utils/form-utils';

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
	resourceItem: {
		display: 'flex',
		padding: '4px 24px',
		alignItems: 'center',
		borderBottom: `1px solid ${theme.colors.border}`,
		'&:last-of-type': {
			borderBottom: 0,
		},
	},
	imagePreview: {
		width: 96,
		height: 54,
		flexShrink: 0,
		marginRight: 16,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		backgroundColor: theme.colors.n100,
	},
}));

interface SelectGroupSessionsModalProps extends ModalProps {
	groupSessionIds: string[];
	onAdd(groupSessionIds: string[]): void;
}

export const SelectGroupSessionsModal = ({ groupSessionIds, onAdd, ...props }: SelectGroupSessionsModalProps) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [groupSessions, setGroupSessions] = useState<GroupSessionModel[]>([]);
	const [selectedGroupSessionIds, setSelectedGroupSessionIds] = useState<string[]>([]);
	const [searchInputValue, setSearchInputValue] = useState('');

	const fetchData = useCallback(
		async (searchQuery: string) => {
			try {
				const response = await groupSessionsService.getGroupSessions({ pageSize: 5000, searchQuery }).fetch();
				setGroupSessions(response.groupSessions);
			} catch (error) {
				handleError(error);
			}
		},
		[handleError]
	);

	const handleOnEnter = async () => {
		setGroupSessions([]);
		setSelectedGroupSessionIds(groupSessionIds);
		setSearchInputValue('');
		fetchData('');
	};

	const handleOnEntered = () => {
		searchInputRef.current?.focus();
	};

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		fetchData(searchInputValue);
	};

	const handleSearchFormClear = () => {
		setSearchInputValue('');
		fetchData('');
	};

	return (
		<Modal dialogClassName={classes.modal} centered onEnter={handleOnEnter} onEntered={handleOnEntered} {...props}>
			<Modal.Header closeButton>
				<Modal.Title>Select group sessions</Modal.Title>
			</Modal.Header>
			<Modal.Body className="p-0">
				<div className={classes.subHeader}>
					<div className={classes.resourceHeaderCol}>
						<Form className={classes.searchInput} onSubmit={handleSearchFormSubmit}>
							<InputHelperSearch
								ref={searchInputRef}
								className={classes.searchInput}
								value={searchInputValue}
								onChange={({ currentTarget }) => {
									setSearchInputValue(currentTarget.value);
								}}
								onClear={handleSearchFormClear}
							/>
						</Form>
					</div>
					<div className={classes.addedHeaderCol}>
						<span className="fw-bold">Group sessions to add ({selectedGroupSessionIds.length})</span>
					</div>
				</div>
				<div className={classes.bodyInner}>
					<div className={classes.resourcesCol}>
						<ul className="list-unstyled m-0">
							{groupSessions.map((gs) => (
								<li key={gs.groupSessionId} className={classes.resourceItem}>
									<Form.Check
										type="checkbox"
										name="resources"
										id={`resource--${gs.groupSessionId}`}
										label=""
										value={gs.groupSessionId}
										checked={selectedGroupSessionIds.includes(gs.groupSessionId)}
										onChange={({ currentTarget }) => {
											setSelectedGroupSessionIds(
												AddOrRemoveValueFromArray(currentTarget.value, selectedGroupSessionIds)
											);
										}}
									/>
									<div
										className={classes.imagePreview}
										style={{ backgroundImage: `url(${gs.imageUrl})` }}
									/>
									<div className="overflow-hidden">
										<span className="d-block text-truncate">{gs.title}</span>
										<span className="d-block text-truncate">{gs.facilitatorName}</span>
									</div>
								</li>
							))}
						</ul>
					</div>
					<div className={classes.addedCol}>
						<ul>
							{selectedGroupSessionIds.map((gsid) => {
								const groupSession = groupSessions.find((gs) => gs.groupSessionId === gsid);
								return <li key={gsid}>{groupSession?.title}</li>;
							})}
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
							onAdd(selectedGroupSessionIds);
						}}
					>
						Add Group Sessions
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};
