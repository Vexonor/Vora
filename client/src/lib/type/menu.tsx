export interface Menu {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isAvailable?: boolean;
  ingredients?: string[];
}