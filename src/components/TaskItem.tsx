import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { theme } from "../theme"; // [MUDANÇA 1] Confirmado este caminho.

type ThemeColors = keyof typeof theme.colors;

interface Task {
  id: number;
  title: string;
  completed: boolean;
  selected?: boolean;
  priority?: ThemeColors;
  type?: string;
  dueDate?: string;
  details?: string;
  relatedTasks?: number[];
}

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onLongPress: () => void;
  onPressDetails: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggle, 
  onDelete, 
  onLongPress,
  onPressDetails
}) => {
  return (
    <TouchableOpacity 
      onLongPress={onLongPress}
      style={[
        styles.taskContainer,
        task.selected && styles.selectedTask,
        task.priority && { borderColor: theme.colors[task.priority] }
      ]}
    >
      <TouchableOpacity onPress={onToggle} style={styles.checkBox}>
        <Text style={styles.checkIcon}>{task.completed ? "✓" : "○"}</Text>
      </TouchableOpacity>

      {/* [MUDANÇA 2] NOVO BLOCO: taskContent - para agrupar título e meta-informações */}
      <View style={styles.taskContent}> 
        <Text style={[styles.taskText, task.completed && styles.completed]}>
          {task.title}
        </Text>

        {/* [MUDANÇA 3] NOVO BLOCO: taskMetaContainer - para Tipo e Data de Vencimento */}
        <View style={styles.taskMetaContainer}>
          {task.type && ( // Condicionalmente exibe se 'type' existe
            <Text style={styles.taskMetaText}>Tipo: {task.type}</Text> // [MUDANÇA 4] NOVO TEXTO: Exibe o tipo
          )}
          {task.dueDate && ( // Condicionalmente exibe se 'dueDate' existe
            <Text style={styles.taskMetaText}>Vencimento: {task.dueDate}</Text> // [MUDANÇA 5] NOVO TEXTO: Exibe a data de vencimento
          )}
        </View>
      </View>
      {/* Fim da MUDANÇA 2 e MUDANÇA 3 */}

      {task.priority && (
        <View style={[
          styles.priorityTag,
          { backgroundColor: theme.colors[task.priority] }
        ]}>
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
      )}

      <TouchableOpacity onPress={onPressDetails} style={styles.detailsButton}>
        <Text style={styles.detailsText}>Detalhes</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.m,
    marginVertical: theme.spacing.s,
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radii.m,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTask: {
    borderColor: theme.colors.primary,
  },
  checkBox: {
    marginRight: theme.spacing.m,
  },
  checkIcon: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: "bold",
  },
  taskContent: { // [MUDANÇA 6] NOVO ESTILO
    flex: 1, 
  },
  taskText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  completed: {
    textDecorationLine: "line-through",
    color: theme.colors.completedText,
  },
  taskMetaContainer: { // [MUDANÇA 7] NOVO ESTILO
    flexDirection: 'row', 
    marginTop: theme.spacing.s,
    gap: theme.spacing.s, 
  },
  taskMetaText: { // [MUDANÇA 8] NOVO ESTILO
    color: theme.colors.completedText, 
    fontSize: 12,
  },
  deleteButton: {
    marginLeft: theme.spacing.m,
    padding: theme.spacing.s,
  },
  deleteText: {
    color: theme.colors.danger,
    fontSize: 18,
    fontWeight: "bold",
  },
  priorityTag: {
    paddingHorizontal: theme.spacing.s,
    borderRadius: theme.radii.s,
    marginLeft: theme.spacing.s,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsButton: {
    marginLeft: theme.spacing.m,
    padding: theme.spacing.s,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radii.s,
  },
  detailsText: {
    color: theme.colors.text,
    fontSize: 12,
  },
});

export default TaskItem;