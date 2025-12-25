import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { db, auth } from '../config/firebaseInit';
import { SLOTS, DAYS } from '../config/constants';
import { format } from 'date-fns';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({ name: '', email: '', createdAt: null });
  const [editableName, setEditableName] = useState('');
  const [profileStats, setProfileStats] = useState({ adherence: 0, nextDose: 'No reminders' });
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchProfileStats();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserData(data);
        setEditableName(data.name);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchProfileStats = async () => {
    try {
      const remindersRef = collection(db, 'reminders', user.uid, 'schedule');
      const querySnapshot = await getDocs(remindersRef);
      let total = 0;
      let taken = 0;
      const allReminders = [];
      querySnapshot.forEach((doc) => {
        const reminder = doc.data();
        allReminders.push(reminder);
        total++;
        if (reminder.status === 'taken') taken++;
      });
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

      // Find next dose: earliest pending reminder
      const pendingReminders = allReminders.filter(r => r.status === 'pending');
      // Sort by day, then slot
      pendingReminders.sort((a, b) => {
        const dayA = DAYS.indexOf(a.day);
        const dayB = DAYS.indexOf(b.day);
        if (dayA !== dayB) return dayA - dayB;
        return SLOTS.indexOf(a.slot) - SLOTS.indexOf(b.slot);
      });
      const nextDose = pendingReminders.length > 0 ? `${pendingReminders[0].day} ${pendingReminders[0].slot} - ${pendingReminders[0].time}` : 'No reminders';

      setProfileStats({ adherence, nextDose });
    } catch (error) {
      console.error('Error fetching profile stats:', error);
    }
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, { name: editableName });
      setUserData({ ...userData, name: editableName });
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Navigation will be handled by auth state listener
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#16DBCB', '#E8F9F8']} style={styles.header}>
        <Animatable.Text animation="fadeInDown" style={styles.headerTitle}>
          Profile
        </Animatable.Text>
      </LinearGradient>
      <View style={styles.content}>
        <Animatable.View animation="fadeInUp" delay={300} style={styles.profileCard}>
          <Ionicons name="person-circle" size={80} color="#16DBCB" />
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={editableName}
            onChangeText={setEditableName}
            placeholder="Enter your name"
          />
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData.email}</Text>
          <Text style={styles.label}>Joined On</Text>
          <Text style={styles.value}>
            {userData.createdAt ? format(userData.createdAt.toDate(), 'MMM dd, yyyy') : 'N/A'}
          </Text>
          <Text style={styles.adherence}>Adherence: {profileStats.adherence}%</Text>
          <Text style={styles.nextDose}>Next Dose: {profileStats.nextDose}</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </Animatable.View>
        <Animatable.View animation="fadeInUp" delay={400}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => console.log('Firebase Connected')}>
            <Ionicons name="cloud-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Connect to Firebase</Text>
          </TouchableOpacity>
        </Animatable.View>
        <Animatable.View animation="fadeInUp" delay={500}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="settings-outline" size={20} color="#16DBCB" />
            <Text style={styles.secondaryButtonText}>App Settings</Text>
          </TouchableOpacity>
        </Animatable.View>
        <Animatable.View animation="fadeInUp" delay={600}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#555555',
    marginTop: 5,
  },
  adherence: {
    fontSize: 16,
    color: '#16DBCB',
    marginTop: 10,
    fontWeight: 'bold',
  },
  nextDose: {
    fontSize: 14,
    color: '#555555',
    marginTop: 5,
  },
  primaryButton: {
    backgroundColor: '#16DBCB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#16DBCB',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  secondaryButtonText: {
    color: '#16DBCB',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555555',
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8F9F8',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    width: '100%',
    marginTop: 5,
  },
  value: {
    fontSize: 16,
    color: '#222222',
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
    width: '100%',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
