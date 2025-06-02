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

const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

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
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

const addTask = () => {
  if (taskInput.trim()) {
    const newTask: Task = {
      id: Date.now(),
      title: taskInput.trim(),
      completed: false,
      priority: "no-urgency", // Valor padrão
      type: "others", // Valor padrão
    };
    setTasks([...tasks, newTask]);
    setTaskInput("");
    setFilter(null); // Resetar filtros
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

const filteredTasks = () => {
  if (!filter) return tasks;
  
  if (filter === "priority") {
    return tasks.filter((task) => task.priority && task.priority !== "no-urgency");
  }
  
  if (filter === "type") {
    return tasks.filter((task) => task.type && task.type !== "others");
  }
  
  return tasks;
};

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
          onChangeText={setTaskInput}
          placeholder="Adicionar nova tarefa"
          placeholderTextColor={theme.colors.completedText}
          onSubmitEditing={addTask}
        />
        <TouchableOpacity style={styles.addButton} onPress={addTask}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      
<View style={styles.filterContainer}>
  <TouchableOpacity
    style={[
      styles.filterButton,
      filter === "priority" && styles.activeFilter,
    ]}
    onPress={() => setFilter(filter === "priority" ? null : "priority")}
  >
    <Text style={[
      styles.filterText,
      filter === "priority" && styles.activeFilterText
    ]}>
      Prioridade
    </Text>
  </TouchableOpacity>
  
  <TouchableOpacity
    style={[
      styles.filterButton,
      filter === "type" && styles.activeFilter,
    ]}
    onPress={() => setFilter(filter === "type" ? null : "type")}
  >
    <Text style={[
      styles.filterText,
      filter === "type" && styles.activeFilterText
    ]}>
      Tipo
    </Text>
  </TouchableOpacity>
</View>

      <DraggableFlatList
        data={filteredTasks()}
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
    </View>
  );
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
});

export default HomeScreen;
