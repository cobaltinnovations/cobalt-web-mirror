import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Dropdown, Row } from 'react-bootstrap';
import { CareResourceModel } from '@/lib/models';
import { careResourceService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import { MhicCareResourceFormModal, MhicPageHeader } from '@/components/integrated-care/mhic';
import { SORT_DIRECTION, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { ReactComponent as PlusIcon } from '@/assets/icons/icon-plus.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more-horiz.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/icon-delete.svg';
import NoData from '@/components/no-data';
import ConfirmDialog from '@/components/confirm-dialog';

export const loader = async () => {
	return null;
};

export const Component = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);
	const orderBy = useMemo(() => searchParams.get('orderBy') ?? '', [searchParams]);

	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [careResources, setCareResources] = useState<CareResourceModel[]>([]);
	const [careResourcesTotalCount, setCareResourcesTotalCount] = useState(0);
	const [showFormModal, setShowFormModal] = useState(false);
	const [careResourceToDelete, setCareResourceToDelete] = useState<CareResourceModel>();

	const fetchData = useCallback(async () => {
		try {
			setIsLoading(true);

			const response = await careResourceService
				.getCareResources({
					pageSize: '15',
					...(pageNumber && { pageNumber }),
					...(orderBy && { orderBy: orderBy as 'NAME_ASC' }),
				})
				.fetch();

			setCareResources(response.careResources);
			setCareResourcesTotalCount(response.totalCount);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [handleError, orderBy, pageNumber]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	const handleDeleteConfirm = useCallback(async () => {
		try {
			if (!careResourceToDelete) {
				throw new Error('careResourceToDelete is undefined.');
			}

			setIsLoading(true);
			await careResourceService.deleteCareResource(careResourceToDelete.careResourceId).fetch();
			setCareResourceToDelete(undefined);

			fetchData();
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	}, [careResourceToDelete, fetchData, handleError]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Integrated Care - Resources</title>
			</Helmet>

			<MhicCareResourceFormModal
				show={showFormModal}
				onHide={() => {
					setShowFormModal(false);
				}}
				onSave={() => {
					setShowFormModal(false);
					fetchData();
				}}
			/>

			<ConfirmDialog
				size="lg"
				show={!!careResourceToDelete}
				onHide={() => {
					setCareResourceToDelete(undefined);
				}}
				titleText={'Delete Care Resource'}
				bodyText={`Are you sure you want to delete ${careResourceToDelete?.name}?`}
				detailText={`There ${careResourceToDelete?.careResourceLocations.length === 1 ? 'is' : 'are'} ${
					careResourceToDelete?.careResourceLocations.length
				} location${
					careResourceToDelete?.careResourceLocations.length === 1 ? '' : 's'
				} associated this resource.`}
				dismissText="No"
				confirmText="Yes"
				onConfirm={handleDeleteConfirm}
			/>

			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<MhicPageHeader title="Resources">
							<Button
								className="me-2 d-flex align-items-center"
								variant="primary"
								onClick={() => {
									setShowFormModal(true);
								}}
							>
								<PlusIcon className="me-2" /> Add Resource
							</Button>
						</MhicPageHeader>
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
										sortDirection={orderBy.split('_')[1] as SORT_DIRECTION}
										onSort={(sortDirection) => {
											searchParams.set('pageNumber', '0');
											searchParams.set('orderBy', `NAME_${sortDirection}`);
											setSearchParams(searchParams, { replace: true });
										}}
									>
										Resource Name
									</TableCell>
									<TableCell header>Phone Number</TableCell>
									<TableCell header>Website</TableCell>
									<TableCell header className="text-right">
										Locations
									</TableCell>
									<TableCell />
								</TableRow>
							</TableHead>
							<TableBody>
								{!isLoading && careResources.length === 0 && (
									<TableRow>
										<TableCell colSpan={5}>
											<NoData className="bg-white border-0" title="No Resources" actions={[]} />
										</TableCell>
									</TableRow>
								)}
								{careResources.map((careResource) => (
									<TableRow key={careResource.careResourceId}>
										<TableCell>
											<Link
												to={`./${careResource.careResourceId}`}
												className="text-decoration-none"
											>
												{careResource.name}
											</Link>
										</TableCell>
										<TableCell>{careResource.formattedPhoneNumber ?? 'Not provided'}</TableCell>
										<TableCell>{careResource.websiteUrl ?? 'Not provided'}</TableCell>
										<TableCell className="text-right">
											{careResource.careResourceLocations.length}
										</TableCell>
										<TableCell className="flex-row align-items-center justify-content-end">
											<Dropdown>
												<Dropdown.Toggle
													as={DropdownToggle}
													id={`mhic-resources__dropdown-menu--${careResource.careResourceId}`}
													className="p-2 border-0"
												>
													<MoreIcon className="d-flex" />
												</Dropdown.Toggle>
												<Dropdown.Menu
													as={DropdownMenu}
													align="end"
													popperConfig={{ strategy: 'fixed' }}
													renderOnMount
												>
													<Dropdown.Item
														className="d-flex align-items-center"
														onClick={() => {
															setCareResourceToDelete(careResource);
														}}
													>
														<DeleteIcon className="me-2 text-n500" />
														Delete
													</Dropdown.Item>
												</Dropdown.Menu>
											</Dropdown>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Col>
				</Row>
				<Row>
					<Col>
						<div className="d-flex justify-content-center">
							<TablePagination
								total={careResourcesTotalCount}
								page={parseInt(pageNumber, 10)}
								size={15}
								onClick={(pageIndex) => {
									searchParams.set('pageNumber', String(pageIndex));
									setSearchParams(searchParams, { replace: true });
								}}
							/>
						</div>
					</Col>
				</Row>
			</Container>
		</>
	);
};
