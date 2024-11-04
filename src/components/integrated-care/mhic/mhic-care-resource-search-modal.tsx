import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Button, ModalProps, Form, Row, Col } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import useHandleError from '@/hooks/use-handle-error';
import { MhicPageHeader } from './mhic-page-header';
import InputHelperSearch from '@/components/input-helper-search';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/table';
import { CareResourceLocationModel } from '@/lib/models';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { Link } from 'react-router-dom';

const useStyles = createUseStyles({
	modal: {
		maxWidth: '90%',
	},
});

export const MhicCareResourceSearchModal: FC<ModalProps> = ({ ...props }) => {
	const classes = useStyles();
	const handleError = useHandleError();

	const [isLoading] = useState(false);
	const [careResourceLocations] = useState<CareResourceLocationModel[]>([]);
	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState('');

	const handleOnEnter = useCallback(() => {
		console.log('Enter', handleError);
	}, [handleError]);

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		// searchParams.delete('pageNumber');
		// searchParams.delete('sortBy');
		// searchParams.delete('sortDirection');

		if (searchInputValue) {
			// searchParams.set('searchQuery', searchInputValue);
		} else {
			// searchParams.delete('searchQuery');
		}

		// setSearchParams(searchParams, { replace: true });

		if (hasTouchScreen) {
			searchInputRef.current?.blur();
		}
	};

	const clearSearch = useCallback(() => {
		setSearchInputValue('');

		// searchParams.delete('pageNumber');
		// searchParams.delete('sortBy');
		// searchParams.delete('sortDirection');
		// searchParams.delete('searchQuery');

		// setSearchParams(searchParams, { replace: true });

		if (!hasTouchScreen) {
			searchInputRef.current?.focus();
		}
	}, [hasTouchScreen]);

	const handleKeydown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== 'Escape') {
				return;
			}

			clearSearch();
		},
		[clearSearch]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeydown, false);

		return () => {
			document.removeEventListener('keydown', handleKeydown, false);
		};
	}, [handleKeydown]);

	return (
		<Modal {...props} dialogClassName={classes.modal} centered onEnter={handleOnEnter}>
			<Modal.Header closeButton>
				<Modal.Title>Available Resources</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Row className="mb-6">
					<Col>
						<MhicPageHeader title="Available Resources">
							<Form onSubmit={handleSearchFormSubmit}>
								<InputHelperSearch
									ref={searchInputRef}
									placeholder="Search name"
									value={searchInputValue}
									onChange={({ currentTarget }) => {
										setSearchInputValue(currentTarget.value);
									}}
									onClear={clearSearch}
								/>
							</Form>
						</MhicPageHeader>
					</Col>
				</Row>
				<Row className="mb-8">
					<Col>
						<hr />
					</Col>
				</Row>
				<Row className="mb-8">
					<Col>
						<Table isLoading={isLoading}>
							<TableHead>
								<TableRow>
									<TableCell
										className="flex-row align-items-center justify-content-start"
										header
										sortable
										// sortDirection={orderBy.split('_')[1] as SORT_DIRECTION}
										// onSort={(sortDirection) => {
										// 	searchParams.set('pageNumber', '0');
										// 	searchParams.set('orderBy', `NAME_${sortDirection}`);
										// 	setSearchParams(searchParams, { replace: true });
										// }}
									>
										Resource Name
									</TableCell>
									<TableCell header>Insurance</TableCell>
									<TableCell header>Specialties</TableCell>
									<TableCell header>Distance from zip</TableCell>
									<TableCell></TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{careResourceLocations.map((careResourceLocation) => (
									<TableRow key={careResourceLocation.careResourceLocationId}>
										<TableCell>
											<Link to="/#">{careResourceLocation.name}</Link>
										</TableCell>
										<TableCell>
											{careResourceLocation.payors.map((p) => p.name).join(', ')}
										</TableCell>
										<TableCell>
											{careResourceLocation.specialties.map((p) => p.name).join(', ')}
										</TableCell>
										<TableCell className="flex-row align-items-center justify-content-start">
											5 miles
										</TableCell>
										<TableCell className="flex-row align-items-center justify-content-end">
											<Button variant="outline-primary" className="p-2 me-2">
												Add
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Col>
				</Row>
			</Modal.Body>
		</Modal>
	);
};
