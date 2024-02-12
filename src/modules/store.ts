import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

type LoginUser = {
  uid: string,
	isLoggedIn: boolean
}

export const userStore: Writable<LoginUser> = writable({
	uid: '',
	isLoggedIn: false
});

