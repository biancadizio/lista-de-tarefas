import React, { useState, useEffect } from "react";

import { hs, vs, ms } from '../utils/responsive'; 

import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import TaskItem from "../components/TaskItem";
import { fetchInitialTasks } from "../services/api";
import { theme } from "../theme"; 
import DraggableFlatList from "react-native-draggable-flatlist";
import TaskDetailsModal from "../components/TaskDetailsModal";
import { Picker } from "@react-native-picker/picker";
import Toast, { BaseToast } from 'react-native-toast-message';
import { useWindowDimensions } from "react-native";
import CalendarView from "./CalendarView"; 


export interface Task {
  id: number;
  title: string;
  completed: boolean;
  selected?: boolean;
  priority?:
    | "text"
    | "background"
    | "modalBackground"
    | "selectorBackground"
    | "primary"
    | "secondary"
    | "inputBackground"
    | "border"
    | "danger"
    | "completedText"
    | "urgent"
    | "important"
    | "remember"
    | "no-urgency";
  type?: string;
  dueDate?: string;
  details?: string;
  relatedTasks?: number[];
}

const HomeScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false); 
  const [selectedDay, setSelectedDay] = useState<{ dateString: string; day: number; month: number; year: number; } | null>(null);

  const { width } = useWindowDimensions()

  useEffect(() => {
    const initializeTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem("tasks");
        if (!savedTasks) {
          const apiTasks = await fetchInitialTasks();
          setTasks(apiTasks);
          await AsyncStorage.setItem("tasks", JSON.stringify(apiTasks));
        } else {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
      }
    };
    initializeTasks();
  }, []);

  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
      } catch (error) {
        console.error("Erro ao salvar tarefas:", error);
      }
    };
    saveTasks();
  }, [tasks]);

