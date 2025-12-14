export type GroupDataAnimal = {
  id: string;
  nom: string;
  espece: string;
};

export type GroupDataMemberPending = {
  email: string;
};

export type GroupDataMemberAccepted = {
  email: string;
  role: string;
};

type GroupDataItemAnimal = {
  type: "pending" | "accepted";
  items: GroupDataAnimal[];
};

type GroupDataItemMember =
  | { type: "pending"; items: GroupDataMemberPending[] }
  | { type: "accepted"; items: GroupDataMemberAccepted[] };

export type GroupData = {
  animals: GroupDataItemAnimal[];
  members: GroupDataItemMember[]; 
};

export type Group = {
  id: string;
  name: string;
  informations: string;
  created_at: Date;
  nb_members: number;
  nb_animaux: number;
  data: GroupData;
};