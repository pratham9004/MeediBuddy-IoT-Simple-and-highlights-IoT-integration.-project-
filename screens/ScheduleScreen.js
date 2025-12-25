import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useReminderLogic } from './ReminderScreen.logic';
import { DAYS, SLOTS } from '../config/constants';
import { db } from '../config/firebaseInit';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import { mapDaySlotToCell } from '../utils/daySlotMap';
import { useUser } from '../config/UserContext';

const ScheduleScreen = () => {
  const { user } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const { day, setDay, slot, setSlot, time, setTime, medicineName, setMedicineName, saveReminder, schedules } = useReminderLogic(user?.uid);


  const getStatusColor = (status) => {
    switch (status) {
      case 'taken':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'missed':
        return '#F44336';
      default:
        return '#16DBCB';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#16DBCB', '#E8F9F8']} style={styles.header}>
        <Animatable.Text animation="fadeInDown" style={styles.headerTitle}>
          Schedule
        </Animatable.Text>
      </LinearGradient>
      <View style={styles.content}>
        <Animatable.View animation="fadeInUp" delay={300}>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Reminder</Text>
          </TouchableOpacity>
        </Animatable.View>
        {schedules.map((reminder, index) => (
          <Animatable.View key={reminder.id} animation="fadeInUp" delay={400 + index * 100}>
            <View style={[styles.reminderCard, { borderLeftColor: getStatusColor(reminder.status), borderLeftWidth: 4 }]}>
              <View style={styles.cardContent}>
                <Ionicons name="medical" size={24} color="#16DBCB" />
                <View style={styles.textContainer}>
                  <Text style={styles.reminderTime}>{reminder.day} {reminder.slot} - {reminder.time}</Text>
                  <Text style={styles.reminderMedicine}>{reminder.medicineName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reminder.status) }]}>
                  <Text style={styles.statusText}>{reminder.status}</Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    setDay(reminder.day);
                    setSlot(reminder.slot);
                    setTime(new Date(`1970-01-01T${reminder.time.split(' ')[0]}:00`)); // Parse time
                    setMedicineName(reminder.medicineName);
                    setEditingReminder(reminder.id);
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="pencil" size={16} color="#FFFFFF" />
                  <Text style={styles.buttonTextSmall}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    Alert.alert(
                      'Delete Reminder',
                      'Are you sure you want to delete this reminder?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await deleteDoc(doc(db, 'reminders', user.uid, 'schedule', reminder.id));
                              Alert.alert('Success', 'Reminder deleted successfully!');
                            } catch (error) {
                              console.error('Error deleting reminder:', error);
                              Alert.alert('Error', 'Failed to delete reminder.');
                            }
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash" size={16} color="#FFFFFF" />
                  <Text style={styles.buttonTextSmall}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        ))}
      </View>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editingReminder ? 'Edit Reminder' : 'Add New Reminder'}</Text>
            <Text style={styles.label}>Select Day</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={day}
                onValueChange={(itemValue) => setDay(itemValue)}
                style={styles.picker}
              >
                {DAYS.map((d) => (
                  <Picker.Item key={d} label={d} value={d} />
                ))}
              </Picker>
            </View>
            <Text style={styles.label}>Select Dose Time</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={slot}
                onValueChange={(itemValue) => setSlot(itemValue)}
                style={styles.picker}
              >
                {SLOTS.map((s) => (
                  <Picker.Item key={s} label={s} value={s} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity style={styles.timeButton} onPress={() => setTimePickerVisibility(true)}>
              <Text style={styles.timeButtonText}>
                Select Time: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={(selectedTime) => {
                setTime(selectedTime);
                setTimePickerVisibility(false);
              }}
              onCancel={() => setTimePickerVisibility(false)}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter medicine name"
              value={medicineName}
              onChangeText={setMedicineName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setModalVisible(false);
                setEditingReminder(null);
              }}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addModalButton} onPress={async () => {
                if (editingReminder) {
                  // Update existing
                  await setDoc(doc(db, 'reminders', user.uid, 'schedule', editingReminder), {
                    day, slot, time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), medicineName,
                    status: 'pending',
                    cellId: mapDaySlotToCell(day, slot),
                    updatedAt: new Date()
                  });
                  setEditingReminder(null);
                } else {
                  await saveReminder();
                }
                setModalVisible(false);
              }}>
                <Text style={styles.addModalButtonText}>{editingReminder ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: '#16DBCB',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E8F9F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#555555',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addModalButton: {
    backgroundColor: '#16DBCB',
    borderRadius: 12,
    padding: 12,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  addModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E8F9F8',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#F9F9F9',
  },
  picker: {
    height: 50,
  },
  timeButton: {
    backgroundColor: '#16DBCB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  timeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  editButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 6,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 6,
  },
  buttonTextSmall: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default ScheduleScreen;
