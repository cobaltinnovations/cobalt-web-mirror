import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import classNames from 'classnames';
import {
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
	ThreeColumnImageRowModel,
	TwoColumnImageRowModel,
} from '@/lib/models';
import ResourceLibraryCard from '@/components/resource-library-card';
import StudioEvent from '@/components/studio-event';

const ResourcesRowRenderer = ({ pageRow }: { pageRow: ResourcesRowModel }) => {
	return (
		<Row className="mb-16">
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
						tags={[]}
						contentTypeId={content.contentTypeId}
						duration={content.durationInMinutesDescription}
					/>
				</Col>
			))}
		</Row>
	);
};

const GroupSessionsRowRenderer = ({ pageRow }: { pageRow: GroupSessionsRowModel }) => {
	return (
		<Row className="mb-16">
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

const TagGroupRowRenderer = ({ pageRow }: { pageRow: OneColumnImageRowModel }) => {
	return (
		<Row className="mb-16">
			<Col>[TODO]: Tag Group Row Renderer</Col>
		</Row>
	);
};

const OneColRowRenderer = ({ pageRow }: { pageRow: OneColumnImageRowModel }) => {
	return (
		<Row className="mb-16 align-items-center">
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

const TwoColRowRenderer = ({ pageRow }: { pageRow: TwoColumnImageRowModel }) => {
	return (
		<Row className="mb-16">
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

const ThreeColRowRenderer = ({ pageRow }: { pageRow: ThreeColumnImageRowModel }) => {
	return (
		<Row className="mb-16">
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

export const getRendererForPageRow = (pageRow: PageRowUnionModel) => {
	const rowTypeMap = [
		{
			check: isResourcesRow,
			getRow: (row: any) => <ResourcesRowRenderer pageRow={row} />,
		},
		{
			check: isGroupSessionsRow,
			getRow: (row: any) => <GroupSessionsRowRenderer pageRow={row} />,
		},
		{
			check: isTagGroupRow,
			getRow: (row: any) => <TagGroupRowRenderer pageRow={row} />,
		},
		{
			check: isOneColumnImageRow,
			getRow: (row: any) => <OneColRowRenderer pageRow={row} />,
		},
		{
			check: isTwoColumnImageRow,
			getRow: (row: any) => <TwoColRowRenderer pageRow={row} />,
		},
		{
			check: isThreeColumnImageRow,
			getRow: (row: any) => <ThreeColRowRenderer pageRow={row} />,
		},
	];

	for (const { check, getRow } of rowTypeMap) {
		if (check(pageRow)) {
			return getRow(pageRow);
		}
	}

	return null;
};
