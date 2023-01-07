import { sveltekit } from '@sveltejs/kit/vite';
import glsl from 'vite-plugin-glsl';

const config = {
	plugins: [glsl(),sveltekit()],
	resolve: {
		preserveSymlinks: true
	},
	server: {
		watch: {
			usePolling: true,
			interval: 1000
		}
	}
};

export default config;
