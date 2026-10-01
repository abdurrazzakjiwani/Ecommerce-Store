/**
 * Prototype content.
 *
 * IMPORTANT: this is placeholder content for client review, not the real
 * catalogue. The business owner will replace all of it through the admin panel.
 *
 * `YourBrand` is used as the business name because the real name has not been
 * supplied. It is deliberately implausible so it cannot be mistaken for a settled
 * decision and cannot reach a customer by accident.
 *
 * Prices are indicative. `priceType` deliberately spans all three cases - fixed,
 * starting-from and quote-only - because the owner's catalogue composition is
 * unconfirmed and every presentation must be reviewable before real content
 * arrives.
 */

import type { Category, Post, Product, SiteSettings } from '../types'

export const SITE_SETTINGS: SiteSettings = {
  businessName: 'YourBrand',
  tagline: 'Hardware, software and IT services for growing businesses',
  logo: null,
  whatsappNumber: '923394299873',
  notificationEmail: 'co.auraztech@gmail.com',
  phone: '',
  address: '',
  socials: {},
  currency: 'PKR',
  deliveryCharge: 0,
  deliveryTimeframe: 'Nationwide delivery across Pakistan, typically 2-5 working days.',
  aboutContent:
    'YourBrand supplies computer hardware, business software and the technical support that keeps both working. We work with small and medium businesses that need dependable equipment, sensible advice and someone to call when something breaks. Every enquiry is handled personally over WhatsApp, and we will always tell you plainly if something is not worth buying.',
  contactIntro:
    'Tell us what you need and we will come back with an honest answer and a fair price. Hardware quotes, software advice, installation and support - all handled directly.',
}

export const CATEGORIES: Category[] = [
  {
    id: 'cat-laptops',
    slug: 'computing',
    title: 'Computing',
    description: 'Laptops, desktops and accessories for everyday business use.',
    parentId: null,
  },
  {
    id: 'cat-laptops-laptop',
    slug: 'laptops',
    title: 'Laptops',
    description: 'Business-grade notebooks that survive a working day.',
    parentId: 'cat-laptops',
  },
  {
    id: 'cat-laptops-accessories',
    slug: 'accessories',
    title: 'Accessories',
    description: 'Docking stations, monitors, input devices and storage.',
    parentId: 'cat-laptops',
  },
  {
    id: 'cat-software',
    slug: 'software',
    title: 'Software',
    description: 'Licensed business software, installation and configuration.',
    parentId: null,
  },
  {
    id: 'cat-software-licensing',
    slug: 'software-licensing',
    title: 'Licensing',
    description: 'Genuine licences with setup and support included.',
    parentId: 'cat-software',
  },
  {
    id: 'cat-services',
    slug: 'services',
    title: 'Services',
    description: 'Installation, maintenance and technical support.',
    parentId: null,
  },
  {
    id: 'cat-services-network',
    slug: 'network-setup',
    title: 'Network & Installation',
    description: 'On-site installation, cabling and router configuration.',
    parentId: 'cat-services',
  },
  {
    id: 'cat-services-support',
    slug: 'support',
    title: 'Support & Maintenance',
    description: 'Ongoing help for the systems we have installed.',
    parentId: 'cat-services',
  },
]

