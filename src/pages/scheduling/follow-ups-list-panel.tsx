import SvgIcon from '@/components/svg-icon';
import React from 'react';
import { Button } from 'react-bootstrap';

interface FollowUpsListPanelProps {
	onClose: () => void;
}
export const FollowUpsListPanel = ({ onClose }: FollowUpsListPanelProps) => {
	return (
		<div>
			<div className="d-flex align-items-center justify-content-between py-4">
				<h4>2 / 3 follow-ups</h4>

				<Button variant="link" size="sm" className="p-0" onClick={() => onClose()}>
					<SvgIcon kit="far" icon="xmark" size={16} />
				</Button>
			</div>

			{[
				{
					name: 'Patient 1',
					phoneNumber: '321-765-4321',
					isDone: true,
				},
				{
					name: 'Patient 2',
					phoneNumber: '321-765-4321',
					isDone: false,
				},
				{
					name: 'Patient 3',
					phoneNumber: '321-765-4321',
					isDone: false,
				},
			].map((followup, idx) => {
				return (
					<div key={idx} className="border-bottom mb-4">
						<div className="d-flex justify-content-between align-items-center">
							<p className="mb-0">
								<strong>{followup.name}</strong>, {followup.phoneNumber}
							</p>

							{followup.isDone ? (
								<p className="text-success">done</p>
							) : (
								<Button
									variant="outline-primary"
									size="sm"
									className="p-1"
									onClick={() => {
										//
									}}
								>
									Mark Done
								</Button>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
};
