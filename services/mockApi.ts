import { Militar, Setor, Arranchamento, UserRole } from '../types';
import { format } from 'date-fns';

let militares: Militar[] = [
  { cpf: "01707066051", pin_hash: "1234", nome: "Ezequiel Fagundes", nome_guerra: "Sgt Fagundes", posto_grad: "3º Sgt", setor_id: 1, perfil: UserRole.MILITAR, status: 'approved' },
  { cpf: "111.111.111-11", pin_hash: "1234", nome: "João Silva", nome_guerra: "Sgt Silva", posto_grad: "3º Sgt", setor_id: 1, perfil: UserRole.FISC_SU, status: 'approved' },
  { cpf: "222.222.222-22", pin_hash: "1234", nome: "Carlos Souza", nome_guerra: "Cb Souza", posto_grad: "Cabo", setor_id: 1, perfil: UserRole.MILITAR, status: 'approved' },
  { cpf: "333.333.333-33", pin_hash: "1234", nome: "Ricardo Pereira", nome_guerra: "Sd Pereira", posto_grad: "Soldado", setor_id: 1, perfil: UserRole.MILITAR, status: 'approved' },
  { cpf: "444.444.444-44", pin_hash: "1234", nome: "Ana Costa", nome_guerra: "Ten Costa", posto_grad: "2º Ten", setor_id: 2, perfil: UserRole.FISC_SU, status: 'approved' },
  { cpf: "555.555.555-55", pin_hash: "1234", nome: "Mariana Lima", nome_guerra: "Sd Lima", posto_grad: "Soldado", setor_id: 2, perfil: UserRole.MILITAR, status: 'approved' },
  { cpf: "666.666.666-66", pin_hash: "1234", nome: "Lucas Martins", nome_guerra: "Cap Martins", posto_grad: "Capitão", setor_id: 99, perfil: UserRole.ADM_LOCAL, status: 'approved' },
  { cpf: "777.777.777-77", pin_hash: "1234", nome: "José Oliveira", nome_guerra: "Maj Oliveira", posto_grad: "Major", setor_id: 99, perfil: UserRole.ADM_GERAL, status: 'approved' },
  { cpf: "02541082029", pin_hash: "1234", nome: "Administrador", nome_guerra: "Admin", posto_grad: "Coronel", setor_id: 99, perfil: UserRole.ADM_LOCAL, status: 'approved' },
];

let setores: Setor[] = [
  { id: 1, nome: "1ª Cia Fuz" },
  { id: 2, nome: "2ª Cia Fuz" },
  { id: 99, nome: "Comando" },
];

let arranchamentos: Arranchamento[] = [
  { id: '1', militar_cpf: '222.222.222-22', data_almoco: format(new Date(new Date().setDate(new Date().getDate() + 8)), 'yyyy-MM-dd'), data_registro: new Date().toISOString(), presenca: false },
  { id: '2', militar_cpf: '333.333.333-33', data_almoco: format(new Date(new Date().setDate(new Date().getDate() + 8)), 'yyyy-MM-dd'), data_registro: new Date().toISOString(), presenca: false },
  { id: '3', militar_cpf: '555.555.555-55', data_almoco: format(new Date(new Date().setDate(new Date().getDate() + 9)), 'yyyy-MM-dd'), data_registro: new Date().toISOString(), presenca: false },
];


// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
  login: async (cpf: string, pin: string): Promise<Militar | null> => {
    await delay(500);
    const user = militares.find(m => m.cpf === cpf);
    
    // Existing user with correct pin
    if (user && user.pin_hash === pin) {
        return user;
    }
    
    // New user: create a pending account
    if (!user) {
        const newUser: Militar = {
            cpf,
            pin_hash: pin,
            nome: "Novo Usuário",
            posto_grad: "Não definido",
            setor_id: 0, // Belongs to no unit yet
            perfil: UserRole.MILITAR,
            status: 'pending',
        };
        militares.push(newUser);
        return newUser;
    }

    // Existing user with incorrect pin
    return null;
  },

  getSetorById: async (id: number): Promise<Setor | null> => {
    await delay(100);
    return setores.find(f => f.id === id) || null;
  },
  
  getSetores: async (): Promise<Setor[]> => {
    await delay(100);
    return [...setores];
  },

  getMilitaresBySetor: async (setorId: number): Promise<Militar[]> => {
    await delay(200);
    return militares.filter(m => m.setor_id === setorId);
  },
  
  getAllMilitares: async (): Promise<Militar[]> => {
    await delay(200);
    return [...militares];
  },

  getArranchamentosByMilitar: async (cpf: string): Promise<Arranchamento[]> => {
    await delay(200);
    return arranchamentos.filter(a => a.militar_cpf === cpf);
  },

  getArranchamentosBySetor: async (setorId: number): Promise<Arranchamento[]> => {
    await delay(300);
    const militaresNoSetor = militares.filter(m => m.setor_id === setorId).map(m => m.cpf);
    return arranchamentos.filter(a => militaresNoSetor.includes(a.militar_cpf));
  },
  
  getAllArranchamentos: async (): Promise<Arranchamento[]> => {
    await delay(300);
    return [...arranchamentos];
  },

  updateMilitarArranchamento: async (cpf: string, dates: string[]): Promise<void> => {
    await delay(400);
    // Remove existing entries for this soldier
    arranchamentos = arranchamentos.filter(a => a.militar_cpf !== cpf);
    // Add new entries
    dates.forEach(date => {
      arranchamentos.push({
        id: crypto.randomUUID(),
        militar_cpf: cpf,
        data_almoco: date,
        data_registro: new Date().toISOString(),
        presenca: false,
      });
    });
  },
  
  toggleArranchamento: async (cpf: string, date: string): Promise<void> => {
    await delay(100);
    const existing = arranchamentos.find(a => a.militar_cpf === cpf && a.data_almoco === date);
    if (existing) {
      arranchamentos = arranchamentos.filter(a => a.id !== existing.id);
    } else {
      arranchamentos.push({
        id: crypto.randomUUID(),
        militar_cpf: cpf,
        data_almoco: date,
        data_registro: new Date().toISOString(),
        presenca: false,
      });
    }
  },

  // Admin Functions
  getPendingMilitares: async (): Promise<Militar[]> => {
    await delay(200);
    return militares.filter(m => m.status === 'pending');
  },

  approveMilitar: async (cpf: string, nome: string, nome_guerra: string, posto_grad: string, setor_nome: string): Promise<void> => {
    await delay(300);
    let setor = setores.find(s => s.nome.toLowerCase() === setor_nome.toLowerCase());
    let setor_id;

    if (setor) {
      setor_id = setor.id;
    } else {
      const newSetor: Setor = { id: Date.now(), nome: setor_nome };
      setores.push(newSetor);
      setor_id = newSetor.id;
    }

    militares = militares.map(m => 
      m.cpf === cpf 
        ? { ...m, nome, nome_guerra, posto_grad, setor_id, status: 'approved' }
        : m
    );
  },

  denyMilitar: async (cpf: string): Promise<void> => {
    await delay(300);
    militares = militares.filter(m => m.cpf !== cpf);
  },

  updateMilitarProfile: async (cpf: string, nome: string, nome_guerra: string): Promise<Militar> => {
    await delay(300);
    const militarIndex = militares.findIndex(m => m.cpf === cpf);
    if (militarIndex === -1) {
        throw new Error("Militar não encontrado.");
    }
    const updatedMilitar = { ...militares[militarIndex], nome, nome_guerra: nome_guerra };
    militares[militarIndex] = updatedMilitar;
    return updatedMilitar;
  },

  createSetor: async (nome: string): Promise<Setor> => {
    await delay(200);
    if (setores.some(s => s.nome.toLowerCase() === nome.toLowerCase())) {
        throw new Error("Setor com este nome já existe.");
    }
    const newSetor = { id: Date.now(), nome };
    setores.push(newSetor);
    return newSetor;
  },

  updateSetor: async (id: number, newName: string): Promise<Setor> => {
    await delay(200);
    const existingSetorWithSameName = setores.find(s => s.nome.toLowerCase() === newName.toLowerCase() && s.id !== id);
    if (existingSetorWithSameName) {
        throw new Error("Já existe um setor com este nome.");
    }

    const sectorIndex = setores.findIndex(s => s.id === id);
    if (sectorIndex === -1) {
        throw new Error("Setor não encontrado.");
    }

    setores[sectorIndex].nome = newName;
    return setores[sectorIndex];
  },

  deleteSetor: async (id: number): Promise<void> => {
      await delay(200);
      // Set military from this sector to unassigned (setor_id: 0) before deleting
      militares = militares.map(m => (m.setor_id === id ? { ...m, setor_id: 0 } : m));
      setores = setores.filter(s => s.id !== id);
  },
  
  addSpecialArranchamento: async (date: string, name: string, quantity: number): Promise<void> => {
    await delay(300);
    for (let i = 0; i < quantity; i++) {
        const militarName = quantity > 1 ? `${name} (${i + 1}/${quantity})` : name;
        const newMilitar: Militar = {
            cpf: `especial_${crypto.randomUUID()}`,
            pin_hash: '',
            nome: militarName,
            nome_guerra: 'Especial',
            posto_grad: militarName,
            setor_id: 0,
            perfil: UserRole.MILITAR,
            status: 'approved'
        };
        militares.push(newMilitar);

        const newArranchamento: Arranchamento = {
            id: crypto.randomUUID(),
            militar_cpf: newMilitar.cpf,
            data_almoco: date,
            data_registro: new Date().toISOString(),
            presenca: false
        };
        arranchamentos.push(newArranchamento);
    }
  },

  markPresence: async (arranchamentoId: string, isPresent: boolean): Promise<void> => {
    await delay(100);
    arranchamentos = arranchamentos.map(a =>
      a.id === arranchamentoId ? { ...a, presenca: isPresent } : a
    );
  }
};