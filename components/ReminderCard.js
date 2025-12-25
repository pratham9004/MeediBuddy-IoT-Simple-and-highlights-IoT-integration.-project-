import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ReminderCard = ({ time, medicine, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Taken':
        return '#4CAF50';
      case 'Pending':
        return '#FF9800';
      case 'Missed':
        return '#F44336';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.medicine}>{medicine}</Text>
      </View>
      <View style={[styles.status, { backgroundColor: getStatusColor(status) }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  time: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0096C7',
  },
  medicine: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ReminderCard;
