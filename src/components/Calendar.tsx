// src/components/CalendarView.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { Task } from '../types';

interface CalendarViewProps {
  tasks: Task[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const markedDates = tasks.reduce((acc, task) => {
    if (task.dueDate) {
      acc[task.dueDate] = {
        marked: true,
        dotColor: task.completed ? 'green' : 'red',
        selectedColor: 'blue'
      };
    }
    return acc;
  }, {} as Record<string, any>);
  const newTask: Task = {
    id: Date.now(), 
    title: "",
    completed: false,
    dueDate: new Date().toISOString()
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 20, textAlign: 'center', marginVertical: 10 }}>
        Calendário de Tarefas
      </Text>
      <Calendar
        markedDates={markedDates}
        onDayPress={(day) => {
          console.log('Dia selecionado:', day.dateString);
        }}
      />
    </View>
  );
};

export default CalendarView;
