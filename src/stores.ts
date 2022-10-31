import { writable } from 'svelte/store';
import type { AuthenticationStore } from './lib/types';

export const authStore = writable({
	valid: false,
	token: '',
	me: {}
} as AuthenticationStore);
