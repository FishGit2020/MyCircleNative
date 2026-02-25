export interface Phrase {
  id: string;
  english: string;
  chinese: string;
  phonetic: string;
  category: PhraseCategory;
  difficulty: 1 | 2 | 3;
}

export type PhraseCategory =
  | 'greetings'
  | 'feelings'
  | 'house'
  | 'food'
  | 'goingOut'
  | 'people'
  | 'time'
  | 'emergency';

export const phrases: Phrase[] = [
  // Basic Greetings
  { id: 'g01', english: 'Hi!', chinese: '\u55e8\uff01', phonetic: 'h\u0101i', category: 'greetings', difficulty: 1 },
  { id: 'g02', english: 'Bye bye!', chinese: '\u62dc\u62dc\uff01', phonetic: 'b\u0101ib\u0101i', category: 'greetings', difficulty: 1 },
  { id: 'g03', english: 'Please.', chinese: '\u8bf7\u3002', phonetic: 'pl\u0113ez', category: 'greetings', difficulty: 1 },
  { id: 'g04', english: 'Thank you!', chinese: '\u8c22\u8c22\u4f60\uff01', phonetic: 'th\u01d0a\u014bk y\u014do', category: 'greetings', difficulty: 1 },
  { id: 'g05', english: 'Sorry.', chinese: '\u5bf9\u4e0d\u8d77\u3002', phonetic: 's\u01d2r\u0113', category: 'greetings', difficulty: 1 },
  { id: 'g06', english: "You're welcome.", chinese: '\u4e0d\u5ba2\u6c14\u3002', phonetic: 'y\u014dr w\u011bl-k\u01d0m', category: 'greetings', difficulty: 1 },
  { id: 'g07', english: 'Good morning!', chinese: '\u65e9\u4e0a\u597d\uff01', phonetic: 'g\u01d2od m\u014dr-n\u01d0\u014b', category: 'greetings', difficulty: 1 },
  { id: 'g08', english: 'Good night!', chinese: '\u665a\u5b89\uff01', phonetic: 'g\u01d2od n\u0101it', category: 'greetings', difficulty: 1 },
  { id: 'g09', english: 'See you later!', chinese: '\u56de\u5934\u89c1\uff01', phonetic: 's\u0113e y\u014do l\u011bi-t\u01d0r', category: 'greetings', difficulty: 2 },
  { id: 'g10', english: 'Excuse me.', chinese: '\u6253\u6270\u4e00\u4e0b\u3002', phonetic: '\u011bk-sky\u014doz m\u0113e', category: 'greetings', difficulty: 2 },

  // Feelings
  { id: 'fe01', english: "I'm happy.", chinese: '\u6211\u5f88\u5f00\u5fc3\u3002', phonetic: '\u0101im h\u01ce-p\u0113e', category: 'feelings', difficulty: 1 },
  { id: 'fe02', english: "I'm tired.", chinese: '\u6211\u7d2f\u4e86\u3002', phonetic: '\u0101im t\u0101i-\u01d0rd', category: 'feelings', difficulty: 1 },
  { id: 'fe03', english: "I'm hungry.", chinese: '\u6211\u997f\u4e86\u3002', phonetic: '\u0101im h\u01ce\u014b-gr\u0113e', category: 'feelings', difficulty: 1 },
  { id: 'fe04', english: "I don't feel well.", chinese: '\u6211\u4e0d\u8212\u670d\u3002', phonetic: '\u0101i d\u014dnt f\u0113el w\u011bl', category: 'feelings', difficulty: 2 },
  { id: 'fe05', english: "I'm scared.", chinese: '\u6211\u5bb3\u6015\u3002', phonetic: '\u0101im sk\u011brd', category: 'feelings', difficulty: 1 },
  { id: 'fe06', english: "I'm thirsty.", chinese: '\u6211\u6e34\u4e86\u3002', phonetic: '\u0101im th\u01d0r-st\u0113e', category: 'feelings', difficulty: 1 },
  { id: 'fe07', english: "I'm cold.", chinese: '\u6211\u51b7\u4e86\u3002', phonetic: '\u0101im k\u014dld', category: 'feelings', difficulty: 1 },
  { id: 'fe08', english: "I'm hot.", chinese: '\u6211\u70ed\u4e86\u3002', phonetic: '\u0101im h\u01d2t', category: 'feelings', difficulty: 1 },
  { id: 'fe09', english: 'I miss you.', chinese: '\u6211\u60f3\u4f60\u3002', phonetic: '\u0101i m\u01d0s y\u014do', category: 'feelings', difficulty: 2 },
  { id: 'fe10', english: 'I love you.', chinese: '\u6211\u7231\u4f60\u3002', phonetic: '\u0101i l\u01cev y\u014do', category: 'feelings', difficulty: 1 },

  // Around the House
  { id: 'h01', english: 'Open the door.', chinese: '\u5f00\u95e8\u3002', phonetic: '\u014d-p\u011bn th\u01d0 d\u014dr', category: 'house', difficulty: 1 },
  { id: 'h02', english: 'Close the door.', chinese: '\u5173\u95e8\u3002', phonetic: 'kl\u014dz th\u01d0 d\u014dr', category: 'house', difficulty: 1 },
  { id: 'h03', english: 'Turn on the light.', chinese: '\u5f00\u706f\u3002', phonetic: 't\u01d0rn \u01d2n th\u01d0 l\u0101it', category: 'house', difficulty: 2 },
  { id: 'h04', english: 'Turn off the light.', chinese: '\u5173\u706f\u3002', phonetic: 't\u01d0rn \u01d2f th\u01d0 l\u0101it', category: 'house', difficulty: 2 },
  { id: 'h05', english: 'Where is the...?', chinese: '\u2026\u2026\u5728\u54ea\u91cc\uff1f', phonetic: 'w\u011br \u01d0z th\u01d0', category: 'house', difficulty: 2 },
  { id: 'h06', english: "Let's clean up.", chinese: '\u6211\u4eec\u6536\u62fe\u4e00\u4e0b\u3002', phonetic: 'l\u011bts kl\u0113en \u01cep', category: 'house', difficulty: 2 },
  { id: 'h07', english: 'Time for bed.', chinese: '\u8be5\u7761\u89c9\u4e86\u3002', phonetic: 't\u0101im f\u014dr b\u011bd', category: 'house', difficulty: 1 },
  { id: 'h08', english: 'Wash your hands.', chinese: '\u6d17\u624b\u3002', phonetic: 'w\u01d2sh y\u014dr h\u01cendz', category: 'house', difficulty: 2 },
  { id: 'h09', english: 'Take a bath.', chinese: '\u6d17\u6fa1\u3002', phonetic: 't\u011bik \u01d0 b\u01ceth', category: 'house', difficulty: 2 },
  { id: 'h10', english: 'Put on your shoes.', chinese: '\u7a7f\u978b\u3002', phonetic: 'p\u01d2ot \u01d2n y\u014dr sh\u014doz', category: 'house', difficulty: 2 },

  // Food & Drink
  { id: 'fd01', english: 'I want water.', chinese: '\u6211\u8981\u6c34\u3002', phonetic: '\u0101i w\u01d2nt w\u01d2-t\u01d0r', category: 'food', difficulty: 1 },
  { id: 'fd02', english: 'Can I have...?', chinese: '\u53ef\u4ee5\u7ed9\u6211\u2026\u2026\u5417\uff1f', phonetic: 'k\u01cen \u0101i h\u01cev', category: 'food', difficulty: 2 },
  { id: 'fd03', english: "It's delicious!", chinese: '\u5f88\u597d\u5403\uff01', phonetic: '\u01d0ts d\u01d0-l\u01d0-sh\u01d0s', category: 'food', difficulty: 2 },
  { id: 'fd04', english: "I'm full.", chinese: '\u6211\u9971\u4e86\u3002', phonetic: '\u0101im f\u01d2ol', category: 'food', difficulty: 1 },
  { id: 'fd05', english: 'More, please.', chinese: '\u518d\u6765\u4e00\u70b9\u3002', phonetic: 'm\u014dr pl\u0113ez', category: 'food', difficulty: 1 },
  { id: 'fd06', english: "I don't like it.", chinese: '\u6211\u4e0d\u559c\u6b22\u3002', phonetic: '\u0101i d\u014dnt l\u0101ik \u01d0t', category: 'food', difficulty: 2 },
  { id: 'fd07', english: "Let's eat!", chinese: '\u5403\u996d\u5566\uff01', phonetic: 'l\u011bts \u0113et', category: 'food', difficulty: 1 },
  { id: 'fd08', english: 'I want milk.', chinese: '\u6211\u8981\u725b\u5976\u3002', phonetic: '\u0101i w\u01d2nt m\u01d0lk', category: 'food', difficulty: 1 },
  { id: 'fd09', english: 'I want fruit.', chinese: '\u6211\u8981\u6c34\u679c\u3002', phonetic: '\u0101i w\u01d2nt fr\u014dot', category: 'food', difficulty: 1 },
  { id: 'fd10', english: 'No, thank you.', chinese: '\u4e0d\u7528\u4e86\uff0c\u8c22\u8c22\u3002', phonetic: 'n\u014d th\u01ce\u014bk y\u014do', category: 'food', difficulty: 1 },

  // Going Out
  { id: 'go01', english: "Let's go!", chinese: '\u8d70\u5427\uff01', phonetic: 'l\u011bts g\u014d', category: 'goingOut', difficulty: 1 },
  { id: 'go02', english: 'Wait for me!', chinese: '\u7b49\u7b49\u6211\uff01', phonetic: 'w\u011bit f\u014dr m\u0113e', category: 'goingOut', difficulty: 1 },
  { id: 'go03', english: 'Be careful!', chinese: '\u5c0f\u5fc3\uff01', phonetic: 'b\u0113e k\u011br-f\u01d2ol', category: 'goingOut', difficulty: 1 },
  { id: 'go04', english: 'How much is this?', chinese: '\u8fd9\u4e2a\u591a\u5c11\u94b1\uff1f', phonetic: 'h\u0101o m\u01cech \u01d0z th\u01d0s', category: 'goingOut', difficulty: 2 },
  { id: 'go05', english: "I don't understand.", chinese: '\u6211\u4e0d\u660e\u767d\u3002', phonetic: '\u0101i d\u014dnt \u01cen-d\u01d0r-st\u01cend', category: 'goingOut', difficulty: 2 },
  { id: 'go06', english: 'Please say it again.', chinese: '\u8bf7\u518d\u8bf4\u4e00\u904d\u3002', phonetic: 'pl\u0113ez s\u011bi \u01d0t \u01d0-g\u011bn', category: 'goingOut', difficulty: 2 },
  { id: 'go07', english: 'Where is the bathroom?', chinese: '\u6d17\u624b\u95f4\u5728\u54ea\u91cc\uff1f', phonetic: 'w\u011br \u01d0z th\u01d0 b\u01ceth-r\u014dom', category: 'goingOut', difficulty: 2 },
  { id: 'go08', english: 'Stop!', chinese: '\u505c\uff01', phonetic: 'st\u01d2p', category: 'goingOut', difficulty: 1 },
  { id: 'go09', english: 'Hurry up!', chinese: '\u5feb\u70b9\uff01', phonetic: 'h\u01ce-r\u0113e \u01cep', category: 'goingOut', difficulty: 1 },
  { id: 'go10', english: 'Slow down.', chinese: '\u6162\u4e00\u70b9\u3002', phonetic: 'sl\u014d d\u0101on', category: 'goingOut', difficulty: 1 },

  // People & Family
  { id: 'pf01', english: 'This is my mom.', chinese: '\u8fd9\u662f\u6211\u5988\u5988\u3002', phonetic: 'th\u01d0s \u01d0z m\u0101i m\u01d2m', category: 'people', difficulty: 1 },
  { id: 'pf02', english: 'This is my dad.', chinese: '\u8fd9\u662f\u6211\u7238\u7238\u3002', phonetic: 'th\u01d0s \u01d0z m\u0101i d\u01ced', category: 'people', difficulty: 1 },
  { id: 'pf03', english: 'How are you?', chinese: '\u4f60\u597d\u5417\uff1f', phonetic: 'h\u0101o \u01d2r y\u014do', category: 'people', difficulty: 1 },
  { id: 'pf04', english: "I'm fine, thanks!", chinese: '\u6211\u5f88\u597d\uff0c\u8c22\u8c22\uff01', phonetic: '\u0101im f\u0101in th\u01ce\u014bks', category: 'people', difficulty: 1 },
  { id: 'pf05', english: 'Nice to meet you!', chinese: '\u5f88\u9ad8\u5174\u8ba4\u8bc6\u4f60\uff01', phonetic: 'n\u0101is t\u01d2o m\u0113et y\u014do', category: 'people', difficulty: 2 },
  { id: 'pf06', english: 'What is your name?', chinese: '\u4f60\u53eb\u4ec0\u4e48\u540d\u5b57\uff1f', phonetic: 'w\u01d2t \u01d0z y\u014dr n\u011bim', category: 'people', difficulty: 2 },
  { id: 'pf07', english: 'My name is...', chinese: '\u6211\u53eb\u2026\u2026', phonetic: 'm\u0101i n\u011bim \u01d0z', category: 'people', difficulty: 1 },
  { id: 'pf08', english: "Let's play together!", chinese: '\u4e00\u8d77\u73a9\u5427\uff01', phonetic: 'l\u011bts pl\u011bi t\u01d2o-g\u011b-th\u01d0r', category: 'people', difficulty: 2 },
  { id: 'pf09', english: "He's my friend.", chinese: '\u4ed6\u662f\u6211\u7684\u670b\u53cb\u3002', phonetic: 'h\u0113ez m\u0101i fr\u011bnd', category: 'people', difficulty: 2 },
  { id: 'pf10', english: "She's my sister.", chinese: '\u5979\u662f\u6211\u59d0\u59d0\u3002', phonetic: 'sh\u0113ez m\u0101i s\u01d0s-t\u01d0r', category: 'people', difficulty: 2 },

  // Time & Weather
  { id: 'tw01', english: 'What time is it?', chinese: '\u73b0\u5728\u51e0\u70b9\uff1f', phonetic: 'w\u01d2t t\u0101im \u01d0z \u01d0t', category: 'time', difficulty: 2 },
  { id: 'tw02', english: "It's raining.", chinese: '\u4e0b\u96e8\u4e86\u3002', phonetic: '\u01d0ts r\u011bi-n\u01d0\u014b', category: 'time', difficulty: 1 },
  { id: 'tw03', english: "It's sunny today.", chinese: '\u4eca\u5929\u662f\u6674\u5929\u3002', phonetic: '\u01d0ts s\u01ce-n\u0113e t\u01d2o-d\u011bi', category: 'time', difficulty: 2 },
  { id: 'tw04', english: "It's cold today.", chinese: '\u4eca\u5929\u5f88\u51b7\u3002', phonetic: '\u01d0ts k\u014dld t\u01d2o-d\u011bi', category: 'time', difficulty: 1 },
  { id: 'tw05', english: "It's hot today.", chinese: '\u4eca\u5929\u5f88\u70ed\u3002', phonetic: '\u01d0ts h\u01d2t t\u01d2o-d\u011bi', category: 'time', difficulty: 1 },
  { id: 'tw06', english: 'Today is Monday.', chinese: '\u4eca\u5929\u662f\u661f\u671f\u4e00\u3002', phonetic: 't\u01d2o-d\u011bi \u01d0z m\u01cen-d\u011bi', category: 'time', difficulty: 2 },
  { id: 'tw07', english: "It's snowing!", chinese: '\u4e0b\u96ea\u4e86\uff01', phonetic: '\u01d0ts sn\u014d-\u01d0\u014b', category: 'time', difficulty: 1 },
  { id: 'tw08', english: "It's windy.", chinese: '\u522e\u98ce\u4e86\u3002', phonetic: '\u01d0ts w\u01d0n-d\u0113e', category: 'time', difficulty: 1 },

  // Emergencies
  { id: 'em01', english: 'Help!', chinese: '\u6551\u547d\uff01', phonetic: 'h\u011blp', category: 'emergency', difficulty: 1 },
  { id: 'em02', english: 'I need a doctor.', chinese: '\u6211\u9700\u8981\u770b\u533b\u751f\u3002', phonetic: '\u0101i n\u0113ed \u01d0 d\u01d2k-t\u01d0r', category: 'emergency', difficulty: 2 },
  { id: 'em03', english: "I'm lost.", chinese: '\u6211\u8ff7\u8def\u4e86\u3002', phonetic: '\u0101im l\u01d2st', category: 'emergency', difficulty: 1 },
  { id: 'em04', english: 'Call the police!', chinese: '\u62a5\u8b66\uff01', phonetic: 'k\u01d2l th\u01d0 p\u01d2-l\u0113es', category: 'emergency', difficulty: 2 },
  { id: 'em05', english: 'It hurts here.', chinese: '\u8fd9\u91cc\u75bc\u3002', phonetic: '\u01d0t h\u01d0rts h\u0113er', category: 'emergency', difficulty: 2 },
  { id: 'em06', english: "I'm allergic to...", chinese: '\u6211\u5bf9\u2026\u2026\u8fc7\u654f\u3002', phonetic: '\u0101im \u01d0-l\u01d0r-j\u01d0k t\u014do', category: 'emergency', difficulty: 3 },
  { id: 'em07', english: 'Please help me.', chinese: '\u8bf7\u5e2e\u5e2e\u6211\u3002', phonetic: 'pl\u0113ez h\u011blp m\u0113e', category: 'emergency', difficulty: 1 },
  { id: 'em08', english: 'I need medicine.', chinese: '\u6211\u9700\u8981\u836f\u3002', phonetic: '\u0101i n\u0113ed m\u011b-d\u01d0-s\u01d0n', category: 'emergency', difficulty: 2 },
];

export const categoryOrder: PhraseCategory[] = [
  'greetings', 'feelings', 'house', 'food', 'goingOut', 'people', 'time', 'emergency',
];
