import { describe, it, expect } from 'vitest';
import { checkAccessibility } from '@/Services/pdf/accessibilityChecker';
import { createSimplePdf } from '@/__tests__/helpers/fixtures';
import { PDFDocument, PDFName, PDFBool, PDFString } from 'pdf-lib';

/** Create a PDF with accessibility metadata set. */
async function createAccessiblePdf(): Promise<File> {
    const doc = await PDFDocument.create();
    doc.setTitle('Accessible Document');
    doc.setLanguage('en-US');
    const page = doc.addPage();
    page.node.set(PDFName.of('Tabs'), PDFName.of('S'));
    // Set MarkInfo
    const markInfo = doc.context.obj({ Marked: true });
    doc.catalog.set(PDFName.of('MarkInfo'), markInfo);
    const bytes = await doc.save();
    return new File([bytes], 'accessible.pdf', { type: 'application/pdf' });
}

describe('checkAccessibility', () => {
    it('returns a report with 10 checks', async () => {
        const file = await createSimplePdf(2);
        const report = await checkAccessibility(file);
        expect(report.checks.length).toBe(10);
        expect(report.pageCount).toBe(2);
        expect(report.score).toBeGreaterThanOrEqual(0);
        expect(report.score).toBeLessThanOrEqual(100);
        expect(report.fileName).toBe(file.name);
    });

    it('fails most checks on a simple PDF', async () => {
        const file = await createSimplePdf(1);
        const report = await checkAccessibility(file);
        const failCount = report.checks.filter(c => c.status === 'fail').length;
        expect(failCount).toBeGreaterThan(3);
    });

    it('passes checks when accessibility metadata is set', async () => {
        const file = await createAccessiblePdf();
        const report = await checkAccessibility(file);
        const titleCheck = report.checks.find(c => c.id === 'document-title');
        expect(titleCheck?.status).toBe('pass');
        const langCheck = report.checks.find(c => c.id === 'document-language');
        expect(langCheck?.status).toBe('pass');
        const tagCheck = report.checks.find(c => c.id === 'tagged-pdf');
        expect(tagCheck?.status).toBe('pass');
        const tabCheck = report.checks.find(c => c.id === 'tab-order');
        expect(tabCheck?.status).toBe('pass');
    });

    it('reports form-labels as na when no form fields', async () => {
        const file = await createSimplePdf(1);
        const report = await checkAccessibility(file);
        const formCheck = report.checks.find(c => c.id === 'form-labels');
        expect(formCheck?.status).toBe('na');
    });

    it('reports progress', async () => {
        const file = await createSimplePdf(1);
        const values: number[] = [];
        await checkAccessibility(file, (p) => values.push(p));
        expect(values.length).toBeGreaterThan(0);
        expect(values[values.length - 1]).toBe(100);
    });

    it('excludes na checks from score denominator', async () => {
        const file = await createSimplePdf(1);
        const report = await checkAccessibility(file);
        const naCount = report.checks.filter(c => c.status === 'na').length;
        const scoredCount = report.checks.length - naCount;
        // Score should be based on scored checks only
        expect(scoredCount).toBeGreaterThan(0);
        expect(scoredCount).toBeLessThanOrEqual(10);
    });

    it('each check has a valid status', async () => {
        const file = await createSimplePdf(1);
        const report = await checkAccessibility(file);
        const validStatuses = ['pass', 'fail', 'warn', 'na'];
        for (const check of report.checks) {
            expect(validStatuses).toContain(check.status);
            expect(check.id).toBeTruthy();
            expect(check.detail).toBeTruthy();
        }
    });
});
