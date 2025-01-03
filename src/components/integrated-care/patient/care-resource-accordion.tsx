import React, { useEffect, useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { Marker, Map, useMap } from '@vis.gl/react-google-maps';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';
import { ResourcePacketLocation } from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

const useStyles = createUseThemedStyles((theme) => ({
	careResourceAccordion: {
		borderRadius: 8,
		overflow: 'hidden',
		border: `1px solid ${theme.colors.n100}`,
	},
	button: {
		border: 0,
		padding: 16,
		width: '100%',
		display: 'flex',
		appearance: 'none',
		alignItems: 'center',
		background: 'transparent',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n75,
	},
	informationOuter: {
		width: '50%',
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	inlineTitle: {
		width: 64,
		...theme.fonts.small,
		display: 'inline-block',
		color: theme.colors.n500,
	},
	mapOuter: {
		width: '50%',
		position: 'relative',
		backgroundColor: theme.colors.n75,
	},
	directionsButton: {
		right: 16,
		bottom: 32,
		zIndex: 1,
		position: 'absolute',
		'&:hover': {
			color: theme.colors.n0,
		},
	},
}));

interface CareResourceAccordionProps {
	careResourceLocation: ResourcePacketLocation;
	className?: string;
}

export const CareResourceAccordion = ({ careResourceLocation, className }: CareResourceAccordionProps) => {
	const classes = useStyles();
	const map = useMap(careResourceLocation.careResourceLocationId);
	const [show, setShow] = useState(true);

	useEffect(() => {
		if (!map) {
			return;
		}

		console.log(map);
	}, [map]);

	return (
		<div className={classNames(classes.careResourceAccordion, className)}>
			<button
				className={classes.button}
				onClick={() => {
					setShow(!show);
				}}
			>
				{careResourceLocation.careResourceLocationName}
				<DownChevron className="d-flex" style={{ transform: `scaleY(${show ? -1 : 1})` }} />
			</button>
			<Collapse in={show} mountOnEnter unmountOnExit>
				<div>
					<div className="px-4 pb-4 bg-n75 border-bottom">
						<p className="m-0">
							There is a mandatory $99 enrollment + $39 monthly fee for the online system including same
							day appointments, 24-hour Q&A, etc. The fee for the online system is not covered by
							insurance and needs to be payed in addition to co-pay.
						</p>
					</div>
					<div className="d-flex">
						<div className={classes.informationOuter}>
							<div className="p-4">
								<span className="mb-2 small text-gray">Address</span>
								{careResourceLocation.address ? (
									<>
										<span className="small">{careResourceLocation.address.streetAddress1}</span>
										<span className="small">
											{careResourceLocation.address.locality},{' '}
											{careResourceLocation.address.region}{' '}
											{careResourceLocation.address.postalCode}
										</span>
									</>
								) : (
									<span className="small">No address provided</span>
								)}
							</div>
							<hr />
							<div className="p-4">
								<div className="mb-2">
									<span className={classes.inlineTitle}>Phone:</span>
									<span className="d-inline small">
										<a
											className="text-decoration-none fw-normal"
											href={`tel:${careResourceLocation.phoneNumber}`}
										>
											{careResourceLocation.formattedPhoneNumber}
										</a>
									</span>
								</div>
								<div className="mb-2">
									<span className={classes.inlineTitle}>Email:</span>
									<span className="d-inline small">
										<a
											className="text-decoration-none fw-normal"
											href={`mailto:${careResourceLocation.emailAddress}`}
										>
											{careResourceLocation.emailAddress}
										</a>
									</span>
								</div>
								<div>
									<span className={classes.inlineTitle}>Website:</span>
									<span className="d-inline small">
										<a
											className="text-decoration-none fw-normal"
											href={careResourceLocation.websiteUrl}
											target="_blank"
											rel="noreferrer"
										>
											{careResourceLocation.websiteUrl}
										</a>
									</span>
								</div>
							</div>
							<hr />
							<div className="p-4">
								<span className="mb-2 d-block small text-gray">Location Notes</span>
								<div
									className="small"
									dangerouslySetInnerHTML={{
										__html: careResourceLocation.notes ?? '<p class="mb-0">No location notes.</p>',
									}}
								/>
							</div>
						</div>
						{careResourceLocation.address && (
							<div className={classes.mapOuter}>
								<a
									className={classNames(
										'cobalt-button cobalt-button-primary text-decoration-none',
										classes.directionsButton
									)}
									target="_blank"
									rel="noreferrer"
									href={buildQueryParamUrl('https://www.google.com/maps/dir/', {
										api: 1,
										origin: 'My Location',
										destination: careResourceLocation.address.formattedAddress,
										destination_place_id: careResourceLocation.address.googlePlaceId,
									})}
								>
									Get Directions
								</a>
								<Map
									mapId={careResourceLocation.careResourceLocationId}
									style={{ width: '100%', height: '100%' }}
									defaultCenter={{
										lat: careResourceLocation.address.latitude,
										lng: careResourceLocation.address.longitude,
									}}
									defaultZoom={12}
									gestureHandling="greedy"
									disableDefaultUI={true}
								>
									<Marker
										position={{
											lat: careResourceLocation.address.latitude,
											lng: careResourceLocation.address.longitude,
										}}
									/>
								</Map>
							</div>
						)}
					</div>
				</div>
			</Collapse>
		</div>
	);
};
