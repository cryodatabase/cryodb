// lib/autocomplete.ts
import { JaroWinklerDistance } from 'natural';
import { storage } from '@/lib/database/storage';
import { CpaChemical } from '@/lib/database/schema';

export interface AutoCompleteResult {
  closest_match: string;
  autocomplete: string;
}

async function fetchSearchTerms(): Promise<string[]> {
  try {
    const chemicals: CpaChemical[] = await storage.getAllChemicals();
    const terms: string[] = [];

    chemicals.forEach((doc) => {
      if (doc.preferred_name) terms.push(doc.preferred_name);
      if (doc.synonyms && Array.isArray(doc.synonyms)) {
        terms.push(...doc.synonyms.filter(synonym => synonym && synonym.trim()));
      }
    });

    return [...new Set(terms)];

  } catch (err) {
    console.error('Error fetching search terms:', err);
    return [];
  }
}

async function autoComplete(input: string): Promise<AutoCompleteResult> {
  const searchTerms = await fetchSearchTerms();
  const inputLower = input.toLowerCase();
  let closestMatch = input;
  let highestSimilarity = 0;

  searchTerms.forEach(term => {
    const termLower = term.toLowerCase();
    const similarity = JaroWinklerDistance(termLower, inputLower); // Removed caseSensitive option
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      closestMatch = term; // Preserve original case for response
    }
  });

  const autocomplete = highestSimilarity > 0.8 && closestMatch.toLowerCase() !== inputLower ? closestMatch : '';

  return {
    closest_match: closestMatch,
    autocomplete,
  };
}

export default autoComplete;