import { ThemeCategory, Element } from '../types';

// English nursery rhyme preset theme categories
export const ENGLISH_THEME_CATEGORIES: ThemeCategory[] = [
  {
    id: 'animals',
    name: 'Animals',
    description: 'Cute animal friends',
    icon: '🐰',
    color: '#FF6B35',
    suggestedKeywords: ['rabbit', 'cat', 'dog', 'bird', 'elephant', 'lion']
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Beautiful natural world',
    icon: '🌸',
    color: '#4ECDC4',
    suggestedKeywords: ['flower', 'tree', 'sunshine', 'rain', 'mountain', 'ocean']
  },
  {
    id: 'weather',
    name: 'Weather',
    description: 'Weather and seasons',
    icon: '☀️',
    color: '#FFE66D',
    suggestedKeywords: ['sunny', 'rainy', 'cloudy', 'snowy', 'windy', 'rainbow']
  },
  {
    id: 'colors',
    name: 'Colors',
    description: 'Colorful world',
    icon: '🌈',
    color: '#9B59B6',
    suggestedKeywords: ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
  },
  {
    id: 'daily',
    name: 'Daily Life',
    description: 'Everyday activities',
    icon: '🏠',
    color: '#A8E6CF',
    suggestedKeywords: ['eating', 'sleeping', 'playing', 'learning', 'family', 'friends']
  }
];

// Preset English theme elements for drag-and-drop
export const ENGLISH_THEME_ELEMENTS: Element[] = [
  // Animals
  {
    id: 'cat',
    name: 'Cat',
    category: 'animal',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20cat%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A cute and friendly cat'
  },
  {
    id: 'dog',
    name: 'Dog',
    category: 'animal',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20dog%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A playful and loyal dog'
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    category: 'animal',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20rabbit%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A fluffy and gentle rabbit'
  },
  {
    id: 'bird',
    name: 'Bird',
    category: 'animal',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20bird%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A beautiful singing bird'
  },
  {
    id: 'elephant',
    name: 'Elephant',
    category: 'animal',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20elephant%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A big and gentle elephant'
  },

  // Nature
  {
    id: 'tree',
    name: 'Tree',
    category: 'nature',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20tree%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A tall and green tree'
  },
  {
    id: 'flower',
    name: 'Flower',
    category: 'nature',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20flower%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A beautiful blooming flower'
  },
  {
    id: 'mountain',
    name: 'Mountain',
    category: 'nature',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20mountain%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A majestic mountain'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    category: 'nature',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20ocean%20waves%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'The vast blue ocean'
  },

  // Weather
  {
    id: 'sun',
    name: 'Sun',
    category: 'weather',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20sun%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A bright and warm sun'
  },
  {
    id: 'rain',
    name: 'Rain',
    category: 'weather',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20rain%20clouds%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'Gentle falling rain'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    category: 'weather',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20rainbow%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A colorful rainbow'
  },
  {
    id: 'snow',
    name: 'Snow',
    category: 'weather',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20snow%20snowflakes%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'Soft white snow'
  },

  // Colors
  {
    id: 'red-apple',
    name: 'Red Apple',
    category: 'colors',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20red%20apple%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A bright red apple'
  },
  {
    id: 'blue-sky',
    name: 'Blue Sky',
    category: 'colors',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20blue%20sky%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A clear blue sky'
  },
  {
    id: 'yellow-banana',
    name: 'Yellow Banana',
    category: 'colors',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20yellow%20banana%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A sweet yellow banana'
  },

  // Daily Life
  {
    id: 'home',
    name: 'Home',
    category: 'daily',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20house%20home%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A cozy family home'
  },
  {
    id: 'playground',
    name: 'Playground',
    category: 'daily',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20playground%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A fun playground'
  },
  {
    id: 'school',
    name: 'School',
    category: 'daily',
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cartoon%20school%20building%20for%20children%20nursery%20rhyme%20colorful%20friendly&image_size=square',
    description: 'A friendly school'
  }
];

// Helper function to get elements by category
export const getElementsByCategory = (category: string): Element[] => {
  return ENGLISH_THEME_ELEMENTS.filter(element => element.category === category);
};

// Helper function to get category by id
export const getCategoryById = (id: string): ThemeCategory | undefined => {
  return ENGLISH_THEME_CATEGORIES.find(category => category.id === id);
};