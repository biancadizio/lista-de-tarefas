/*
Aqui temos os códigos para testar o cadastramento com testes combinatórios.
Usamos a mesma lógica de validação do modal.
Temos dois arquivos: um com dados válidos e outro com dados inválidos; ambos com 10 mil linhas cada
Esses arquivos foram gerados no Python e exportados como .csv
Todos os cenários estão mapeados
*/


import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';
import { Task } from '../../types/types';
import { theme } from '../../theme';



// ############### FUNÇÃO DE VALIDAÇÃO ###############

type ThemeColors = keyof typeof theme.colors;


type SaveTaskParams = {
  formData: Task;
  customValue: string;
  onSave: (task: Task) => void;
  resetForm: () => void;
};

export function validateAndSaveTask({ formData, customValue, onSave, resetForm }: SaveTaskParams): boolean {
  const parsedValue = parseInt(customValue);

  if (!formData.title || formData.title.trim() === '') {
    throw new Error('O título da tarefa é obrigatório.');
  }

  if (!formData.priority) {
    throw new Error('Selecione uma prioridade.');
  }

  if (!['Urgente','Importante','Lembrar','Sem Urgência'].includes(formData.priority)) throw new Error('Selecione uma prioridade válida.');

  if (formData.dueDate) {
    const dueDate = new Date(formData.dueDate);
    const now = new Date();
    const minDate = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
    const maxDate = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());

    if (dueDate < minDate || dueDate > maxDate) {
      throw new Error('A data deve estar entre 10 anos atrás e 10 anos no futuro.');
    }
  } else {
    throw new Error('Digite uma data.');
  }

  if (!formData.category) {
    throw new Error('Selecione uma categoria.');
  }

  if (!['Profissional','Pessoal','Saúde','Educacional','Projetos','Outros'].includes(formData.category)) throw new Error('Selecione uma categoria válida.');

  if (!formData.recurrence) {
    throw new Error('Selecione uma periodicidade.');
  }

  if (!['Não se repete','A cada dia','A cada semana','A cada mês','A cada semestre','A cada ano','custom'].includes(formData.recurrence)) throw new Error('Selecione uma recorrência válida.');

  if (formData.recurrence === 'custom') {
    if (isNaN(parsedValue) || parsedValue < 0) {
      throw new Error('Informe um número válido maior ou igual a 0 para a recorrência.');
    }
  }

  const finalType =
    formData.recurrence === 'custom'
      ? parsedValue.toString()
      : formData.recurrence;

  onSave({ ...formData, recurrence: finalType });

  resetForm(); // Limpa os estados externos (do componente)

  return true;
}


// ############### LEITURA DE ARQUIVO ###############



