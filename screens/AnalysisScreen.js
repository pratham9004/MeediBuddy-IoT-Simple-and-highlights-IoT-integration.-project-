import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, StackedBarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAnalytics } from './Analytics.logic';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../config/firebaseInit';
import { useUser } from '../config/UserContext';

const AnalysisScreen = () => {
  const { user } = useUser();
  const screenWidth = Dimensions.get('window').width;
  const { taken, missed, pending, total } = useAnalytics();
  const [weeklyData, setWeeklyData] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
    barColors: ['#4CAF50', '#F44336']
  });

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'weekly_stats'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const takenData = [0, 0, 0, 0, 0, 0, 0];
        const missedData = [0, 0, 0, 0, 0, 0, 0];
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const dayIndex = days.indexOf(data.day);
          if (dayIndex !== -1) {
            takenData[dayIndex] = data.taken || 0;
            missedData[dayIndex] = data.missed || 0;
          }
        });

        const stackedData = takenData.map((taken, index) => [taken, missedData[index]]);

        setWeeklyData({
          labels: days,
          data: stackedData,
          barColors: ['#4CAF50', '#F44336']
        });
      });
      return () => unsubscribe();
    }
  }, [user]);

  const data = [
    {
      name: 'Taken',
      population: taken,
      color: '#4CAF50',
      legendFontColor: '#222222',
      legendFontSize: 15,
    },
    {
      name: 'Missed',
      population: missed,
      color: '#F44336',
      legendFontColor: '#222222',
      legendFontSize: 15,
    },
    {
      name: 'Pending',
      population: pending,
      color: '#FF9800',
      legendFontColor: '#222222',
      legendFontSize: 15,
    },
  ];

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(22, 219, 203, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#16DBCB', '#E8F9F8']} style={styles.header}>
        <Animatable.Text animation="fadeInDown" style={styles.headerTitle}>
          Medicine Adherence Analysis
        </Animatable.Text>
      </LinearGradient>
      <View style={styles.content}>
        <Animatable.Text animation="fadeInUp" delay={300} style={styles.sectionTitle}>
          Weekly Medicine Stats
        </Animatable.Text>
        <Animatable.View animation="fadeInUp" delay={400}>
          <PieChart
            data={data}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Animatable.View>
        <Animatable.View animation="fadeInUp" delay={500} style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="medical" size={24} color="#16DBCB" />
            <Text style={styles.statTitle}>Total Doses</Text>
            <Text style={styles.statValue}>{data[0].population + data[1].population}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.statTitle}>Taken</Text>
            <Text style={styles.statValue}>{data[0].population}</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="close-circle" size={24} color="#F44336" />
            <Text style={styles.statTitle}>Missed</Text>
            <Text style={styles.statValue}>{data[1].population}</Text>
          </View>
        </Animatable.View>
        <Animatable.Text animation="fadeInUp" delay={600} style={styles.sectionTitle}>
          Weekly Medicine Summary
        </Animatable.Text>
        <Animatable.View animation="fadeInUp" delay={700}>
          <StackedBarChart
            data={weeklyData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForBackgroundLines: { strokeWidth: 1 },
            }}
            style={{ marginVertical: 10, borderRadius: 12 }}
          />
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
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 12,
    color: '#555555',
    marginTop: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16DBCB',
    marginTop: 4,
  },
});

export default AnalysisScreen;
