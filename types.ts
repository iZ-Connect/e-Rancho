export enum UserRole {
  MILITAR = "Militar",
  FISC_SU = "Fisc SU",
  ADM_LOCAL = "ADM Local",
  ADM_GERAL = "ADM Geral",
}

export interface Militar {
  cpf: string;
  pin_hash: string;
  nome: string;
  nome_guerra?: string;
  posto_grad: string;
  setor_id: number;
  perfil: UserRole;
  status: 'pending' | 'approved' | 'denied';
}

export interface Setor {
  id: number;
  nome: string;
}

export interface Arranchamento {
  id: string;
  militar_cpf: string;
  data_almoco: string; // YYYY-MM-DD format
  data_registro: string; // ISO 8601 format
  presenca: boolean;
}
