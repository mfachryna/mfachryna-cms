import {
	Mail,
	Phone,
	Clock,
	Video,
	FileText,
	MessageSquare,
	CheckCircle,
	Pause,
	XCircle,
	Archive
} from 'lucide-svelte';

export const CONTACT_STATUSES = {
	new: {
		label: 'New',
		color: 'bg-blue-100 text-blue-800 border-blue-200',
		icon: Mail
	},
	contacted: {
		label: 'Contacted',
		color: 'bg-purple-100 text-purple-800 border-purple-200',
		icon: Phone
	},
	'in-progress': {
		label: 'In Progress',
		color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		icon: Clock
	},
	'meeting-scheduled': {
		label: 'Meeting Scheduled',
		color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
		icon: Video
	},
	'proposal-sent': {
		label: 'Proposal Sent',
		color: 'bg-orange-100 text-orange-800 border-orange-200',
		icon: FileText
	},
	negotiating: {
		label: 'Negotiating',
		color: 'bg-teal-100 text-teal-800 border-teal-200',
		icon: MessageSquare
	},
	completed: {
		label: 'Completed',
		color: 'bg-green-100 text-green-800 border-green-200',
		icon: CheckCircle
	},
	'on-hold': {
		label: 'On Hold',
		color: 'bg-gray-100 text-gray-800 border-gray-200',
		icon: Pause
	},
	rejected: {
		label: 'Rejected',
		color: 'bg-red-100 text-red-800 border-red-200',
		icon: XCircle
	},
	archived: {
		label: 'Archived',
		color: 'bg-slate-100 text-slate-800 border-slate-200',
		icon: Archive
	}
} as const;

export type ContactStatus = keyof typeof CONTACT_STATUSES;

export const STATUS_OPTIONS = Object.entries(CONTACT_STATUSES).map(([value, config]) => ({
	value,
	label: config.label
}));

export const FILTER_OPTIONS = [{ value: 'all', label: 'All Contacts' }, ...STATUS_OPTIONS];
