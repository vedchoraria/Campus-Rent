const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const approved = await p.booking.findMany({ where: { status: 'approved' }, include: { conversation: true } });
  console.log('=== APPROVED BOOKINGS ===');
  console.log('Count:', approved.length);
  for (const b of approved) {
    console.log(b.id, 'status:', b.status, 'owner:', b.ownerId, 'borrower:', b.borrowerId, 'hasConv:', !!b.conversation, 'convId:', b.conversation?.id || 'NONE');
  }
  console.log('=== ALL STATUS COUNTS ===');
  const all = await p.booking.findMany();
  const c = {};
  all.forEach(b => { c[b.status] = (c[b.status] || 0) + 1; });
  for (const [k, v] of Object.entries(c)) console.log(k + ':', v);
  console.log('=== 10 MOST RECENT ===');
  const r = await p.booking.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });
  for (const b of r) console.log(b.id.slice(0,8) + '...', b.status, new Date(b.createdAt).toISOString());
  await p.$disconnect();
})();
