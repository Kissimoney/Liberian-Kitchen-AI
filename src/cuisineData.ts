export interface CuisineInfo {
  name: string;
  origin: string;
  commonIngredients: string[];
  culturalSignificance: string;
}

export const cuisineDetails: Record<string, CuisineInfo> = {
  'Liberian': {
    name: 'Liberian',
    origin: 'West Africa (Grain Coast), with influences from indigenous ethnic groups and 19th-century African-American settlers.',
    commonIngredients: ['Rice', 'Cassava Leaf', 'Palm Butter', 'Potato Greens', 'Plantains', 'Scotch Bonnet Peppers', 'Dried Fish'],
    culturalSignificance: 'Rice is the undisputed staple; a day without rice is often jokingly considered a day of fasting. Meals are typically spicy, hearty stews (soups) served over rice, symbolizing deep hospitality.'
  },
  'Nigerian': {
    name: 'Nigerian',
    origin: 'West Africa, emerging from the traditions of hundreds of ethnic groups including Yoruba, Igbo, and Hausa.',
    commonIngredients: ['Yams', 'Cassava (Garri)', 'Egusi (Melon Seeds)', 'Palm Oil', 'Crayfish', 'Tomatoes', 'Scotch Bonnets'],
    culturalSignificance: 'Nigerian cuisine is celebrated for its bold, spicy flavors and variety. Food is central to social life, especially at "Owanbes" (parties) where Jollof Rice is legendary.'
  },
  'Ghanaian': {
    name: 'Ghanaian',
    origin: 'West Africa (Gold Coast), characterized by starch-heavy staples and rich, tomato-based soups.',
    commonIngredients: ['Cassava', 'Plantain', 'Corn Dough', 'Tomatoes', 'Peanuts', 'Red Palm Oil', 'Tilapia'],
    culturalSignificance: 'Dishes like Fufu and Banku are staples. Food is a communal affair, often eaten with hands from a shared bowl, reinforcing family bonds.'
  },
  'Sierra Leonean': {
    name: 'Sierra Leonean',
    origin: 'West Africa, sharing a close historical and culinary heritage with Liberia.',
    commonIngredients: ['Rice', 'Cassava Leaves', 'Groundnuts (Peanuts)', 'Palm Oil', 'Okra', 'Fresh Seafood'],
    culturalSignificance: 'Like in Liberia, rice is the center of the meal. "Plasas" (sauces) are rich and savory. Street food like "Fry Fry" is a popular daily comfort.'
  },
  'Senegalese': {
    name: 'Senegalese',
    origin: 'West Africa, with strong Wolof roots and French colonial influences.',
    commonIngredients: ['Fish', 'Rice', 'Onions', 'Mustard', 'Peanuts (Mafé)', 'Millet'],
    culturalSignificance: 'Hospitality, or "Teranga", is the national value, best exemplified by Thieboudienne (Fish and Rice), typically eaten from a large communal platter.'
  },
  'Ivorian': {
    name: 'Ivorian',
    origin: 'West Africa (Côte d\'Ivoire), known for slow-simmered sauces and grilled street foods.',
    commonIngredients: ['Cassava (Attiéké)', 'Plantains (Alloco)', 'Cocoa', 'Eggplant', 'Peanuts', 'Chicken'],
    culturalSignificance: 'Attiéké (fermented cassava couscous) is a national icon. Dining is vibrant and social, often centered around "Maquis" (open-air restaurants).'
  },
  'Ethiopian': {
    name: 'Ethiopian',
    origin: 'Horn of Africa, ancient traditions with unique indigenous crops.',
    commonIngredients: ['Teff Flour (Injera)', 'Berbere Spice Blend', 'Lentils', 'Split Peas', 'Niter Kibbeh (Spiced Butter)'],
    culturalSignificance: 'Meals are served on Injera (sourdough flatbread) shared from a common plate (Gebeta). Feeding another person ("Gursha") is a gesture of love and respect.'
  },
  'Kenyan': {
    name: 'Kenyan',
    origin: 'East Africa, mixing indigenous styles with Indian and Arab influences along the Swahili coast.',
    commonIngredients: ['Maize Meal (Ugali)', 'Collard Greens (Sukuma Wiki)', 'Goat Meat', 'Beans', 'Coconut Milk'],
    culturalSignificance: 'Ugali is the national staple. "Nyama Choma" (grilled meat) gatherings are a key social ritual for friends and family on weekends.'
  },
  'South African': {
    name: 'South African',
    origin: 'Southern Africa, the "Rainbow Nation" cuisine reflects indigenous, Dutch, Malay, and Indian heritage.',
    commonIngredients: ['Maize Meal (Pap)', 'Meat (Boerewors)', 'Chutney', 'Curry Spices', 'Pumpkin'],
    culturalSignificance: 'The "Braai" (barbecue) crosses all cultural lines, serving as a unifying social event. Food ranges from hearty stews to spicy curries like Bunny Chow.'
  },
  'Moroccan': {
    name: 'Moroccan',
    origin: 'North Africa, a blend of Berber, Arab, Andalusian, and Mediterranean influences.',
    commonIngredients: ['Couscous', 'Lamb', 'Prunes', 'Preserved Lemons', 'Olives', 'Saffron', 'Mint'],
    culturalSignificance: 'Food is artfully spiced and slow-cooked in Tagines. The tea ceremony is a sacred act of hospitality, signaling friendship and welcome.'
  }
};

export const CUISINES = [
  { name: 'Liberian', flag: '🇱🇷', suggestions: ['Palm Butter', 'Potato Greens', 'Check Rice', 'Kala'] },
  { name: 'Nigerian', flag: '🇳🇬', suggestions: ['Jollof Rice', 'Pounded Yam & Egusi', 'Suya', 'Pepper Soup'] },
  { name: 'Ghanaian', flag: '🇬🇭', suggestions: ['Waakye', 'Banku & Tilapia', 'Red Red', 'Fufu'] },
  { name: 'Sierra Leonean', flag: '🇸🇱', suggestions: ['Cassava Leaves', 'Groundnut Soup', 'Jollof Rice', 'Fry Fry'] },
  { name: 'Senegalese', flag: '🇸🇳', suggestions: ['Thieboudienne', 'Yassa Chicken', 'Mafe', 'Accara'] },
  { name: 'Ivorian', flag: '🇨🇮', suggestions: ['Attiéké', 'Kedjenou', 'Foutou', 'Alloco'] },
  { name: 'Ethiopian', flag: '🇪🇹', suggestions: ['Doro Wat', 'Injera', 'Tibs', 'Shiro'] },
  { name: 'Kenyan', flag: '🇰🇪', suggestions: ['Nyama Choma', 'Ugali & Sukuma Wiki', 'Kachumbari', 'Chapati'] },
  { name: 'South African', flag: '🇿🇦', suggestions: ['Bobotie', 'Bunny Chow', 'Braai', 'Chakalaka'] },
  { name: 'Moroccan', flag: '🇲🇦', suggestions: ['Tagine', 'Couscous', 'Harira', 'Bastilla'] },
];