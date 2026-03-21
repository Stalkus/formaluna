import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount === 0 && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
        await prisma.user.create({
            data: {
                role: 'ADMIN',
                approvalStatus: 'APPROVED',
                approvedAt: new Date(),
                email: process.env.ADMIN_EMAIL.toLowerCase(),
                passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
                displayName: 'Admin',
            },
        });
        // eslint-disable-next-line no-console
        console.log('Seeded admin user');
    }
    const studioCats = [
        { slug: 'recessed', name: 'Recessed', sortOrder: 10, visibleStudio: true, visibleTrade: false },
        { slug: 'surface-mounted', name: 'Surface-mounted', sortOrder: 20, visibleStudio: true, visibleTrade: false },
        { slug: 'pendant', name: 'Pendant', sortOrder: 30, visibleStudio: true, visibleTrade: false },
        { slug: 'linear-systems', name: 'Linear Systems', sortOrder: 40, visibleStudio: true, visibleTrade: false },
        { slug: 'track', name: 'Track', sortOrder: 50, visibleStudio: true, visibleTrade: false },
    ];
    const tradeCats = [
        { slug: 'downlights', name: 'Downlights', sortOrder: 15, visibleStudio: false, visibleTrade: true },
        { slug: 'surface', name: 'Surface', sortOrder: 25, visibleStudio: false, visibleTrade: true },
        { slug: 'drivers-gear', name: 'Drivers/Gear', sortOrder: 35, visibleStudio: false, visibleTrade: true },
    ];
    for (const c of [...studioCats, ...tradeCats]) {
        await prisma.productCategory.upsert({
            where: { slug: c.slug },
            create: c,
            update: {
                name: c.name,
                sortOrder: c.sortOrder,
                visibleStudio: c.visibleStudio,
                visibleTrade: c.visibleTrade,
            },
        });
    }
    const recessed = await prisma.productCategory.findUniqueOrThrow({ where: { slug: 'recessed' } });
    const linear = await prisma.productCategory.findUniqueOrThrow({ where: { slug: 'linear-systems' } });
    const downlights = await prisma.productCategory.findUniqueOrThrow({ where: { slug: 'downlights' } });
    const demoStudio = {
        slug: 'beneito-faure-pulso',
        sku: 'DEMO-BF-PULSO',
        name: 'Beneito Faure Pulso',
        categoryId: recessed.id,
        description: 'An accessible, highly reliable residential downlight by Beneito Faure, perfect for broad residential rollouts.',
        packshotUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=700&h=700',
        lifestyleUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=700&h=700',
        isStudioProject: true,
        isNovaTrade: false,
        isPublished: true,
        hidePricing: false,
        priceCents: 8900,
        currency: 'EUR',
        specs: {
            Cutout: '75mm',
            Power: '12W',
            'Lumen Output': '1000lm',
            CRI: 'CRI95+',
        },
    };
    const demoTrade = {
        slug: 'vysn-tevo-track',
        sku: 'TRD-VYSN-TEVO',
        name: 'Vysn Tevo Track',
        categoryId: linear.id,
        description: '48V magnetic track system for commercial specifications with tight UGR controls and rapid click-and-lock mounting.',
        packshotUrl: 'https://images.unsplash.com/photo-1510074377623-8cf13fb86c08?auto=format&fit=crop&q=80&w=700&h=700',
        lifestyleUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=700&h=700',
        isStudioProject: false,
        isNovaTrade: true,
        isPublished: true,
        hidePricing: true,
        priceCents: null,
        currency: 'EUR',
        specs: {
            Mounting: 'Surface / Suspended',
            Voltage: '48V DC',
            'Body Material': 'Extruded Aluminum',
            'Finish Options': 'Black / White',
        },
    };
    const demoTrade2 = {
        slug: 'beneito-faure-pulso-trade',
        sku: 'TRD-BF-PULSO',
        name: 'Beneito Faure Pulso',
        categoryId: downlights.id,
        description: 'Trade specification sheet: architectural downlight for residential rollouts.',
        packshotUrl: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=700&h=700',
        isStudioProject: false,
        isNovaTrade: true,
        isPublished: true,
        hidePricing: true,
        priceCents: null,
        currency: 'EUR',
        specs: {
            Cutout: '75mm',
            Power: '12W',
            'Lumen Output': '1050lm',
            CRI: 'CRI95+',
        },
    };
    for (const p of [demoStudio, demoTrade, demoTrade2]) {
        await prisma.product.upsert({
            where: { slug: p.slug },
            create: p,
            update: {
                name: p.name,
                categoryId: p.categoryId,
                description: p.description,
                packshotUrl: p.packshotUrl,
                lifestyleUrl: p.lifestyleUrl ?? null,
                isStudioProject: p.isStudioProject,
                isNovaTrade: p.isNovaTrade,
                isPublished: p.isPublished,
                hidePricing: p.hidePricing,
                priceCents: p.priceCents,
                currency: p.currency,
                specs: p.specs,
            },
        });
    }
    const pulso = await prisma.product.findUniqueOrThrow({ where: { slug: 'beneito-faure-pulso-trade' } });
    const tevo = await prisma.product.findUniqueOrThrow({ where: { slug: 'vysn-tevo-track' } });
    await prisma.relatedProduct.upsert({
        where: { productId_relatedProductId: { productId: tevo.id, relatedProductId: pulso.id } },
        create: { productId: tevo.id, relatedProductId: pulso.id },
        update: {},
    });
    const existingSheet = await prisma.asset.findFirst({
        where: { productId: tevo.id, kind: 'PRODUCT_TECH_SHEET' },
    });
    if (!existingSheet) {
        await prisma.asset.create({
            data: {
                kind: 'PRODUCT_TECH_SHEET',
                objectKey: `seed/tevo-tech-${tevo.id}.pdf`,
                publicUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                label: 'Technical datasheet (PDF)',
                sortOrder: 0,
                productId: tevo.id,
            },
        });
    }
    await prisma.page.upsert({
        where: { slug: 'trade-terms' },
        create: {
            slug: 'trade-terms',
            title: 'Trade terms (sample)',
            contentJson: {
                blocks: [
                    {
                        type: 'paragraph',
                        text: 'This page is stored as structured JSON blocks. Edit via Admin → Pages.',
                    },
                ],
            },
        },
        update: {},
    });
    // eslint-disable-next-line no-console
    console.log('Seed complete: categories, demo products, related link, sample tech sheet, sample page');
}
main()
    .then(() => prisma.$disconnect())
    .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