export const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    slug: 'business-laptop-14',
    title: 'Business Laptop 14"',
    summary:
      'A dependable 14-inch business notebook with all-day battery and a warranty that means something.',
    description:
      'Designed for a full working day of email, documents, spreadsheets and video calls. The 14-inch display keeps it portable without becoming cramped, and the chassis is built to be carried every day rather than admired on a desk. Includes a one-year hardware warranty handled directly by us, so a claim does not mean shipping a laptop across the country and hoping.',
    categoryId: 'cat-laptops-laptop',
    images: [
      '/media/laptop-1.svg',
      '/media/laptop-2.svg',
      '/media/laptop-3.svg',
      '/media/laptop-4.svg',
    ],
    price: 185000,
    priceType: 'fixed',
    currency: 'PKR',
    specs: [
      { label: 'Display', value: '14" Full HD, anti-glare' },
      { label: 'Processor', value: 'Intel Core i5, 12th generation' },
      { label: 'Memory', value: '16 GB DDR4' },
      { label: 'Storage', value: '512 GB NVMe SSD' },
      { label: 'Battery', value: 'Approx. 10 hours mixed use' },
      { label: 'Warranty', value: '1 year, handled locally' },
    ],
    tags: ['laptop', 'business', 'hardware'],
    featured: true,
    inStock: true,
    relatedSlugs: ['ultrabook-13', 'usb-c-dock'],
  },
  {
    id: 'prod-2',
    slug: 'ultrabook-13',
    title: 'Ultrabook 13"',
    summary: 'Light, quiet and thin enough to forget in a bag. Battery for the long meeting.',
    description:
      'If your work is mostly documents, email and the occasional presentation, this is the lighter option. Fanless, so it is genuinely silent in a meeting room, and light enough that carrying it all day does not show in your shoulders. Two-year warranty.',
    categoryId: 'cat-laptops-laptop',
    images: [
      '/media/ultrabook-1.svg',
      '/media/ultrabook-2.svg',
      '/media/ultrabook-3.svg',
    ],
    price: 240000,
    priceType: 'from',
    currency: 'PKR',
    specs: [
      { label: 'Display', value: '13.3" Full HD' },
      { label: 'Processor', value: 'Intel Core i7, 12th generation' },
      { label: 'Memory', value: '16 GB' },
      { label: 'Storage', value: '512 GB SSD' },
      { label: 'Weight', value: 'Approx. 1.1 kg' },
      { label: 'Warranty', value: '2 years' },
    ],
    tags: ['laptop', 'ultrabook', 'portable'],
    featured: true,
    inStock: true,
    relatedSlugs: ['business-laptop-14', 'wireless-keyboard'],
  },
  {
    id: 'prod-3',
    slug: 'usb-c-dock',
    title: 'USB-C Docking Station',
    summary: 'One cable to connect monitors, network, power and peripherals.',
    description:
      'Turns a single USB-C port into a full desk setup. Connects two monitors, wired network, USB-A peripherals and a single power supply. Everything you need to set up and take down a hot desk in under a minute.',
    categoryId: 'cat-laptops-accessories',
    images: [
      '/media/dock-1.svg',
      '/media/dock-2.svg',
      '/media/dock-3.svg',
    ],
    price: 28000,
    priceType: 'fixed',
    currency: 'PKR',
    specs: [
      { label: 'Displays', value: 'Up to 2 x 4K' },
      { label: 'Network', value: 'Gigabit Ethernet' },
      { label: 'Power delivery', value: '100W' },
      { label: 'Ports', value: '2 x USB-A, 2 x USB-C' },
    ],
    tags: ['accessory', 'dock', 'usb-c'],
    featured: false,
    inStock: true,
    relatedSlugs: ['business-laptop-14', 'monitor-24'],
  },
  {
    id: 'prod-4',
    slug: 'monitor-24',
    title: '24" IPS Monitor',
    summary: 'A colour-accurate panel that is comfortable to work in front of for eight hours.',
    description:
      'Full HD IPS panel with a matte finish, so it does not reflect office lighting back at you. Height, tilt and swivel adjustable. Connects over HDMI or VGA, so it works with older machines as well as new ones.',
    categoryId: 'cat-laptops-accessories',
    images: ['/media/monitor-1.svg', '/media/monitor-2.svg', '/media/monitor-3.svg'],
    price: 34000,
    priceType: 'fixed',
    currency: 'PKR',
    specs: [
      { label: 'Panel', value: '24" IPS, 1920 x 1080' },
      { label: 'Refresh', value: '75 Hz' },
      { label: 'Inputs', value: 'HDMI, VGA' },
      { label: 'Adjust', value: 'Height, tilt, swivel' },
    ],
    tags: ['accessory', 'monitor', 'display'],
    featured: false,
    inStock: true,
    relatedSlugs: ['usb-c-dock', 'business-laptop-14'],
  },
  {
    id: 'prod-5',
    slug: 'office-software-suite',
    title: 'Office Software Suite',
    summary: 'Genuine word processor, spreadsheet and presentation licences for a small team.',
    description:
      'Licensed copies of the standard office suite, set up on your machines and configured to your existing document templates. Includes a short handover session so the team is not left guessing. Licence transfer is handled if you replace a machine later.',
    categoryId: 'cat-software-licensing',
    images: [
      '/media/software-1.svg',
      '/media/software-2.svg',
      '/media/software-3.svg',
      '/media/software-4.svg',
    ],
    price: null,
    priceType: 'quote',
    currency: 'PKR',
    specs: [
      { label: 'Includes', value: 'Word processor, spreadsheet, presentation' },
      { label: 'Users', value: '1 to 10' },
      { label: 'Term', value: 'Annual, renewable' },
      { label: 'Setup', value: 'Installation and handover session included' },
    ],
    tags: ['software', 'licence', 'productivity'],
    featured: true,
    inStock: true,
    relatedSlugs: ['network-installation', 'accounting-software'],
  },
  {
    id: 'prod-6',
    slug: 'accounting-software',
    title: 'Accounting Software',
    summary: 'Invoicing, stock and reporting, set up around how your business already works.',
    description:
      'We set this up with you rather than handing you a login. Chart of accounts, opening balances, customer and supplier records, and a first month of reconciliation alongside your existing records. Priced on what you actually need - if you only need invoicing, you will not be sold a full ERP.',
    categoryId: 'cat-software-licensing',
    images: ['/media/accounting-1.svg', '/media/accounting-2.svg', '/media/accounting-3.svg'],
    price: null,
    priceType: 'quote',
    currency: 'PKR',
    specs: [
      { label: 'Modules', value: 'Invoicing, stock, reporting' },
      { label: 'Setup', value: 'Data migration and first-month reconciliation' },
      { label: 'Users', value: '1 to 5' },
      { label: 'Training', value: 'On-site handover for your team' },
    ],
    tags: ['software', 'accounting', 'business'],
    featured: false,
    inStock: true,
    relatedSlugs: ['office-software-suite', 'network-installation'],
  },
  {
    id: 'prod-7',
    slug: 'network-installation',
    title: 'Network & Router Installation',
    summary: 'Cabling, router configuration and Wi-Fi coverage that reaches the far corner.',
    description:
      'An on-site visit to survey, install and test. We check where the signal actually lands rather than trusting a signal bar in one room, configure the router properly, and set up guest and internal networks separately. Includes a written summary of what was done so your next person is not guessing.',
    categoryId: 'cat-services-network',
    images: [
      '/media/network-1.svg',
      '/media/network-2.svg',
      '/media/network-3.svg',
      '/media/network-4.svg',
    ],
    price: null,
    priceType: 'quote',
    currency: 'PKR',
    specs: [
      { label: 'Includes', value: 'Site survey, cabling, router configuration' },
      { label: 'Coverage', value: 'Measured across all rooms' },
      { label: 'Networks', value: 'Internal and guest, separately secured' },
      { label: 'Onsite', value: 'Nationwide, travel quoted separately' },
    ],
    tags: ['service', 'network', 'installation'],
    featured: true,
    inStock: true,
    relatedSlugs: ['annual-maintenance', 'accounting-software'],
  },
  {
    id: 'prod-8',
    slug: 'annual-maintenance',
    title: 'Annual Maintenance Contract',
    summary: 'A named point of contact, agreed response times, and scheduled preventive work.',
    description:
      'Priority response for hardware and software faults, scheduled preventive maintenance so problems surface before they become outages, and a named engineer who already knows your setup. Priced per device. Cancelled at 30 days notice.',
    categoryId: 'cat-services-support',
    images: ['/media/support-1.svg', '/media/support-2.svg', '/media/support-3.svg'],
    price: null,
    priceType: 'quote',
    currency: 'PKR',
    specs: [
      { label: 'Response', value: 'Agreed times, priority for critical faults' },
      { label: 'Visits', value: 'Scheduled preventive maintenance' },
      { label: 'Engineer', value: 'Named contact who knows your setup' },
      { label: 'Notice', value: '30 days to cancel' },
    ],
    tags: ['service', 'support', 'maintenance'],
    featured: false,
    inStock: true,
    relatedSlugs: ['network-installation', 'data-recovery'],
  },
  {
    id: 'prod-9',
    slug: 'data-recovery',
    title: 'Data Recovery & Backup Setup',
    summary: 'Recover what is recoverable, then make sure it cannot happen again the same way.',
    description:
      'We assess the drive or device first and tell you honestly whether recovery is likely before quoting. If recovery is possible we do it. If it is not, we say so and move on - there is no point paying for a hopeless attempt. Every job includes a review of your backup situation and a plan to stop a repeat.',
    categoryId: 'cat-services-support',
    images: ['/media/recovery-1.svg', '/media/recovery-2.svg'],
    price: null,
    priceType: 'quote',
    currency: 'PKR',
    specs: [
      { label: 'Assessment', value: 'Free initial assessment of the device' },
      { label: 'Recovery', value: 'Physical and logical, quoted after assessment' },
      { label: 'Backup', value: 'Automated backup configured as part of the job' },
    ],
    tags: ['service', 'recovery', 'backup'],
    featured: false,
    inStock: false,
    relatedSlugs: ['annual-maintenance'],
  },
]

