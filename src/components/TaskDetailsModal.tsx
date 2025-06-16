// src/components/TaskDetailsModal.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme';
import { Task } from '../types/types';

interface TaskDetailsModalProps {
  visible: boolean;
  task: Task;
  onSave: (updatedTask: Task) => void;
  onClose: () => void;
  allTasks: Task[];
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  visible,
  task,
  onSave,
  onClose,
  allTasks,
}) => {
  const [formData, setFormData] = useState<Task>(task);  
  const [customValue, setCustomValue] = useState(''); // Armazena valor personalizado digitado pelo usuário (em dias)
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Quando o modal abre, inicializa os estados
  useEffect(() => {
    setFormData(task);

    // Se a task tiver um tipo não padronizado, tratamos como ''
    if (!['0', '1', '7', '30', '180', '365'].includes(task.recurrence || '')) {
      setCustomValue(task.recurrence || '');
      setFormData((prev) => ({ ...prev, recurrence: ''}));
    } else {
      setCustomValue('');
    }
  }, [task]);

  // Lida com a seleção no Picker
  const handlePickerChange = (value: string) => {
    setFormData({ ...formData, recurrence: value });

    // Se a escolha for 'custom', deixamos o valor anterior como está
    if (value !== 'custom') {
      setCustomValue('');
    }
  };
  
  // Atualiza valor personalizado manualmente digitado
  const handleCustomValueChange = (value: string) => {
    setCustomValue(value);
  };

 
  // Ao salvar, se for personalizado, usamos customValue como type
  const handleSave = () => {
    const finalType =
      formData.recurrence === 'custom' && !isNaN(parseInt(customValue))
        ? parseInt(customValue).toString()
        : formData.recurrence;

    onSave({ ...formData, recurrence: finalType });
  };


  const handleClose = () => {
    setFormData(task); // Reset form to original task data
    setCustomValue('');
    onClose(); // Close modal
  };

  // Helper for web input value format (yyyy-mm-dd)
  const getWebDateValue = () => {
    if (!formData.dueDate) return '';
    // ISO string is like 2023-05-10T00:00:00.000Z - we want just yyyy-mm-dd
    return formData.dueDate.split('T')[0];
  };

  // Ver questão da periodicidade
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        {/* Press outside modal to close */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Detalhes da Task</Text>

          <TextInput
            style={styles.input}
            placeholder="Título"
            placeholderTextColor={theme.colors.completedText}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />

          <Picker
            selectedValue={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
            style={styles.picker}
            dropdownIconColor={theme.colors.text}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Selecione Prioridade" value={null} />
            <Picker.Item label="Urgente" value="urgent" />
            <Picker.Item label="Importante" value="important" />
            <Picker.Item label="Lembrar" value="remember" />
            <Picker.Item label="Sem Urgência" value="no-urgency" />
          </Picker>

          {Platform.OS === 'web' ? (
            // Web native date input
            <input
              type="date"
              value={getWebDateValue()}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })
              }
              style={{
                  backgroundColor: theme.colors.background,
                  padding: theme.spacing.m,
                  borderRadius: theme.radii.m,
                  marginBottom: theme.spacing.m,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  color: "white"
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>
                  {formData.dueDate
                    ? new Date(formData.dueDate).toLocaleDateString()
                    : 'Selecionar Data'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={formData.dueDate ? new Date(formData.dueDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      setFormData({ ...formData, dueDate: date.toISOString() });
                    }
                  }}
                />
              )}
            </>
          )}

          <Picker
            selectedValue={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            style={styles.picker}
            dropdownIconColor={theme.colors.text}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Selecione Tipo" value={null} />
            <Picker.Item label="Profissional" value="professional" />
            <Picker.Item label="Pessoal" value="personal" />
            <Picker.Item label="Saúde" value="health" />
            <Picker.Item label="Educacional" value="educational" />
            <Picker.Item label="Projetos" value="projects" />
            <Picker.Item label="Outros" value="others" />
          </Picker>


          <Picker
            selectedValue={formData.recurrence}
            onValueChange={handlePickerChange}
            style={styles.picker}
            dropdownIconColor={theme.colors.text}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Selecione Periodicidade" value={null} />
            <Picker.Item label="Não se repete" value="0" />
            <Picker.Item label="A cada dia" value="1" />
            <Picker.Item label="A cada semana" value="7" />
            <Picker.Item label="A cada mês" value="30" />
            <Picker.Item label="A cada semestre" value="180" />
            <Picker.Item label="A cada ano" value="365" />
            <Picker.Item label="Outro (personalizado)" value="custom" />
          </Picker>
          
          {/* Campo visível somente se o usuário escolher "Outro" */}
          {formData.recurrence  === 'custom' && (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Digite o número de dias"
            value={customValue}
            onChangeText={handleCustomValueChange}
          />
          )}

          <TextInput
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Detalhes"
            placeholderTextColor={theme.colors.completedText}
            multiline
            value={formData.details}
            onChangeText={(text) => setFormData({ ...formData, details: text })}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
              
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  modalContent: {
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.radii.l,
    padding: theme.spacing.l,
    borderWidth: 1,
    borderColor: theme.colors.border,
    zIndex: 1, // Ensure content is above the Pressable
  },
  modalTitle: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    borderRadius: theme.radii.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    fontSize: 16,
  },
  picker: {
    backgroundColor: theme.colors.selectorBackground,
    borderRadius: theme.radii.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    color: theme.colors.text,
    borderColor: theme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pickerItem: {
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    fontSize: 16,
  },
  dateButton: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
    borderRadius: theme.radii.m,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateButtonText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.m,
    marginTop: theme.spacing.m,
  },
  button: {
    flex: 1,
    padding: theme.spacing.m,
    borderRadius: theme.radii.m,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: theme.colors.danger,
  },
  buttonText: {
    color: theme.colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TaskDetailsModal;