import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebaseInit';
import { format } from 'date-fns';
import { SLOTS } from '../config/constants';
import { useUser } from '../config/UserContext';

const ReminderScreen = () => {
  const { user } = useUser();
  const [todayReminders, setTodayReminders] = useState([]);

  useEffect(() => {
    if (user) {
      fetchTodayReminders();
    }
  }, [user]);

  const fetchTodayReminders = async () => { 
    try {
      const today = format(new Date(), 'EEEE'); // Full day name
      const remindersRef = collection(db, 'reminders', user.uid, 'schedule');
      const querySnapshot = await getDocs(remindersRef);
      const todaySlots = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.day === today) {
          todaySlots.push({ id: doc.id, ...data });
        }
      });
      // Sort by slot order
      todaySlots.sort((a, b) => SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot));
      setTodayReminders(todaySlots);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const markReminder = async (id, status) => {
    try {
      await updateDoc(doc(db, 'reminders', user.uid, 'schedule', id), { status });
      Alert.alert('Success', `Dose ${status === 'taken' ? 'recorded successfully!' : 'marked as missed.'}`);
      fetchTodayReminders(); // Refresh the list
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert('Error', 'Failed to update reminder. Please try again.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Taken':
        return 'checkmark-circle';
      case 'Pending':
        return 'time';
      case 'Missed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Taken':
        return '#4CAF50';
      case 'Pending':
        return '#FF9800';
      case 'Missed':
        return '#F44336';
      default:
        return '#16DBCB';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#16DBCB', '#E8F9F8']} style={styles.header}>
        <Animatable.Text animation="fadeInDown" style={styles.headerTitle}>
          Today's Reminders
        </Animatable.Text>
      </LinearGradient>
      <View style={styles.content}>
        <Animatable.View animation="fadeInUp" delay={300}>
          {todayReminders.length > 0 ? (
            todayReminders.map((reminder, index) => (
              <Animatable.View key={reminder.id} animation="fadeInUp" delay={400 + index * 100}>
                <View style={styles.reminderCard}>
                  <View style={styles.cardContent}>
                    <Ionicons name="medical" size={24} color="#16DBCB" />
                    <View style={styles.textContainer}>
                      <Text style={styles.reminderTime}>{reminder.slot} - {reminder.time}</Text>
                      <Text style={styles.reminderMedicine}>{reminder.medicineName}</Text>
                    </View>
                    <View style={[styles.statusContainer, { backgroundColor: getStatusColor(reminder.status) }]}>
                      <Ionicons name={getStatusIcon(reminder.status)} size={16} color="#FFFFFF" />
                      <Text style={styles.statusText}>{reminder.status}</Text>
                    </View>
                  </View>
                  {reminder.status === 'pending' && (
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.markButtonTaken}
                        onPress={() => markReminder(reminder.id, 'taken')}
                      >
                        <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.markButtonText}>Mark as Taken</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.markButtonMissed}
                        onPress={() => markReminder(reminder.id, 'missed')}
                      >
                        <Ionicons name="close-circle" size={16} color="#FFFFFF" />
                        <Text style={styles.markButtonText}>Mark as Missed</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </Animatable.View>
            ))
          ) : (
            <View style={styles.noRemindersContainer}>
              <Ionicons name="calendar-outline" size={64} color="#CCCCCC" />
              <Text style={styles.noRemindersText}>No reminders for today</Text>
              <Text style={styles.noRemindersSubtext}>Add some reminders in the Schedule tab</Text>
            </View>
          )}
        </Animatable.View>
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
  },
  content: {
    padding: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#16DBCB',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555555',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  reminderTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
  },
  reminderMedicine: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  markButtonTaken: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 6,
  },
  markButtonMissed: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 6,
  },
  markButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  noRemindersContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noRemindersText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555555',
    marginTop: 16,
  },
  noRemindersSubtext: {
    fontSize: 14,
    color: '#888888',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ReminderScreen;
