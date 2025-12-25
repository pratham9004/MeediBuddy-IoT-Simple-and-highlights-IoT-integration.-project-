// hooks/useRealtimeStatus.js
// Listens to /status collection to update reminders automatically
import { useEffect } from 'react';
import { db } from '../config/firebaseInit';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { notificationsShow } from '../utils/notifications';
import { mapCellToDaySlot } from '../utils/daySlotMap';
import { USER_ID } from '../config/constants';

export function useRealtimeStatus(user) {
  useEffect(() => {
    if (!user) return;

    const q = collection(db, 'iotStatus');
    const unsub = onSnapshot(q, snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'modified' || change.type === 'added') {
          const data = change.doc.data();
          const cellId = change.doc.id;
          const daySlot = mapCellToDaySlot(cellId);
          if (daySlot) {
            const { day, slot } = daySlot;
            const reminderId = `${day}_${slot}`;
            // Update reminder status in Firestore
            const reminderRef = doc(db, 'reminders', user.uid, 'schedule', reminderId);
            await updateDoc(reminderRef, { status: data.state });

            // Show notification
            if (data.state === 'taken') {
              notificationsShow('✅ Medicine Taken', 'Medicine taken successfully');
            } else if (data.state === 'missed') {
              notificationsShow('⚠️ Medicine Missed', 'Medicine not taken within 2 minutes');
            }
          }
        }
      });
    });
    return () => unsub();
  }, [user]);
}