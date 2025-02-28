import React from 'react';
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
import Carousel from '@/components/carousel';
import { resourceLibraryCarouselConfig } from '@/pages/resource-library';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';

interface RowRendererProps<T = PageRowUnionModel> {
	pageRow: T;
	contentsByTagGroupId: Record<string, Content[]>;
	tagsByTagId: Record<string, Tag>;
	className?: string;
}

const ResourcesRowRenderer = ({ pageRow, className, tagsByTagId }: RowRendererProps<ResourcesRowModel>) => {
	return (
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
						tags={content.tagIds.map((tagId) => tagsByTagId?.[tagId] ?? null).filter(Boolean)}
						contentTypeId={content.contentTypeId}
						duration={content.durationInMinutesDescription}
					/>
				</Col>
			))}
		</Row>
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

const TagGroupRowRenderer = ({
	pageRow,
	className,
	contentsByTagGroupId,
	tagsByTagId,
}: RowRendererProps<TagGroupRowModel>) => {
	return (
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
								tags={content.tagIds.map((tagId) => tagsByTagId?.[tagId] ?? null).filter(Boolean)}
								contentTypeId={content.contentTypeId}
								duration={content.durationInMinutesDescription}
							/>
						);
					})}
				</Carousel>
			</Col>
		</Row>
	);
};

const OneColRowRenderer = ({ pageRow, className }: RowRendererProps<OneColumnImageRowModel>) => {
	return (
		<Row className={classNames('align-items-center', className)}>
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
				{pageRow.columnOne.description && <WysiwygDisplay html={pageRow.columnOne.description ?? ''} />}
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
				<WysiwygDisplay html={pageRow.columnOne.description ?? ''} />
			</Col>
			<Col>
				<img
					className="mb-10 w-100"
					src={pageRow.columnTwo.imageUrl}
					alt={pageRow.columnTwo.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnTwo.headline}</h3>
				<WysiwygDisplay html={pageRow.columnTwo.description ?? ''} />
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
				<WysiwygDisplay html={pageRow.columnOne.description ?? ''} />
			</Col>
			<Col>
				<img
					className="mb-10 w-100"
					src={pageRow.columnTwo.imageUrl}
					alt={pageRow.columnTwo.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnTwo.headline}</h3>
				<WysiwygDisplay html={pageRow.columnTwo.description ?? ''} />
			</Col>
			<Col>
				<img
					className="mb-10 w-100"
					src={pageRow.columnThree.imageUrl}
					alt={pageRow.columnThree.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnThree.headline}</h3>
				<WysiwygDisplay html={pageRow.columnThree.description ?? ''} />
			</Col>
		</Row>
	);
};

export const getRendererForPageRow = (
	pageRow: PageRowUnionModel,
	contentsByTagGroupId: Record<string, Content[]>,
	tagsByTagId: Record<string, Tag>,
	isLast: boolean
) => {
	const rowTypeMap = [
		{
			check: isResourcesRow,
			getRow: (row: any) => (
				<ResourcesRowRenderer
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isGroupSessionsRow,
			getRow: (row: any) => (
				<GroupSessionsRowRenderer
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isTagGroupRow,
			getRow: (row: any) => (
				<TagGroupRowRenderer
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isOneColumnImageRow,
			getRow: (row: any) => (
				<OneColRowRenderer
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isTwoColumnImageRow,
			getRow: (row: any) => (
				<TwoColRowRenderer
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isThreeColumnImageRow,
			getRow: (row: any) => (
				<ThreeColRowRenderer
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
	];

	for (const { check, getRow } of rowTypeMap) {
		if (check(pageRow)) {
			return getRow(pageRow);
		}
	}

	return null;
};
