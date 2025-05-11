import { toast } from 'svelte-sonner';

export const customToast = {
	info: (message: string): void => {
		toast(message, {
			style: 'background: #3181D5; color: white;'
		});
	},
	success: (message: string): void => {
		toast.success(message);
	},
	error: (message: string): void => {
		toast.error(message);
	}
};
