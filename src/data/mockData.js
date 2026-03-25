const mockData = [
  {
    id: "m1",
    title: "MacBook Pro M2 - 2023",
    pricePerDay: 1500,    
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