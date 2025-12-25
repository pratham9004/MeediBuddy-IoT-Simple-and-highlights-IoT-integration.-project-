import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import SummaryCard from '../components/SummaryCard';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseInit';
import { format } from 'date-fns';
import { SLOTS } from '../config/constants';
import { useUser } from '../config/UserContext';

const HomeScreen = ({ navigation }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    nextDose: 'No reminders',
    medicinesToday: 0,
    adherence: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const today = format(new Date(), 'EEEE');
      const remindersRef = collection(db, 'reminders', user.uid, 'schedule');
      const querySnapshot = await getDocs(remindersRef);
      let total = 0;
      let taken = 0;
      let pendingSlots = [];
      querySnapshot.forEach((doc) => {
        const reminder = doc.data();
        if (reminder.day === today) {
          total++;
          if (reminder.status === 'taken') taken++;
          if (reminder.status === 'pending') {
            pendingSlots.push({ slot: reminder.slot, time: reminder.time });
          }
        }
      });
      // Sort pending by slot order and get earliest
      pendingSlots.sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot));
      const nextDose = pendingSlots.length > 0 ? `${pendingSlots[0].slot} - ${pendingSlots[0].time}` : 'No reminders';
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
      setStats({ nextDose, medicinesToday: total, adherence });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#16DBCB', '#E8F9F8']} style={styles.header}>
        <Animatable.Text animation="fadeInDown" style={styles.headerTitle}>
          👋 Welcome to MediBuddy
        </Animatable.Text>
        <Animatable.Text animation="fadeInDown" delay={200} style={styles.subtext}>
          Your Smart Medicine Companion
        </Animatable.Text>
      </LinearGradient>
      <View style={styles.content}>
        <SummaryCard title="Next Dose" value={stats.nextDose} icon="💊" />
        <SummaryCard title="Medicines Today" value={stats.medicinesToday.toString()} icon="📅" />
        <SummaryCard title="Adherence %" value={`${stats.adherence}%`} icon="📊" />
        <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Schedule')}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.floatingButtonText}>Add Reminder</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 16,
    color: '#555555',
  },
  content: {
    padding: 20,
  },
  floatingButton: {
    backgroundColor: '#16DBCB',
    borderRadius: 30,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default HomeScreen;
