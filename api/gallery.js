// GET /api/gallery  -> public. Returns every slideshow + style image from Cloudinary,
// so all visitors/devices see the same thing.
const CLOUD = process.env.CLOUDINARY_CLOUD_NAME || 'uropsnyi';

module.exports = async (req, res) => {
    try {
        const auth = Buffer.from(`${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`).toString('base64');
        const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/resources/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Basic ${auth}` },
            body: JSON.stringify({
                expression: 'tags=nailz_site',
                sort_by: [{ created_at: 'desc' }],
                max_results: 500,
                with_field: ['tags', 'context']
            })
        });
        if (!r.ok) throw new Error(`Cloudinary ${r.status}`);
        const data = await r.json();

        const out = { nails: [], lashes: [], training: [], styles: {} };
        for (const x of data.resources || []) {
            const tags = x.tags || [];
            const ctx = (x.context && (x.context.custom || x.context)) || {};
            const item = { id: x.public_id, title: ctx.title || '', url: x.secure_url };
            if (tags.includes('nailz_style')) {
                if (ctx.style && !out.styles[ctx.style]) out.styles[ctx.style] = { id: x.public_id, url: x.secure_url };
            } else if (tags.includes('nailz_nails')) out.nails.push({ ...item, category: 'Nails' });
            else if (tags.includes('nailz_lashes')) out.lashes.push({ ...item, category: 'Lashes' });
            else if (tags.includes('nailz_training')) out.training.push({ ...item, category: 'Training' });
        }
        res.setHeader('Cache-Control', 'no-store');
        res.status(200).json(out);
    } catch (e) {
        res.status(500).json({ error: 'Could not load gallery (' + e.message + '). Check CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in Vercel.' });
    }
};