export const POSTS: Post[] = [
  {
    id: 'post-1',
    slug: 'how-long-should-a-business-laptop-last',
    title: 'How long should a business laptop actually last?',
    excerpt:
      'Three to five years is a reasonable expectation, but the honest answer depends on how you use it and what you replace it for.',
    body:
      'We get asked this more than almost any other question, so here is the straightforward version.\n\nA business laptop bought for office work - email, documents, spreadsheets, browsing, video calls - should give you three to five years of comfortable use. After that the battery usually degrades faster than everything else, and by six years parts become awkward to source.\n\nThe more useful question is what you are upgrading *for*. If your current machine struggles with large spreadsheets or feels slow when many applications are open, a faster processor will help. If it struggles with anything at all, you are probably looking at a machine that has reached the end of its useful life rather than one that needs an upgrade.\n\nTwo practical notes. First, memory is usually the cheapest meaningful upgrade available. A machine with 8 GB that feels slow is very often fine with 16 GB, which costs a fraction of a replacement. Second, resist buying well above what you need. Processing power that a standard office workload never reaches is money spent on a number in a specification sheet.',
    coverImage: '/media/laptop-1.svg',
    publishedAt: '2026-09-18',
  },
  {
    id: 'post-2',
    slug: 'what-to-expect-when-you-buy-business-software',
    title: 'What to expect when you buy business software',
    excerpt:
      'The software is the cheap part. Setup, data migration and training are where implementations succeed or quietly fail.',
    body:
      'Most failed software implementations we have been called in to rescue failed for the same reason: the purchase was treated as an IT decision rather than a business change.\n\nBefore choosing anything, write down the process you actually follow today, including the awkward parts. Software should fit your way of working, not the other way round.\n\nThen insist on three things in any quote: data migration, so your existing records come across; configuration, so the software reflects your chart of accounts, your customers and your terms; and training, delivered to the people who will actually use it, at their desk, on their data.\n\nOn cost, be suspicious of a quote that only lists licences. If the vendor is not asking what your existing data looks like and how your staff currently work, they are not configuring anything - you will be.',
    coverImage: '/media/software-2.svg',
    publishedAt: '2026-09-04',
  },
  {
    id: 'post-3',
    slug: 'why-your-wifi-is-slow-in-one-room',
    title: 'Why your Wi-Fi is fine everywhere except one room',
    excerpt:
      'Signal bars in the room that works tell you very little about the room that does not.',
    body:
      'A router broadcasting into a building will not reliably reach every room. Walls, floors and metal all take signal, and the further a device sits from the router the more it loses.\n\nThe mistake is measuring once, in one room, usually near the router where everything appears perfect. The rooms that fail are typically at the opposite end of the building or on a different floor.\n\nWe survey by walking every room and testing where people actually sit. That produces a different result far more often than it does not. Sometimes the fix is repositioning the router and nothing else. Sometimes it is a second access point. Sometimes there is genuinely no good solution at that budget, and you should be told that rather than sold equipment that will not help.\n\nWireless is also not the same thing as network. A wired connection for desktops, with wireless for phones and laptops, is usually the better balance for a small office.',
    coverImage: '/media/network-2.svg',
    publishedAt: '2026-08-21',
  },
]
