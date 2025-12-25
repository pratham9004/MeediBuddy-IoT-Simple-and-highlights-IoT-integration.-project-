// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const SECRET = functions.config().medibuddy?.secret || 'MY_SECRET_TOKEN'; // Set via firebase functions:config:set

exports.iotUpdate = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Only POST');
    const token = req.headers['x-medi-secret'] || req.query.token;
    if (!token || token !== SECRET) return res.status(401).send('Unauthorized');

    const { cellId, event, timestamp, deviceId, userId } = req.body;
    if (!cellId || !event || !timestamp) return res.status(400).send('Missing fields');

    const ts = admin.firestore.Timestamp.fromDate(new Date(timestamp));
    // Write to iotStatus collection
    await admin.firestore().collection('iotStatus').doc(cellId).set({
      state: event,
      timestamp: ts,
      deviceId: deviceId || null
    }, { merge: true });

    // Optionally update the user's corresponding reminder(s)
    if (userId) {
      const remindersRef = admin.firestore().collection('reminders').doc(userId).collection('schedule');
      // Query pending reminders with matching cellId to mark taken/missed
      const q = await remindersRef.where('cellId', '==', cellId).where('status', '==', 'pending').get();
      const batch = admin.firestore().batch();
      q.forEach(docSnap => {
        batch.update(docSnap.ref, { status: event, updatedAt: ts });
      });
      await batch.commit();
    }

    return res.status(200).send({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ error: err.message });
  }
});