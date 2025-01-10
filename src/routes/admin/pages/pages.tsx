import React, { Suspense, useMemo, useState } from 'react';
import { Await, defer, useRouteLoaderData, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from '@/components/table';

interface AdminPagesLoaderData {
	pagesPromise: Promise<[]>;
}

export function useAdminGroupSessionsLoaderData() {
	return useRouteLoaderData('admin-pages') as AdminPagesLoaderData;
}

export async function loader() {
	const pagesPromise = new Promise((resolve) => {
		resolve({ pages: [] });
	});

	return defer({
		pagesPromise,
	});
}

export const Component = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const pageNumber = useMemo(() => searchParams.get('pageNumber') ?? '0', [searchParams]);

	const { pagesPromise } = useAdminGroupSessionsLoaderData();
	const [isLoading, setIsLoading] = useState(false);
	const [pages, setPages] = useState<void[]>([]);
	const [pagesTotalCount, setPagesTotalCoount] = useState(0);
	const [pagesTotalCountDescription, setPagesTotalCountDescription] = useState('0');

	const handlePaginationClick = (pageIndex: number) => {
		searchParams.set('pageNumber', String(pageIndex));
		setSearchParams(searchParams);
	};

	return (
		<>
			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<div className="mb-6 d-flex align-items-center justify-content-between">
							<h2 className="mb-0">Pages</h2>
							<Button
								onClick={() => {
									window.alert('Todo: Add Page');
								}}
							>
								Add Pages
							</Button>
						</div>
						<hr />
					</Col>
				</Row>
				<Suspense>
					<Await resolve={pagesPromise}>
						<Row className="mb-8">
							<Col>
								<Table isLoading={isLoading}>
									<TableHead>
										<TableRow>
											<TableCell header>Name</TableCell>
											<TableCell header>Status</TableCell>
											<TableCell header>Created</TableCell>
											<TableCell header>Modified</TableCell>
											<TableCell header>Published</TableCell>
											<TableCell header />
										</TableRow>
									</TableHead>
									<TableBody>
										{pages.map((_page, pageIndex) => {
											return (
												<TableRow key={pageIndex}>
													<TableCell>Name</TableCell>
													<TableCell>Status</TableCell>
													<TableCell>Created</TableCell>
													<TableCell>Modified</TableCell>
													<TableCell>Published</TableCell>
													<TableCell>Actions</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</Col>
						</Row>
						<Row>
							<Col xs={{ span: 4, offset: 4 }}>
								<div className="d-flex justify-content-center align-items-center">
									<TablePagination
										total={pagesTotalCount}
										page={parseInt(pageNumber, 10)}
										size={15}
										onClick={handlePaginationClick}
										disabled={isLoading}
									/>
								</div>
							</Col>
							<Col xs={4}>
								<div className="d-flex justify-content-end align-items-center">
									<p className="mb-0 fw-semibold text-gray">
										<span className="text-dark">{pages.length}</span> of{' '}
										<span className="text-dark">{pagesTotalCountDescription}</span> Pages
									</p>
								</div>
							</Col>
						</Row>
					</Await>
				</Suspense>
			</Container>
		</>
	);
};
