// POST /api/delete-image  { passcode, public_id }  -> admin only.
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'uropsnyi';

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const { passcode, public_id } = req.body || {};

    // IMPORTANT: use the SAME env variable your api/verify.js checks.
    if (!passcode || passcode !== process.env.ADMIN_PASSCODE) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!public_id) return res.status(400).json({ error: 'Missing public_id' });

    try {
        const auth = Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString('base64');
        const params = new URLSearchParams();
        params.append('public_ids[]', public_id);
        params.append('invalidate', 'true');
        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/resources/image/upload?${params}`, {
            method: 'DELETE',
            headers: { Authorization: `Basic ${auth}` }
        });
        if (!r.ok) throw new Error(`Cloudinary ${r.status}`);
        res.status(200).json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Delete failed' });
    }
};