export function hasUnverifiedNumber(reply: string): boolean {
  return /[\p{Nd}\p{Sc}]|\b(?:euro(?:s)?|eur|usd|gbp|cent(?:s)?|dollars?|pond(?:en)?|pounds?|centavos?|céntimos?)\b/iu.test(reply);
}
