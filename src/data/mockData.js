import { BOOKING_STATUS } from "../constants/bookingStatus.js";

export const userBookings = [
  {
    id: "b_p1",
    itemId: "m5",
    title: "Canon AE-1 Program",
    image: "blue",
    start: "2026-04-18",
    end: "2026-04-21",
    status: BOOKING_STATUS.pending,
    owner: "Priya S.",
    requester: "Anika Shah",
    submittedAt: "2026-04-14",
    totalAmount: 2800,
    depositAmount: 4000
  },
  {
    id: "b_p2",
    itemId: "m4",
    title: "North Face Stormbreak 2",
    image: "teal",
    start: "2026-04-22",
    end: "2026-04-24",
    status: BOOKING_STATUS.pending,
    owner: "Omar K.",
    requester: "Ravi Malhotra",
    submittedAt: "2026-04-13",
    totalAmount: 1900,
    depositAmount: 3000
  },
  {
    id: "b_u1",
    itemId: "m5",
    title: "Canon AE-1 Program",
    image: "blue",
    start: "2026-04-20",
    end: "2026-04-23",
    status: BOOKING_STATUS.upcoming,
    owner: "Priya S.",
    pickupAt: "2026-04-20T10:00:00",
    totalAmount: 3000,
    depositAmount: 4000
  },
  {
    id: "b_o1",
    itemId: "m3",
    title: "Sony WH-1000XM5",
    image: "coral",
    start: "2026-04-10",
    end: "2026-04-15",
    status: BOOKING_STATUS.ongoing,
    owner: "Samira Patel",
    totalAmount: 3200,
    depositAmount: 5000
  },
  {
    id: "b_o2",
    itemId: "m1",
    title: "MacBook Pro M2 - 2023",
    image: "blue",
    start: "2026-04-12",
    end: "2026-04-16",
    status: BOOKING_STATUS.ongoing,
    owner: "Alex Rivera",
    totalAmount: 6000,
    depositAmount: 25000
  },
  {
    id: "b_c1",
    itemId: "m6",
    title: "Organic Chemistry 8th Ed",
    image: "coral",
    start: "2026-03-20",
    end: "2026-03-27",
    status: BOOKING_STATUS.completed,
    owner: "Ravi Malhotra",
    returnedAt: "2026-03-28"
  },
  {
    id: "b_c2",
    itemId: "m2",
    title: "DJI Mini 3 Drone",
    image: "blue",
    start: "2026-03-30",
    end: "2026-04-03",
    status: BOOKING_STATUS.completed,
    owner: "Jenny L.",
    returnedAt: "2026-04-04"
  }
];

export const mockUsers = [
  {
    id: "u_12345",
    full_name: "Alex Rivera",
    email: "alex.rivera@northcampus.edu",
    bio: "Currently a Senior at North Campus specializing in Sustainable Design. I started using CampusRent to help peers get access to professional tools. I take great care of my gear and expect the same!",
    rating: 4.9,
    reviews_count: 32,
    campus: "North Campus",
    major: "Design Engineering",
    items_lent: 42,
    items_borrowed: 12,
    preferred_pickup_zones: ["Library Cafe", "North Campus Dorms", "The Quad"]
  },
  {
    id: "u_67890",
    full_name: "Samira Patel",
    email: "samira.p@artsdistrict.edu",
    bio: "Photography major! Always looking to rent out my lenses when I'm not using them. Reach out if you need advice on gear.",
    rating: 5.0,
    reviews_count: 14,
    campus: "Arts District",
    major: "Photography & Media",
    items_lent: 15,
    items_borrowed: 3,
    preferred_pickup_zones: ["Arts Studio 4", "Central Garden"]
  }
];

const mockData = [
  {
    id: "m1",
    title: "MacBook Pro M2 - 2023",
    pricePerDay: 1500,
    securityDeposit: 25000,
    mrp: 120000,
    rating: 4.9,
    reviewsCount: 32,
    location: "Arts District",
    category: "Tech",
    isVerified: true,
    availability: "Available Now",
    images: ["blue", "purple", "teal"],
    dateAdded: "2023-10-15T08:00:00Z",
    description: "Like-new MacBook Pro M2, perfect for video editing or heavy programming tasks. Comes with charger and protective sleeve.",
    bookings: [
      { start: "2026-03-27", end: "2026-03-29" }
    ]
  },
  {
    id: "m2",
    title: "Sony Alpha A7 III + 35mm",
    pricePerDay: 2500,
    securityDeposit: 15000,
    mrp: 180000,
    rating: 4.8,
    reviewsCount: 18,
    location: "Arts District",
    category: "Tech",
    isVerified: true,
    availability: "Available Now",
    images: ["teal", "coral", "blue"],
    dateAdded: "2023-10-10T08:00:00Z",
    description: "Excellent full-frame mirrorless camera. Includes a sharp 35mm f/1.8 lens, perfect for portraits and street photography on campus.",
    bookings: []
  },
  {
    id: "m3",
    title: "Sony WH-1000XM5",
    pricePerDay: 800,
    securityDeposit: 5000,
    mrp: 29000,
    rating: 5.0,
    reviewsCount: 45,
    location: "Central Library",
    category: "Tech",
    isVerified: true,
    availability: "Not Available",
    images: ["coral", "purple", "teal"],
    dateAdded: "2023-10-14T08:00:00Z",
    description: "Industry-leading noise cancellation. Ideal for deep focus sessions at the library. Battery lasts up to 30 hours.",
    bookings: [
      { start: "2026-03-20", end: "2026-03-30" }
    ]
  },
  {
    id: "m4",
    title: "North Face Stormbreak 2",
    pricePerDay: 1200,
    securityDeposit: 3000,
    mrp: 14000,
    rating: 4.7,
    reviewsCount: 21,
    location: "North Campus",
    category: "Adventure",
    isVerified: false,
    availability: "Available Now",
    images: ["teal", "blue", "coral"],
    dateAdded: "2023-10-05T08:00:00Z",
    description: "Classic 2-person tent, easy to pitch and great for weekend camping trips. Includes footprint and rainfly.",
    bookings: []
  },
  {
    id: "m5",
    title: "Canon AE-1 Program",
    pricePerDay: 1000,
    securityDeposit: 4000,
    mrp: 18000,
    rating: 4.6,
    reviewsCount: 14,
    location: "South Dorms",
    category: "Tech",
    isVerified: true,
    availability: "Available Now",
    images: ["blue", "teal", "purple"],
    dateAdded: "2023-10-01T08:00:00Z",
    description: "A legendary vintage 35mm film camera. Comes with a 50mm f/1.8 lens. Note: Film is not included.",
    bookings: []
  },
  {
    id: "m6",
    title: "Organic Chemistry 8th Ed",
    pricePerDay: 500,
    securityDeposit: 1000,
    mrp: 6000,
    rating: 4.5,
    reviewsCount: 8,
    location: "Central Library",
    category: "Books",
    isVerified: false,
    availability: "Available Now",
    images: ["coral", "purple", "blue"],
    dateAdded: "2023-10-12T08:00:00Z",
    description: "Required textbook for CHEM 201/202. Hardcover, some highlighting in early chapters but entirely readable.",
    bookings: []
  }
];

export default mockData;
