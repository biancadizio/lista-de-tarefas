import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

describe('Testes de criação de tarefas com dados combinatórios', () => {
  const filePath = path.resolve(__dirname, 'casos_teste_combinatorio.csv');
  const csvData = fs.readFileSync(filePath, 'utf8');

  const tarefas: any[] = [];

  beforeAll(() => {
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      newline: "\n"
    });
    tarefas.push(...parsed.data);

    
  });

  it('Deve conter 10.000 tarefas no arquivo CSV', () => {
    expect(tarefas.length).toBe(10000);
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

  it('Simula cadastro das tarefas', () => {
    tarefas.slice(0, 100).forEach((tarefa, i) => {
      const resultado = cadastrarTarefa(tarefa);
      expect(resultado).toBe(true); // ou outro critério de validação
    });
  });
});

// Simulação da função de cadastro
function cadastrarTarefa(tarefa: any): boolean {
  // Aqui você pode chamar sua lógica real de cadastro
  if (!tarefa.nome || !tarefa.prioridade) return false;
  return true;
}
