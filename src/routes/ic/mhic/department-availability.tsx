import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from '@/components/helmet';

import InputHelperSearch from '@/components/input-helper-search';
import { integratedCareService } from '@/lib/services';
import { useLoaderData } from 'react-router-dom';
import classNames from 'classnames';
import { DepartmentAvailabilityStatusId, EpicDepartmentModel } from '@/lib/models';
import useDebouncedState from '@/hooks/use-debounced-state';
import { MhicDepartmentAvailabilityStatusModal } from '@/components/integrated-care/mhic';
import { cloneDeep } from 'lodash';
import NoData from '@/components/no-data';
import useAccount from '@/hooks/use-account';

export const loader = async () => {
	const { epicDepartments } = await integratedCareService.getEpicDepartments().fetch();

	return {
		epicDepartmentsResponse: epicDepartments,
	};
};

export const Component = () => {
	const { epicDepartmentsResponse } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
	const [epicDepartments, setEpicDepartments] = useState(epicDepartmentsResponse);
	const { institution } = useAccount();

	const [searchInputValue, setSearchInputValue] = useState('');
	const [debouncedSearchQuery] = useDebouncedState(searchInputValue);
	const [epicDepartmentsToDisplay, setEpicDepartmentsToDisplay] = useState<EpicDepartmentModel[]>([]);

	const [epicDepartmentToUpdate, setEpicDepartmentToUpdate] = useState<EpicDepartmentModel>();
	const [showModal, setShowModal] = useState(false);

	useEffect(() => {
		const tokens = debouncedSearchQuery
			.split(' ')
			.map((token) => token.toLowerCase())
			.filter((v) => v);
		const epicDepartmentMatches = tokens
			.map((token) => {
				return epicDepartments.filter((ed) => {
					return ed.name.toLowerCase().includes(token) || ed.departmentId.toLowerCase().includes(token);
				});
			})
			.flat();

		setEpicDepartmentsToDisplay(debouncedSearchQuery ? epicDepartmentMatches : epicDepartments);
	}, [epicDepartments, debouncedSearchQuery]);

	const handleOnSearchClear = useCallback(() => {
		setSearchInputValue('');
	}, []);

	const handleChangeStatusButtonClick = useCallback(
		(epicDepartmentId: string) => {
			const epicDeparment = epicDepartments.find((ed) => ed.epicDepartmentId === epicDepartmentId);

			if (epicDeparment) {
				setEpicDepartmentToUpdate(epicDeparment);
				setShowModal(true);
			}
		},
		[epicDepartments]
	);

	const handleAvailabilityStatusModalOnSave = useCallback(
		(updatedEpicDepartment: EpicDepartmentModel) => {
			const epicDeparmentsClone = cloneDeep(epicDepartments);
			const indexToReplace = epicDeparmentsClone.findIndex(
				(ed) => ed.epicDepartmentId === updatedEpicDepartment.epicDepartmentId
			);

			if (indexToReplace > -1) {
				epicDeparmentsClone[indexToReplace] = updatedEpicDepartment;
				setEpicDepartments(epicDeparmentsClone);
			}

			setShowModal(false);
		},
		[epicDepartments]
	);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Integrated Care - Department Availability</title>
			</Helmet>

			{epicDepartmentToUpdate && (
				<MhicDepartmentAvailabilityStatusModal
					show={showModal}
					onHide={() => {
						setShowModal(false);
					}}
					epicDepartmentId={epicDepartmentToUpdate.epicDepartmentId}
					departmentAvailabilityStatusId={epicDepartmentToUpdate.departmentAvailabilityStatusId}
					onSave={handleAvailabilityStatusModalOnSave}
				/>
			)}

			<Container className="py-16">
				<Row className="mb-8">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
						<h2 className="mb-6">Admin Settings</h2>
						<hr className="mb-0" />
					</Col>
				</Row>
				<Row className="mb-4">
					<Col
						md={{ span: 10, offset: 1 }}
						lg={{ span: 8, offset: 2 }}
						xl={{ span: 4, offset: 2 }}
						className="mb-4 mb-xl-0"
					>
						<h3>Department Availability</h3>
						<p className="mb-0 text-n500">Manage the BHS availability for each department</p>
					</Col>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 4, offset: 0 }}>
						<InputHelperSearch
							placeholder="Search"
							value={searchInputValue}
							onChange={({ currentTarget }) => {
								setSearchInputValue(currentTarget.value);
							}}
							onClear={handleOnSearchClear}
						/>
					</Col>
				</Row>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 8, offset: 2 }}>
						{epicDepartmentsToDisplay.length <= 0 ? (
							<NoData
								title={`No Results For "${searchInputValue}"`}
								actions={[
									{
										variant: 'primary',
										title: 'Clear Search',
										onClick: () => {
											setSearchInputValue('');
										},
									},
								]}
							/>
						) : (
							<ul className="m-0 p-0">
								{epicDepartmentsToDisplay.map((epicDepartment, epicDepartmentIndex) => {
									const isLast = epicDepartmentIndex === epicDepartments.length - 1;
									return (
										<li
											key={epicDepartment.epicDepartmentId}
											className={classNames(
												'py-2 d-flex align-items-center justify-content-between',
												{
													'border-bottom': !isLast,
												}
											)}
										>
											<h5 className="mb-0 fw-normal">
												{epicDepartment.name} ({epicDepartment.departmentId})
											</h5>
											<div className="d-flex align-items-center">
												{epicDepartment.departmentAvailabilityStatusId ===
													DepartmentAvailabilityStatusId.AVAILABLE && (
													<Badge pill bg="outline-success">
														Available
													</Badge>
												)}
												{epicDepartment.departmentAvailabilityStatusId ===
													DepartmentAvailabilityStatusId.BUSY && (
													<Badge pill bg="outline-warning">
														Busy
													</Badge>
												)}
												{epicDepartment.departmentAvailabilityStatusId ===
													DepartmentAvailabilityStatusId.UNAVAILABLE && (
													<Badge pill bg="outline-danger">
														Unavailable
													</Badge>
												)}

												<Button
													variant="link"
													className="fw-normal fs-small"
													onClick={() => {
														handleChangeStatusButtonClick(epicDepartment.epicDepartmentId);
													}}
												>
													Change Status
												</Button>
											</div>
										</li>
									);
								})}
							</ul>
						)}
					</Col>
				</Row>
			</Container>
		</>
	);
};
