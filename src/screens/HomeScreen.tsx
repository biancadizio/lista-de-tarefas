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
import SearchInput from "../components/SearchBar";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App"; // path to where you defined the type



export interface Task {
  id: number;
  title: string;
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Home">>();
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
      };
      setTasks([...tasks, newTask]);
      setTaskInput("");
    }
  };

  const addLog = async (log: { id: string; taskId: number; action: string, title: string; timestamp: number }) => {
    try {
      const existing = await AsyncStorage.getItem("taskLogs");
      const logs = existing ? JSON.parse(existing) : [];
      logs.push(log);
      await AsyncStorage.setItem("taskLogs", JSON.stringify(logs));
    } catch (e) {
      console.error("Error saving log:", e);
    }
  };

  const removeTask = (id: number) => {
    setTasks((prevTasks) => {
      const taskToComplete = prevTasks.find((task) => task.id === id);
      if (!taskToComplete) return prevTasks;

      // Logar
      addLog({
        id: Date.now().toString(),
        taskId: id,
        title: taskToComplete.title,
        action: "deleted",
        timestamp: Date.now(),
      });

      // Remover da lista
      return prevTasks.filter((task) => task.id !== id);
    });
  };


  const toggleTask = (id: number) => {
    setTasks((prevTasks) => {
      const taskToComplete = prevTasks.find((task) => task.id === id);
      if (!taskToComplete) return prevTasks;

      // Logar
      addLog({
        id: Date.now().toString(),
        taskId: id,
        title: taskToComplete.title,
        action: "completed",
        timestamp: Date.now(),
      });

      // Remover da lista
      return prevTasks.filter((task) => task.id !== id);
    });
  };

  const filteredTasks = () => {
    let nameSearchedTasks: Task[] = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()))
    if(!filter) return nameSearchedTasks;
    return nameSearchedTasks.filter((task) => task[filter as keyof Task]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity style={styles.navigationButton} onPress={() => navigation.navigate("Logs")}>
        <Text style={styles.navigationButtonText}>Ver Log</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Minhas Tarefas</Text>

        <Text style={styles.subtitle}>Gerencie suas atividades</Text>

      </View>
      <SearchInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Pesquisar tarefas..."
        placeholderTextColor={theme.colors.completedText}
      />

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
            <Text style={styles.filterText}>Prioridade</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === "type" && styles.activeFilter,
            ]}
            onPress={() => setFilter(filter === "type" ? null : "type")}
          >
            <Text style={styles.filterText}>Tipo</Text>
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
        contentContainerStyle={[styles.listContent, {flexGrow: 1}]}
      />

      <TaskDetailsModal
        visible={modalVisible}
        task={
          selectedTask || {
            id: 0,
            title: "",
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
    </SafeAreaView>
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
  },
  activeFilter: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    color: theme.colors.text,
    fontSize: 12,
  },
  navigationButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.s,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start', // prevent it from stretching full width
  },
  navigationButtonText: {
    color: theme.colors.text,
    fontSize: 16,
  }
});

export default HomeScreen;
