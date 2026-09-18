export interface LocalizedString {
  es: string;
  en: string;
}

export interface Category {
  id: string;
  order: number;
  title: LocalizedString;
  description: LocalizedString;
}
