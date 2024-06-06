import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import useDebouncedState from '@/hooks/use-debounced-state';
import { AnalyticsWidgetTableCard } from '@/components/admin';
import InputHelperSearch from '@/components/input-helper-search';

export async function loader() {
	return null;
}

export const Component = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const initialSearchValue = searchParams.get('search');
	const [searchInputValue, setSearchInputValue] = useState(initialSearchValue);
	const searchQuery = useMemo(() => {
		if (typeof searchInputValue === 'string') {
			return searchInputValue;
		}

		return initialSearchValue;
	}, [initialSearchValue, searchInputValue]);
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebouncedState(searchQuery);

	useEffect(() => {
		if (initialSearchValue === debouncedSearchQuery) {
			return;
		}

		if (debouncedSearchQuery) {
			searchParams.set('search', debouncedSearchQuery);
		} else {
			searchParams.delete('search');
		}

		setSearchParams(searchParams);
	}, [debouncedSearchQuery, initialSearchValue, searchParams, setSearchParams]);

	return (
		<Container fluid className="px-8 py-8">
			<Row className="mb-6">
				<Col lg={6}>
					<h2 className="mb-2">Study Name</h2>
					<p className="mb-0">April 24, 2024 - April 30, 2028</p>
				</Col>
				<Col lg={6}>
					<div className="d-flex align-items-center justify-content-end">
						<InputHelperSearch
							className="ms-2"
							style={{ width: 335 }}
							placeholder="Search"
							value={searchInputValue ?? ''}
							onChange={(event) => {
								setSearchInputValue(event.currentTarget.value);
							}}
							onClear={() => {
								setSearchInputValue('');
								setDebouncedSearchQuery('');
								searchParams.delete('search');
								setSearchParams(searchParams);
							}}
						/>
					</div>
				</Col>
			</Row>
			<Row className="mb-6">
				<Col>
					<hr />
				</Col>
			</Row>
			<Row>
				<Col>
					<AnalyticsWidgetTableCard
						widget={{
							widgetTitle: 'Participants',
							widgetTypeId: 'TABLE',
							widgetData: {
								headers: [
									'Participants',
									'First Access',
									'Last Access',
									'Last Upload',
									'Assessments Completed',
									'Check-Ins Completed',
								],
								rows: [
									{
										data: [
											'<a href="/admin/study-insights/xxxx-xxxx-xxxx-xxx0/user/xxxx-xxxx-xxxx-xxx0">User ID</a>',
											'00/00/0000',
											'00/00/0000',
											'00/00/0000',
											'3',
											'2',
										],
									},
									{
										data: [
											'<a href="/admin/study-insights/xxxx-xxxx-xxxx-xxx0/user/xxxx-xxxx-xxxx-xxx0">User ID</a>',
											'00/00/0000',
											'00/00/0000',
											'00/00/0000',
											'3',
											'2',
										],
									},
									{
										data: [
											'<a href="/admin/study-insights/xxxx-xxxx-xxxx-xxx0/user/xxxx-xxxx-xxxx-xxx0">User ID</a>',
											'00/00/0000',
											'00/00/0000',
											'00/00/0000',
											'3',
											'2',
										],
									},
									{
										data: [
											'<a href="/admin/study-insights/xxxx-xxxx-xxxx-xxx0/user/xxxx-xxxx-xxxx-xxx0">User ID</a>',
											'00/00/0000',
											'00/00/0000',
											'00/00/0000',
											'3',
											'2',
										],
									},
								],
							},
						}}
					/>
				</Col>
			</Row>
		</Container>
	);
};
