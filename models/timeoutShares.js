// In a full scale application this would be run automatically every so often.
const prisma = import('../lib/prisma');

if (match.deleteTimestamp < Date.now()) {
	await prisma.share.delete({
		where: { url },
	});
	return false;
}
async function timeoutShareLinks() {
	const shares = await prisma.share.findMany();
	for (const share of shares) {
		if (share.deleteTimestamp < Date.now()) {
			await prisma.share.delete({
				where: { id: share.id },
			});
		}
	}
}
timeoutShareLinks();
