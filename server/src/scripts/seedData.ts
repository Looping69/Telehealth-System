/**
 * Seed Medplum with Mock Data
 * Purpose: Populate the Medplum server with data matching the mock pages
 * Usage: npx tsx server/src/scripts/seedData.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables BEFORE importing services
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Dynamic imports to ensure env vars are loaded first
const { MedplumService } = await import('../services/medplumService.js');
import {
    CodeSystem, Basic, DocumentReference
} from '@medplum/fhirtypes';

const medplumService = new MedplumService();

// --- MOCK DATA ---

const mockTags = [
    {
        id: 'TAG-001',
        name: 'High Priority',
        description: 'Urgent cases requiring immediate attention',
        color: '#ff4757',
        category: 'patient',
    },
    {
        id: 'TAG-002',
        name: 'Follow-up Required',
        description: 'Patients requiring follow-up appointments',
        color: '#ffa502',
        category: 'patient',
    },
    {
        id: 'TAG-003',
        name: 'Telehealth',
        description: 'Virtual appointments and consultations',
        color: '#2ed573',
        category: 'appointment',
    },
    {
        id: 'TAG-004',
        name: 'Insurance Pending',
        description: 'Cases with pending insurance verification',
        color: '#5352ed',
        category: 'billing',
    },
    {
        id: 'TAG-005',
        name: 'Chronic Care',
        description: 'Patients with chronic conditions requiring ongoing care',
        color: '#ff6b81',
        category: 'patient',
    },
    {
        id: 'TAG-006',
        name: 'Educational Material',
        description: 'Patient education resources and materials',
        color: '#70a1ff',
        category: 'resource',
    },
    {
        id: 'TAG-007',
        name: 'Cancelled',
        description: 'Cancelled appointments and sessions',
        color: '#747d8c',
        category: 'appointment',
    },
    {
        id: 'TAG-008',
        name: 'VIP Patient',
        description: 'High-value patients requiring special attention',
        color: '#ffd700',
        category: 'patient',
    },
];

const mockDiscounts = [
    {
        id: 'DISC-001',
        code: 'WELCOME20',
        name: 'Welcome Discount',
        description: '20% off first telehealth consultation for new patients',
        type: 'percentage',
        value: 20,
    },
    {
        id: 'DISC-002',
        code: 'FOLLOWUP15',
        name: 'Follow-up Discount',
        description: '15% off follow-up appointments',
        type: 'percentage',
        value: 15,
    },
    {
        id: 'DISC-003',
        code: 'HEALTH50',
        name: 'Health Screening Special',
        description: '$50 off comprehensive health screening',
        type: 'fixed_amount',
        value: 50,
    },
    {
        id: 'DISC-004',
        code: 'FREECONSULT',
        name: 'Free Initial Consultation',
        description: 'Complimentary first consultation for VIP patients',
        type: 'free_service',
        value: 100,
    },
    {
        id: 'DISC-005',
        code: 'SUMMER25',
        name: 'Summer Wellness',
        description: '25% off wellness packages during summer',
        type: 'percentage',
        value: 25,
    },
];

const mockResources = [
    {
        id: 'RES-001',
        title: 'Understanding Telehealth: A Patient Guide',
        description: 'Comprehensive guide explaining how telehealth works, what to expect, and how to prepare for virtual appointments',
        type: 'document',
        category: 'patient-education',
        fileUrl: '/resources/telehealth-guide.pdf',
        thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=telehealth%20patient%20guide%20medical%20document%20healthcare&image_size=square',
    },
    {
        id: 'RES-002',
        title: 'How to Use Our Patient Portal',
        description: 'Step-by-step video tutorial showing patients how to navigate and use the patient portal effectively',
        type: 'video',
        category: 'patient-education',
        fileUrl: '/resources/portal-tutorial.mp4',
        thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=patient%20portal%20tutorial%20video%20healthcare%20technology&image_size=square',
    },
    {
        id: 'RES-003',
        title: 'HIPAA Compliance Training Module',
        description: 'Mandatory training module for all healthcare providers covering HIPAA regulations and best practices',
        type: 'document',
        category: 'provider-training',
        fileUrl: '/resources/hipaa-training.pdf',
        thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=HIPAA%20compliance%20training%20healthcare%20privacy%20security&image_size=square',
    },
    {
        id: 'RES-004',
        title: 'Mental Health Resources Directory',
        description: 'Comprehensive directory of mental health resources, hotlines, and support services for patients',
        type: 'article',
        category: 'patient-education',
        thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=mental%20health%20resources%20support%20directory%20healthcare&image_size=square',
    },
    {
        id: 'RES-005',
        title: 'New Patient Registration Form',
        description: 'Standard registration form for new patients including medical history and insurance information',
        type: 'form',
        category: 'forms',
        fileUrl: '/resources/registration-form.pdf',
        thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=patient%20registration%20form%20medical%20document%20healthcare&image_size=square',
    },
    {
        id: 'RES-006',
        title: 'Telehealth Best Practices Guide',
        description: 'Internal guide for healthcare providers on conducting effective telehealth consultations',
        type: 'guide',
        category: 'provider-training',
        fileUrl: '/resources/telehealth-best-practices.pdf',
        thumbnailUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=telehealth%20best%20practices%20provider%20guide%20medical%20training&image_size=square',
    },
];

// --- SEEDING FUNCTION ---

async function seedData() {
    console.log('Starting remaining data seeding (Tags, Discounts, Resources)...');

    try {
        // 1. Create Tags (CodeSystem)
        console.log('--- Creating Tags ---');
        const tagSystem: CodeSystem = {
            resourceType: 'CodeSystem',
            status: 'active',
            content: 'complete',
            name: 'ZappyTags',
            title: 'ZappyHealth Tags',
            url: 'http://zappyhealth.com/tags',
            concept: mockTags.map(t => ({
                code: t.id,
                display: t.name,
                definition: t.description,
                designation: [
                    { value: t.color, use: { system: 'http://zappyhealth.com/tag-color', code: 'color' } },
                    { value: t.category, use: { system: 'http://zappyhealth.com/tag-category', code: 'category' } }
                ]
            }))
        };
        await medplumService.createResource('CodeSystem', tagSystem);
        console.log('Created Tag System with ' + mockTags.length + ' tags');

        // 2. Create Discounts (Basic)
        console.log('--- Creating Discounts ---');
        for (const d of mockDiscounts) {
            const discount: Basic = {
                resourceType: 'Basic',
                code: { coding: [{ system: 'http://zappyhealth.com/resource-types', code: 'Discount', display: d.name }] },
                extension: [
                    { url: 'http://zappyhealth.com/discount-code', valueString: d.code },
                    { url: 'http://zappyhealth.com/discount-value', valueDecimal: d.value },
                    { url: 'http://zappyhealth.com/discount-type', valueString: d.type },
                    { url: 'http://zappyhealth.com/discount-description', valueString: d.description }
                ],
                created: new Date().toISOString().split('T')[0]
            };
            await medplumService.createResource('Basic', discount);
            console.log(`Created Discount: ${d.name}`);
        }

        // 3. Create Resources (DocumentReference)
        console.log('--- Creating Educational Resources ---');
        for (const r of mockResources) {
            const doc: DocumentReference = {
                resourceType: 'DocumentReference',
                status: 'current',
                type: { text: r.type },
                category: [{ text: r.category }],
                description: r.description,
                content: [{
                    attachment: {
                        title: r.title,
                        url: r.fileUrl || r.thumbnailUrl, // Use thumbnail if no file URL
                        contentType: r.type === 'video' ? 'video/mp4' : 'application/pdf'
                    }
                }],
                context: {
                    related: [{ display: r.thumbnailUrl }] // Store thumbnail in related context
                }
            };
            await medplumService.createResource('DocumentReference', doc);
            console.log(`Created Resource: ${r.title}`);
        }

        console.log('Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedData();
