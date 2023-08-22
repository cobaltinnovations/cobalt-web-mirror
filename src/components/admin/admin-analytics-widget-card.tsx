import React, { ReactNode, useState } from 'react';
import { Button, Card, Dropdown } from 'react-bootstrap';

import {
	AdminAnalyticsChartWidget,
	AdminAnalyticsCounterWidget,
	AdminAnalyticsTableWidget,
	AdminAnalyticsWidget,
} from '@/lib/services/admin-analytics-service';
import { buildBackendDownloadUrl } from '@/lib/utils';
import { DropdownMenu, DropdownToggle } from '../dropdown';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../table';

import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import { ReactComponent as DownloadIcon } from '@/assets/icons/icon-download.svg';
import { ReactComponent as MoreIcon } from '@/assets/icons/more.svg';
import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';

const useAnalyticsWidgetStyles = createUseThemedStyles((theme) => ({
	cardTotal: {
		fontSize: 40,
	},
}));

interface AnalyticsWidgetCardProps {
	widget: AdminAnalyticsCounterWidget | AdminAnalyticsChartWidget;
	chart?: ReactNode;
}

export const AnalyticsWidgetCard = ({ widget, chart }: AnalyticsWidgetCardProps) => {
	const classes = useAnalyticsWidgetStyles();

	return (
		<Card bsPrefix="analytics-card">
			<Card.Header>
				<div className="d-flex align-items-center justify-content-between">
					<div>
						<p className="fs-large mb-0 text-n500">{widget.widgetTitle}</p>
						<p className={classNames('my-4', classes.cardTotal)}>{widget.widgetTotal}</p>
						{widget.widgetSubtitle && <p className="mb-0">{widget.widgetSubtitle}</p>}
					</div>

					<AdminAnalyticsWidgetOptions widget={widget} />
				</div>
			</Card.Header>

			{chart && <Card.Body>{chart}</Card.Body>}
		</Card>
	);
};

interface AnalyticsWidgetTableCardProps {
	widget: AdminAnalyticsTableWidget;
}

export const AnalyticsWidgetTableCard = ({ widget }: AnalyticsWidgetTableCardProps) => {
	const [expandedTableRows, setExpandedTableRows] = useState<Record<string, boolean>>({});
	const hasExpandableRows = widget.widgetData.rows.some((row) => row.nestedRows?.length);

	return (
		<Card bsPrefix="table-card">
			<Card.Header>
				<div className="d-flex align-items-center justify-content-between">
					<p className="fs-large mb-0 text-n500">{widget.widgetTitle}</p>

					<AdminAnalyticsWidgetOptions widget={widget} />
				</div>
			</Card.Header>

			<Card.Body>
				<Table>
					<TableHead>
						<TableRow>
							{hasExpandableRows && <TableCell width={48} />}

							{widget.widgetData.headers.map((header, headerIdx) => {
								return (
									<TableCell key={headerIdx} header>
										{header}
									</TableCell>
								);
							})}
						</TableRow>
					</TableHead>

					<TableBody>
						{widget.widgetData.rows.map((row, rowIdx) => {
							const hasNestedRows = row.nestedRows?.length;
							const isExpanded = expandedTableRows[rowIdx];

							return (
								<TableRow
									key={rowIdx}
									onClick={
										!hasExpandableRows
											? undefined
											: () => {
													setExpandedTableRows((currentExpandedState) => {
														return {
															...currentExpandedState,
															[rowIdx]: !currentExpandedState[rowIdx],
														};
													});
											  }
									}
									isExpanded={isExpanded}
									expandedContent={row.nestedRows?.map((nestedRow, nestedRowIdx) => {
										return (
											<TableRow key={nestedRowIdx}>
												<TableCell />

												{nestedRow.data.map((nestedCell, nestedCellIdx) => {
													return <TableCell key={nestedCellIdx}>{nestedCell}</TableCell>;
												})}
											</TableRow>
										);
									})}
								>
									{hasNestedRows && (
										<TableCell>
											<Button variant="link" size="sm">
												{isExpanded ? <DownChevron /> : <RightChevron />}
											</Button>
										</TableCell>
									)}
									{row.data.map((cell, cellIdx) => {
										return <TableCell key={cellIdx}>{cell}</TableCell>;
									})}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</Card.Body>
		</Card>
	);
};

interface AdminAnalyticsWidgetOptionsProps {
	widget: AdminAnalyticsWidget;
}

const AdminAnalyticsWidgetOptions = ({ widget }: AdminAnalyticsWidgetOptionsProps) => {
	if (!widget.widgetReportId) {
		return null;
	}

	return (
		<Dropdown className="align-self-start">
			<Dropdown.Toggle
				as={DropdownToggle}
				variant="link"
				id={`admin-analytics-widget--${widget.widgetTitle}`}
				className="p-0"
			>
				<MoreIcon />
			</Dropdown.Toggle>

			<Dropdown.Menu compact as={DropdownMenu} align="end" popperConfig={{ strategy: 'fixed' }} renderOnMount>
				<Dropdown.Item
					className="d-flex align-items-center"
					onClick={() => {
						window.location.href = buildBackendDownloadUrl('/reporting/run-report', {
							reportTypeId: widget.widgetReportId,
						});
					}}
				>
					<DownloadIcon className="me-2 text-n500" width={24} height={24} />
					Download .csv
				</Dropdown.Item>
			</Dropdown.Menu>
		</Dropdown>
	);
};