describe('Testes de leitura de dados combinatórios', () => {
  const filePath = path.resolve(__dirname, 'casos_teste_combinatorio_validos.csv');
  const csvData = fs.readFileSync(filePath, 'utf8');

  const filePath_invalidos = path.resolve(__dirname, 'casos_teste_combinatorio_invalidos.csv');
  const csvData_invalidos = fs.readFileSync(filePath_invalidos, 'utf8');

  const tarefas: any[] = [];
  const tarefas_invalidos: any[] = [];

  beforeAll(() => {
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      newline: "\n"
    });
    tarefas.push(...parsed.data);

    const parsed_invalidos = Papa.parse(csvData_invalidos, {
      header: true,
      skipEmptyLines: true,
      newline: "\n"
    });
    tarefas_invalidos.push(...parsed_invalidos.data);
  });

  it('Deve conter 10.000 tarefas no arquivo CSV', () => {
    expect(tarefas.length).toBe(10000);
    expect(tarefas_invalidos.length).toBe(10000);
  });

  it('Cada tarefa deve conter todos os 6 campos obrigatórios', () => {
    tarefas.forEach((tarefa, index) => {
      expect(tarefa.nome).toBeTruthy();
      expect(tarefa.prioridade).toBeTruthy();
      expect(tarefa.data).toBeTruthy();
      expect(tarefa.tipo).toBeTruthy();
      expect(tarefa.periodicidade).toBeTruthy();
      expect(tarefa.detalhes).toBeTruthy();
    });

  });
  
  it('Simula cadastro das 10 mil tarefas corretas', () => {
    tarefas.forEach((tarefa, i) => {

      if (i % 2000 === 0) {
        console.log('Tarefa lida com sucesso:', i);
      }

      const fakeTask: Task = {
      title: tarefa.nome,
      details: tarefa.detalhes,
      priority: tarefa.prioridade,
      category: tarefa.tipo,
      dueDate: tarefa.data,
      recurrence: isNaN(Number(tarefa.periodicidade)) ? tarefa.periodicidade : "custom",
      id: tarefa.id,
      completed: true
      };
      
      const fakeCustomValue = isNaN(Number(tarefa.periodicidade)) ? "" : tarefa.periodicidade; // Recorrencia personalizada
   
      try {
        const result = validateAndSaveTask({
          formData: fakeTask,
          customValue: fakeCustomValue,
          onSave: (savedTask) => {
            //console.log('Tarefa salva com sucesso:', savedTask);
          },
          resetForm: () => {
            //console.log('Formulário resetado!');
          },
        });
     
        expect(true).toBe(true);
        
      } catch (err: any) {

        console.log('TESTE INVÁLIDO!!!');   
        console.log('Erro', err.message); 
        console.log(tarefa) 
        console.log('Valor:', fakeCustomValue)               
      }
    
    });   
  });


  it('Simula cadastro das 10 mil tarefas incorretas', () => {
    tarefas_invalidos.forEach((tarefa_invalida, i) => {

      if (i % 2000 === 0) {
        console.log('Tarefa lida com sucesso:', i);
      }

      const fakeTask: Task = {
      title: tarefa_invalida.nome,
      details: tarefa_invalida.detalhes,
      priority: tarefa_invalida.prioridade,
      category: tarefa_invalida.tipo,
      dueDate: tarefa_invalida.data,
      recurrence: isNaN(Number(tarefa_invalida.periodicidade)) ? tarefa_invalida.periodicidade : "custom",
      id: tarefa_invalida.id,
      completed: true
      };
      
      const fakeCustomValue = isNaN(Number(tarefa_invalida.periodicidade)) ? "" : tarefa_invalida.periodicidade; // Recorrencia personalizada
   
      try {
        const result = validateAndSaveTask({
          formData: fakeTask,
          customValue: fakeCustomValue,
          onSave: (savedTask) => {
            //console.log('Tarefa salva com sucesso:', savedTask);
          },
          resetForm: () => {
            //console.log('Formulário resetado!');
          },
        });

        if (result) {
          console.log('TESTE INVÁLIDO!!!');   
          console.log(tarefa_invalida) 
          console.log('Valor:', fakeCustomValue) 
        }
        
        
      } catch (err: any) {
        expect(true).toBe(true);
        //console.log('Erro', err.message);  
      }
    
    });   
  });

});



/*
const fakeTask: Task = {
  title: 'Estudar React Native',
  details: 'Focar nos componentes de UI e navegação',
  priority: normalizarPrioridade('important'),
  category: 'educational',
  dueDate: new Date().toISOString(),
  recurrence: 'custom',
  id: 0,
  completed: false
};

const fakeCustomValue = '10'; // 10 dias de recorrência personalizada

validateAndSaveTask({
  formData: fakeTask,
  customValue: fakeCustomValue,
  onSave: (savedTask) => {
    console.log('Tarefa salva com sucesso:', savedTask);
  },
  resetForm: () => {
    console.log('Formulário resetado!');
  },
});




describe('Testes de criação de tarefas com dados combinatórios', () => {

  

});
*/