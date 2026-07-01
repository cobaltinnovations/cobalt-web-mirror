import React, { FC, useCallback, useMemo, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

import InputHelperSearch from '@/components/input-helper-search';
import useDebouncedState from '@/hooks/use-debounced-state';
import { createUseThemedStyles } from '@/jss/theme';
import type { ImageListModel } from '@/lib/models';
import { mediaService } from '@/lib/services/media-service';

import AsyncWrapper from '@/components/async-page';
import {
	IMAGE_REPOSITORY_SCREEN_ID,
	ImageRepositoryScreenProps,
} from '@/components/image-repository/image-repository.types';
import ImageRepositoryImageTile from '@/components/image-repository/image-repository-image-tile';
import ImageRepositoryUploadImageTile from '@/components/image-repository/image-repository-upload-image-tile';

enum IMAGE_REPOSITORY_IMAGE_FILTER {
	ALL = 'ALL',
	RESOURCES = 'RESOURCES',
	GROUP_SESSIONS = 'GROUP_SESSIONS',
}

const useStyles = createUseThemedStyles((theme) => ({
	browseImagesScreen: {
		height: 575,
		overflowY: 'auto',
		backgroundColor: theme.colors.n0,
	},
	secondaryHeader: {
		position: 'sticky',
		zIndex: 1,
		top: 0,
		display: 'flex',
		alignItems: 'center',
		gap: 16,
		padding: '16px 24px',
		borderBottom: `1px solid ${theme.colors.border}`,
		backgroundColor: theme.colors.n0,
	},
	searchForm: {
		flex: '1 1 auto',
		minWidth: 240,
	},
	filterActions: {
		display: 'flex',
		flex: '0 0 auto',
		gap: 8,
	},
	imageTileGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
		gap: 16,
		padding: 24,
	},
	loadingState: {
		gridColumn: '1 / -1',
		minHeight: 220,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyState: {
		gridColumn: '1 / -1',
		minHeight: 220,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: theme.colors.n500,
		textAlign: 'center',
	},
}));

const ImageRepositoryBrowseImages: FC<ImageRepositoryScreenProps> = ({ onNavigate, onRepositoryImageSelected }) => {
	const classes = useStyles();
	const [images, setImages] = useState<ImageListModel[]>([]);
	const [searchInputValue, setSearchInputValue] = useState('');
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebouncedState(searchInputValue);
	const [activeImageFilter, setActiveImageFilter] = useState(IMAGE_REPOSITORY_IMAGE_FILTER.ALL);

	const request = useMemo(() => {
		const searchQuery = debouncedSearchQuery.trim();

		return mediaService.getImages(searchQuery ? { searchQuery } : undefined);
	}, [debouncedSearchQuery]);

	const fetchData = useCallback(async () => {
		const response = await request.fetch();
		setImages(response.images);
	}, [request]);

	const handleSearchFormSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			setDebouncedSearchQuery(searchInputValue);
		},
		[searchInputValue, setDebouncedSearchQuery]
	);

	const handleClearSearch = useCallback(() => {
		setSearchInputValue('');
		setDebouncedSearchQuery('');
	}, [setDebouncedSearchQuery]);

	return (
		<div className={classes.browseImagesScreen}>
			<div className={classes.secondaryHeader}>
				<Form className={classes.searchForm} onSubmit={handleSearchFormSubmit}>
					<InputHelperSearch
						placeholder="Search images"
						value={searchInputValue}
						onChange={({ currentTarget }) => {
							setSearchInputValue(currentTarget.value);
						}}
						onClear={handleClearSearch}
					/>
				</Form>
				<div className={classes.filterActions}>
					<Button
						variant={
							activeImageFilter === IMAGE_REPOSITORY_IMAGE_FILTER.ALL ? 'primary' : 'outline-primary'
						}
						onClick={() => {
							setActiveImageFilter(IMAGE_REPOSITORY_IMAGE_FILTER.ALL);
						}}
					>
						All
					</Button>
					<Button
						variant={
							activeImageFilter === IMAGE_REPOSITORY_IMAGE_FILTER.RESOURCES
								? 'primary'
								: 'outline-primary'
						}
						onClick={() => {
							setActiveImageFilter(IMAGE_REPOSITORY_IMAGE_FILTER.RESOURCES);
						}}
					>
						Resources
					</Button>
					<Button
						variant={
							activeImageFilter === IMAGE_REPOSITORY_IMAGE_FILTER.GROUP_SESSIONS
								? 'primary'
								: 'outline-primary'
						}
						onClick={() => {
							setActiveImageFilter(IMAGE_REPOSITORY_IMAGE_FILTER.GROUP_SESSIONS);
						}}
					>
						Group Sessions
					</Button>
				</div>
			</div>
			<AsyncWrapper fetchData={fetchData} abortFetch={request.abort}>
				<div className={classes.imageTileGrid}>
					<ImageRepositoryUploadImageTile
						onClick={() => {
							onNavigate(IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE);
						}}
					/>
					{images.map((image) => (
						<ImageRepositoryImageTile
							key={image.sourceImageId}
							imageName={image.thumbnail.filename}
							imageUrl={image.thumbnail.url}
							onClick={() => {
								onRepositoryImageSelected?.(image.sourceImageId);
							}}
						/>
					))}
				</div>
			</AsyncWrapper>
		</div>
	);
};

export default ImageRepositoryBrowseImages;
