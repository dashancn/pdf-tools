import { describe, expect, it } from 'vitest';
import footerSource from './Footer.vue?raw';

describe('Footer upstream attribution', () => {
    it('removes the upstream donation and EU badge from the product UI', () => {
        expect(footerSource).not.toContain('paypal.me/fullo');
        expect(footerSource).not.toContain('footer.buy_coffee');
        expect(footerSource).not.toContain('Proudly made in EU');
    });
});
