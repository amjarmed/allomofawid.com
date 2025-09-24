
import { Mada, Tajawal } from 'next/font/google';

export const tajawal = Tajawal({
	subsets: ['arabic', 'latin'],
	weight: ['400', '700'],
	display: 'swap',
	variable: '--font-tajawal',
});

export const mada = Mada({
	subsets: ['arabic', 'latin'],
	weight: ['300', '500', '700'],
	display: 'swap',
	variable: '--font-mada',
});
