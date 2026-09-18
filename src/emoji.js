const SERVICE_RULES = [
  [/маникюр|ногт|гель-лак|покрыти/i, '💅'],
  [/педикюр/i, '🦶'],
  [/стрижк|укладк|волос/i, '💇'],
  [/окраш|тонир|балаяж|мелирован/i, '🎨'],
  [/бров|ресниц|ламинир/i, '👁️'],
  [/макияж|визаж/i, '💄'],
  [/массаж/i, '💆'],
  [/эпиляц|шугаринг|воск/i, '✨'],
  [/спа|spa/i, '🧖'],
  [/лиц|космето/i, '🧴'],
];

const MASTER_RULES = [
  [/маникюр/i, '💅'],
  [/педикюр/i, '🦶'],
  [/парикмахер|стилист|колорист/i, '💇'],
  [/бров|ресниц/i, '👁️'],
  [/визаж|макияж/i, '💄'],
  [/массаж/i, '💆'],
  [/космето/i, '🧴'],
];

function matchEmoji(rules, text) {
  const found = rules.find(([re]) => re.test(text || ''));
  return found ? found[1] : '💖';
}

export function serviceEmoji(name) { return matchEmoji(SERVICE_RULES, name); }
export function masterEmoji(specialization) { return matchEmoji(MASTER_RULES, specialization); }
