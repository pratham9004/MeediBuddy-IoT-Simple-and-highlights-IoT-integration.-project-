// screens/Analytics.logic.js
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebaseInit';
import { useUser } from '../config/UserContext';

export function useAnalytics() {
  const { user } = useUser();
  const [stats, setStats] = useState({ taken: 0, missed: 0, pending: 0, total: 0 });
  useEffect(() => {
    if (user) {
      const col = collection(db, 'reminders', user.uid, 'schedule');
      const unsub = onSnapshot(col, snapshot => {
        let taken = 0, missed = 0, pending = 0;
        snapshot.docs.forEach(d => {
          const s = d.data().status;
          if (s === 'taken') taken++;
          else if (s === 'missed') missed++;
          else pending++;
        });
        setStats({ taken, missed, pending, total: taken + missed + pending });
      });
      return () => unsub();
    }
  }, [user]);
  return stats;
}