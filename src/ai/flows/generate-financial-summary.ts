'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating financial summaries.
 *
 * - generateFinancialSummary -  Generates a summary of financial performance using AI.
 * - GenerateFinancialSummaryInput - The input type for the generateFinancialSummary function.
 * - GenerateFinancialSummaryOutput - The return type for the generateFinancialSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFinancialSummaryInputSchema = z.object({
  revenue: z.number().describe('The total revenue from all sources.'),
  profit: z.number().describe('The total profit after expenses.'),
  margin: z.number().describe('The profit margin as a percentage of revenue.'),
  transactionData: z.string().describe('Detailed transaction data in JSON format.'),
});
export type GenerateFinancialSummaryInput = z.infer<typeof GenerateFinancialSummaryInputSchema>;

const GenerateFinancialSummaryOutputSchema = z.object({
  summary: z.string().describe('An AI-generated summary of the financial performance.'),
});
export type GenerateFinancialSummaryOutput = z.infer<typeof GenerateFinancialSummaryOutputSchema>;

export async function generateFinancialSummary(input: GenerateFinancialSummaryInput): Promise<GenerateFinancialSummaryOutput> {
  return generateFinancialSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFinancialSummaryPrompt',
  input: {schema: GenerateFinancialSummaryInputSchema},
  output: {schema: GenerateFinancialSummaryOutputSchema},
  prompt: `You are an expert financial analyst. Based on the following data, generate a concise and informative summary of the financial performance.

Revenue: {{revenue}}
Profit: {{profit}}
Margin: {{margin}}%
Transaction Data: {{transactionData}}

Summary:`, 
});

const generateFinancialSummaryFlow = ai.defineFlow(
  {
    name: 'generateFinancialSummaryFlow',
    inputSchema: GenerateFinancialSummaryInputSchema,
    outputSchema: GenerateFinancialSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
