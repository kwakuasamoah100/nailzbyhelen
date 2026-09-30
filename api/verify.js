export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { passcode } = req.body;
    const correctPasscode = process.env.ADMIN_PASSCODE;

    if (passcode && passcode === correctPasscode) {
        return res.status(200).json({ success: true });
    }

    return res.status(401).json({ success: false, message: 'Invalid passcode' });
}