const addTask = () => {
  if (taskInput.trim()) {
    const newTask: Task = {
      id: Date.now(),
      title: taskInput.trim(),
      completed: false,
      priority: "no-urgency",
      type: "others",
      dueDate: undefined, 
      details: undefined,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setTaskInput("");
    setPriorityFilter(null); 
    setTypeFilter(null);

    Toast.show({
      type: "success", 
      text1: "Tarefa Adicionada!",
      text2: `Tarefa: ${newTask.title}`,
      position: "top", 
      visibilityTime: 5000,
      autoHide: true,
      text1Style: {
        fontWeight: 800,
        fontSize: 20,
      },
      text2Style: {
        fontSize: 16
      },
    });
  } else {
    console.log('TaskInput está vazio. Nenhuma tarefa adicionada.'); 
  }
};

  const removeTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleTask = (id: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDayPress = (day: { dateString: string; day: number; month: number; year: number; }) => {
    setSelectedDay(day);
    Toast.show({
    type: "info",
    text1: "Data Selecionada!",
    text2: `Mostrando tarefas para: ${day.dateString}`,
    position: "top",
    visibilityTime: 3000,
  });
  };

  const markedDates = tasks.reduce((acc, task) => {
    if (task.dueDate) {
      acc[task.dueDate] = {marked: true, dotColor: theme.colors.primary}; 
    }
    return acc;
  }, {} as { [key: string]: { marked: boolean; dotColor: string } });


  const filteredTasks = tasks.filter(task => {
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    const matchesType = !typeFilter || task.type === typeFilter;
    let matchesDate = true; 
    if (selectedDay) { 
        matchesDate = !!task.dueDate && task.dueDate === selectedDay.dateString;
    } else {
        console.log("Nenhum selectedDay.dateString (filtro de data inativo).");
    }
    
    return matchesPriority && matchesType && matchesDate;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) {
        return 0;
      }
      if (!a.dueDate) {
        return 1; 
      }
      if (!b.dueDate) {
        return -1; 
      }

      const dateA = new Date(a.dueDate + 'T12:00:00'); 
      const dateB = new Date(b.dueDate + 'T12:00:00');

      return dateB.getTime() - dateA.getTime();

      return 0;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Tarefas</Text>
        <Text style={styles.subtitle}>Gerencie suas atividades</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={taskInput}
          onChangeText={(text) => {
            setTaskInput(text);
          }}
          placeholder="Adicionar nova tarefa"
          placeholderTextColor={theme.colors.completedText}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.calendarButton} 
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <Text style={styles.calendarButtonText}>📅</Text> 
        </TouchableOpacity>
      </View>

      <View style={[styles.filterContainer, { marginBottom:20}]} >
        <View style={styles.filterTitle}>
          <Text style={styles.subtitle}>Prioridade:</Text>
          <View style={styles.pickerContainer}>
          <Picker
            selectedValue={priorityFilter}
            onValueChange={(value) => setPriorityFilter(value)}
            style={styles.picker}
            dropdownIconColor={theme.colors.text}
            mode="dropdown"
          >
            <Picker.Item label="Todas Prioridades" value={null} />
            <Picker.Item label="Urgente" value="urgent" />
            <Picker.Item label="Importante" value="important" />
            <Picker.Item label="Lembrar" value="remember" />
            <Picker.Item label="Sem Urgência" value="no-urgency" />
          </Picker>
          </View>
        </View>
        <View style={styles.filterTitle}>
          <Text style={styles.subtitle}>Tipos:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={typeFilter}
              onValueChange={(value) => setTypeFilter(value)}
              style={styles.picker}
              dropdownIconColor={theme.colors.text}
              mode="dropdown"
            >
              <Picker.Item label="Todos Tipos" value={null} />
              <Picker.Item label="Educação" value="educational" />
              <Picker.Item label="Saúde" value="health" />
              <Picker.Item label="Profissional" value="professional" />
              <Picker.Item label="Pessoal" value="personal" />
              <Picker.Item label="Projetos" value="projects" />
              <Picker.Item label="Outros" value="others" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Renderização Condicional: Calendário OU Lista de Tarefas */}
      {showCalendar && (
        <View style={styles.calendarContainer}>
          <CalendarView
            onDayPress={handleDayPress} 
            markedDates={markedDates}   
          />
          {selectedDay && (
            <Text style={styles.selectedDateText}>
              Tarefas para: {selectedDay.dateString}
              <TouchableOpacity onPress={() => setSelectedDay(null)}>
                <Text style={styles.clearDateFilterText}> (Limpar filtro)</Text>
              </TouchableOpacity>
            </Text>
          )}
        </View>
      )}

      {!showCalendar && (
        <>
          <DraggableFlatList
            data={sortedTasks}
            renderItem={({ item, drag }) => (
              <TaskItem
                task={item}
                onToggle={() => toggleTask(item.id)}
                onDelete={() => removeTask(item.id)}
                onLongPress={drag}
                onPressDetails={() => {
                  setSelectedTask(item);
                  setModalVisible(true);
                }}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            onDragEnd={({ data }) => setTasks(data)}
            contentContainerStyle={styles.listContent}
          />

          <TaskDetailsModal
            visible={modalVisible}
            task={
              selectedTask || {
                id: 0,
                title: "",
                completed: false,
                priority: "no-urgency",
                type: "others",
              }
            }
            onSave={(updatedTask) => {
              setTasks(
                tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
              );
              setModalVisible(false);
            }}
            onClose={() => setModalVisible(false)}
            allTasks={tasks}
          />
        </>
      )}

      <Toast config={toastConfig} /> 
    </View>
  );
};

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: theme.colors.primary }}
      contentContainerStyle={{ paddingHorizontal: theme.spacing.m }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400'
      }}
    />
  ),
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: vs(32),
    paddingHorizontal: hs(24),
  },
  header: {
    marginBottom: theme.spacing.l,
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    color: theme.colors.completedText,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    gap: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
    padding: theme.spacing.m,
    borderRadius: theme.radii.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: theme.colors.secondary,
    width: 50,
    borderRadius: theme.radii.m,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: theme.spacing.l,
  },
  filterContainer: {
    flexDirection: "row",
    gap: theme.spacing.s,
    marginTop: theme.spacing.m,
  },
  filterContainerPicker: {
    flexDirection: "column",
    gap: theme.spacing.s,
    marginTop: theme.spacing.m,
  },
  filterTitle: {
    width: '50%',
    gap: theme.spacing.s,
    marginTop: theme.spacing.m,
  },
  filterButton: {
    padding: theme.spacing.s,
    borderRadius: theme.radii.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
  },
  activeFilter: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.text,
    fontSize: 12,
  },
  activeFilterText: {
    color: theme.colors.background,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radii.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: vs(50),
  },
  picker: {
    color: '#000',
    width: '100%',
    fontSize: 14,
    height: vs(40),
  },
  calendarButton: {
    backgroundColor: theme.colors.primary, 
    width: 50, 
    borderRadius: theme.radii.m,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.s, 
  },
  calendarButtonText: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  calendarContainer: {
    marginBottom: theme.spacing.l, 
    borderWidth: 1, 
    borderColor: theme.colors.border, 
    borderRadius: theme.radii.m, 
    padding: theme.spacing.s, 
  },
  selectedDateText: {
    color: theme.colors.text,
    fontSize: 16,
    marginTop: theme.spacing.s,
    textAlign: 'center',
  },
  clearDateFilterText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;