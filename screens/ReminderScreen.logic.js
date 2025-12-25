// screens/ReminderScreen.logic.js
import React, { useEffect, useState } from 'react';
import { db } from '../config/firebaseInit';
import { collection, doc, setDoc, addDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { mapDaySlotToCell } from '../utils/daySlotMap';
import * as Notifications from 'expo-notifications';
import { USER_ID } from '../config/constants';

// Helper to convert Date to "HH:mm"
function formatTimeTo24h(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const mins = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${mins}`;
}

export function useReminderLogic(userId) {
  const [day, setDay] = useState('Monday');
  const [slot, setSlot] = useState('Morning');
  const [time, setTime] = useState(new Date());
  const [medicineName, setMedicineName] = useState('');
  const [schedules, setSchedules] = useState([]);

  // Listen to reminders for user
  useEffect(() => {
    if (!userId) return;
    const q = collection(db, 'reminders', userId, 'schedule');
    const unsub = onSnapshot(q, snapshot => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setSchedules(items);
    });
    return () => unsub();
  }, [userId]);

  // Save reminder
  async function saveReminder() {
    const timeStr = formatTimeTo24h(time);
    const cellId = mapDaySlotToCell(day, slot);
    const payload = {
      day,
      slot,
      time: timeStr,
      medicineName,
      status: 'pending',
      cellId,
      createdAt: serverTimestamp()
    };
    // Add doc (auto ID)
    await addDoc(collection(db, 'reminders', userId, 'schedule'), payload);
    // Schedule local notification for this specific time today/next occurrence
    scheduleLocalNotification(day, slot, timeStr, medicineName);
  }

  // Local notification scheduler
  async function scheduleLocalNotification(day, slot, timeStr, medName) {
    const [hh, mm] = timeStr.split(':').map(Number);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const targetDayIndex = daysOfWeek.indexOf(day);
    const now = new Date();
    let target = new Date(now);
    target.setHours(hh, mm, 0, 0);
    const delta = (targetDayIndex + 7 - target.getDay()) % 7;
    if (delta === 0 && target <= now) target.setDate(target.getDate() + 7);
    else target.setDate(target.getDate() + delta);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Time to take medicine',
        body: `${day} ${slot} — ${medName || 'your medicine'}`,
        data: { day, slot }
      },
      trigger: target
    });
  }

  return {
    day, setDay, slot, setSlot, time, setTime, medicineName, setMedicineName,
    saveReminder, schedules
  };
}