import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import classNames from 'classnames';
import {
	Content,
	GroupSessionsRowModel,
	isGroupSessionsRow,
	isOneColumnImageRow,
	isResourcesRow,
	isTagGroupRow,
	isThreeColumnImageRow,
	isTwoColumnImageRow,
	OneColumnImageRowModel,
	PageRowUnionModel,
	ResourcesRowModel,
	Tag,
	TagGroupRowModel,
	ThreeColumnImageRowModel,
	TwoColumnImageRowModel,
} from '@/lib/models';
import ResourceLibraryCard from '@/components/resource-library-card';
import StudioEvent from '@/components/studio-event';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import { resourceLibraryCarouselConfig } from '@/pages/resource-library';
import { resourceLibraryService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import Carousel from '@/components/carousel';

interface RowRendererProps<T = PageRowUnionModel> {
	pageRow: T;
	className?: string;
}

const ResourcesRowRenderer = ({ pageRow, className }: RowRendererProps<ResourcesRowModel>) => {
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();

	const fetchDefaultContent = useCallback(async () => {
		const filtersResponse = await resourceLibraryService.getResourceLibraryFilters().fetch();

		setTagsByTagId(
			filtersResponse.tagGroups
				.map((tg) => tg.tags ?? [])
				.flat()
				.reduce(
					(accumulator, value) => ({
						...accumulator,
						[value.tagId]: value,
					}),
					{}
				)
		);
	}, []);

	return (
		<AsyncWrapper fetchData={fetchDefaultContent}>
			<Row className={className}>
				{pageRow.contents.map((content) => (
					<Col key={content.contentId} xs={12} md={6} lg={4} className="mb-8">
						<ResourceLibraryCard
							key={content.contentId}
							linkTo={`/resource-library/${content.contentId}`}
							className="h-100"
							imageUrl={content.imageUrl}
							badgeTitle={content.newFlag ? 'New' : ''}
							title={content.title}
							author={content.author}
							description={content.description}
							tags={
								tagsByTagId
									? content.tagIds
											.map((tagId) => {
												return tagsByTagId?.[tagId] ?? null;
											})
											.filter(Boolean)
									: []
							}
							contentTypeId={content.contentTypeId}
							duration={content.durationInMinutesDescription}
						/>
					</Col>
				))}
			</Row>
		</AsyncWrapper>
	);
};

const GroupSessionsRowRenderer = ({ pageRow, className }: RowRendererProps<GroupSessionsRowModel>) => {
	return (
		<Row className={className}>
			{pageRow.groupSessions.map((groupSession) => (
				<Col key={groupSession.groupSessionId} xs={12} md={6} lg={4} className="mb-8">
					<Link className="d-block text-decoration-none h-100" to={`/group-sessions/${groupSession.urlName}`}>
						<StudioEvent className="h-100" studioEvent={groupSession} />
					</Link>
				</Col>
			))}
		</Row>
	);
};

const TagGroupRowRenderer = ({ pageRow, className }: RowRendererProps<TagGroupRowModel>) => {
	const [contentsByTagGroupId, setContentsByTagGroupId] = useState<Record<string, Content[]>>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();

	const fetchDefaultContent = useCallback(async () => {
		const [libraryResponse, filtersResponse] = await Promise.all([
			resourceLibraryService.getResourceLibrary().fetch(),
			resourceLibraryService.getResourceLibraryFilters().fetch(),
		]);
		setContentsByTagGroupId(libraryResponse.contentsByTagGroupId);
		setTagsByTagId(
			filtersResponse.tagGroups
				.map((tg) => tg.tags ?? [])
				.flat()
				.reduce(
					(accumulator, value) => ({
						...accumulator,
						[value.tagId]: value,
					}),
					{}
				)
		);
	}, []);

	return (
		<AsyncWrapper fetchData={fetchDefaultContent}>
			<Row className={className}>
				<Col lg={3} className="mb-10 mb-lg-0 pt-4 pb-2">
					<ResourceLibrarySubtopicCard
						className="h-100"
						colorId={pageRow.tagGroup.colorId}
						title={pageRow.tagGroup.name}
						description={pageRow.tagGroup.description}
						to={`/resource-library/tag-groups/${pageRow.tagGroup.urlName}`}
					/>
				</Col>
				<Col lg={9}>
					<Carousel
						responsive={resourceLibraryCarouselConfig}
						trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
						floatingButtonGroup
					>
						{(contentsByTagGroupId?.[pageRow.tagGroup.tagGroupId] ?? []).map((content) => {
							return (
								<ResourceLibraryCard
									key={content.contentId}
									linkTo={`/resource-library/${content.contentId}`}
									className="h-100"
									imageUrl={content.imageUrl}
									badgeTitle={content.newFlag ? 'New' : ''}
									title={content.title}
									author={content.author}
									description={content.description}
									tags={
										tagsByTagId
											? content.tagIds
													.map((tagId) => {
														return tagsByTagId?.[tagId] ?? null;
													})
													.filter(Boolean)
											: []
									}
									contentTypeId={content.contentTypeId}
									duration={content.durationInMinutesDescription}
								/>
							);
						})}
					</Carousel>
				</Col>
			</Row>
		</AsyncWrapper>
	);
};

const OneColRowRenderer = ({ pageRow, className }: RowRendererProps<OneColumnImageRowModel>) => {
	return (
		<Row className={`align-items-center ${className}`}>
			<Col>
				{pageRow.columnOne.imageUrl && (
					<img
						className="w-100"
						src={pageRow.columnOne.imageUrl}
						alt={pageRow.columnOne.imageAltText ?? ''}
					/>
				)}
			</Col>
			<Col>
				{pageRow.columnOne.headline && (
					<h3 className={classNames({ 'mb-6': pageRow.columnOne.description })}>
						{pageRow.columnOne.headline}
					</h3>
				)}
				{pageRow.columnOne.description && (
					<div dangerouslySetInnerHTML={{ __html: pageRow.columnOne.description ?? '' }} />
				)}
			</Col>
		</Row>
	);
};

const TwoColRowRenderer = ({ pageRow, className }: RowRendererProps<TwoColumnImageRowModel>) => {
	return (
		<Row className={className}>
			<Col>
				<img
					className="mb-10 w-100"
					src={pageRow.columnOne.imageUrl}
					alt={pageRow.columnOne.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnOne.headline}</h3>
				<div dangerouslySetInnerHTML={{ __html: pageRow.columnOne.description ?? '' }} />
			</Col>
			<Col>
				<img
					className="mb-10 w-100"
					src={pageRow.columnTwo.imageUrl}
					alt={pageRow.columnTwo.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnTwo.headline}</h3>
				<div dangerouslySetInnerHTML={{ __html: pageRow.columnTwo.description ?? '' }} />
			</Col>
		</Row>
	);
};

const ThreeColRowRenderer = ({ pageRow, className }: RowRendererProps<ThreeColumnImageRowModel>) => {
	return (
		<Row className={className}>
			<Col>
				<img
					className="mb-10 w-100"
					src={pageRow.columnOne.imageUrl}
					alt={pageRow.columnOne.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnOne.headline}</h3>
				<div dangerouslySetInnerHTML={{ __html: pageRow.columnOne.description ?? '' }} />
			</Col>
			<Col>
				<img
					className="mb-10 w-100"
					src={pageRow.columnTwo.imageUrl}
					alt={pageRow.columnTwo.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnTwo.headline}</h3>
				<div dangerouslySetInnerHTML={{ __html: pageRow.columnTwo.description ?? '' }} />
			</Col>
			<Col>
				<img
					className="mb-10 w-100"
					src={pageRow.columnThree.imageUrl}
					alt={pageRow.columnThree.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnThree.headline}</h3>
				<div dangerouslySetInnerHTML={{ __html: pageRow.columnThree.description ?? '' }} />
			</Col>
		</Row>
	);
};

export const getRendererForPageRow = (pageRow: PageRowUnionModel, isLast: boolean) => {
	const rowTypeMap = [
		{
			check: isResourcesRow,
			getRow: (row: any) => <ResourcesRowRenderer pageRow={row} className={isLast ? '' : 'mb-16'} />,
		},
		{
			check: isGroupSessionsRow,
			getRow: (row: any) => <GroupSessionsRowRenderer pageRow={row} className={isLast ? '' : 'mb-16'} />,
		},
		{
			check: isTagGroupRow,
			getRow: (row: any) => <TagGroupRowRenderer pageRow={row} className={isLast ? '' : 'mb-16'} />,
		},
		{
			check: isOneColumnImageRow,
			getRow: (row: any) => <OneColRowRenderer pageRow={row} className={isLast ? '' : 'mb-16'} />,
		},
		{
			check: isTwoColumnImageRow,
			getRow: (row: any) => <TwoColRowRenderer pageRow={row} className={isLast ? '' : 'mb-16'} />,
		},
		{
			check: isThreeColumnImageRow,
			getRow: (row: any) => <ThreeColRowRenderer pageRow={row} className={isLast ? '' : 'mb-16'} />,
		},
	];

	for (const { check, getRow } of rowTypeMap) {
		if (check(pageRow)) {
			return getRow(pageRow);
		}
	}

	return null;
};
