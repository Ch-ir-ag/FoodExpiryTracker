import { HfInference } from '@huggingface/inference';

// Initialize the Hugging Face client
const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY);

// The Mistral model to use
const MODEL_ID = 'mistralai/Mistral-7B-Instruct-v0.2';

interface LlmExpiryPredictionResult {
  predictedExpiryDays: number;
  confidence: number;
  reasoning: string;
}

export class LlmExpiryService {
  /**
   * Use LLM to predict how long a product will last before expiring
   */
  static async predictExpiryDays(
    productName: string,
    additionalContext: {
      category?: string;
      store?: string;
      purchaseDate?: string;
      isRefrigerated?: boolean;
    } = {}
  ): Promise<LlmExpiryPredictionResult> {
    console.log(`🧠 LLM predicting expiry for: ${productName}`);
    
    try {
      // Create a prompt that gives the LLM context about the task
      const prompt = this.createPrompt(productName, additionalContext);
      
      // Call the Hugging Face API with the prompt
      const response = await hf.textGeneration({
        model: MODEL_ID,
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.3, // Lower temperature for more predictable outputs
          return_full_text: false,
        }
      });
      
      console.log(`✅ LLM Response: ${response.generated_text}`);
      
      // Parse the response to extract the predicted days
      const result = this.parseResponse(response.generated_text);
      
      return result;
    } catch (error) {
      console.error('Error calling LLM for expiry prediction:', error);
      // Fallback to a default value
      return {
        predictedExpiryDays: this.getDefaultExpiryDays(productName, additionalContext.category),
        confidence: 0.4,
        reasoning: 'Error when calling LLM, using fallback prediction.'
      };
    }
  }
  
  /**
   * Create a prompt for the LLM that describes the task and provides context
   */
  private static createPrompt(
    productName: string,
    context: {
      category?: string;
      store?: string;
      purchaseDate?: string;
      isRefrigerated?: boolean;
    }
  ): string {
    const currentDate = new Date().toISOString().split('T')[0];
    
    return `<s>[INST] You are an expert in food safety and shelf life prediction. I need you to predict how many days this product will last before expiring, starting from today (${currentDate}).

Product: ${productName}
${context.category ? `Category: ${context.category}` : ''}
${context.store ? `Store: ${context.store}` : ''}
${context.purchaseDate ? `Purchase Date: ${context.purchaseDate}` : ''}
${context.isRefrigerated !== undefined ? `Is Refrigerated: ${context.isRefrigerated}` : ''}

Based on this information, please:
1. Tell me how many days this product will typically last before expiring
2. Provide a brief explanation of your reasoning
3. Respond in this exact format:
DAYS: [number of days]
CONFIDENCE: [a number between 0-1]
REASONING: [brief explanation]

Only include these three lines in your response. [/INST]</s>`;
  }
  
  /**
   * Parse the LLM response to extract the predicted expiry days
   */
  private static parseResponse(response: string): LlmExpiryPredictionResult {
    try {
      // Extract days
      const daysMatch = response.match(/DAYS:\s*(\d+)/i);
      const days = daysMatch ? parseInt(daysMatch[1], 10) : null;
      
      // Extract confidence
      const confidenceMatch = response.match(/CONFIDENCE:\s*(0\.\d+|1\.0|1)/i);
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : null;
      
      // Extract reasoning
      const reasoningMatch = response.match(/REASONING:\s*(.*?)($|\n)/is);
      const reasoning = reasoningMatch ? reasoningMatch[1].trim() : null;
      
      // If any value couldn't be extracted, use fallback
      if (days === null || confidence === null || reasoning === null) {
        console.warn('Could not parse LLM response correctly:', response);
        return {
          predictedExpiryDays: 7, // Default fallback
          confidence: 0.5,
          reasoning: 'Could not parse LLM response, using default prediction.'
        };
      }
      
      return {
        predictedExpiryDays: days,
        confidence: confidence,
        reasoning: reasoning
      };
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      return {
        predictedExpiryDays: 7, // Default fallback
        confidence: 0.5,
        reasoning: 'Error parsing response, using default prediction.'
      };
    }
  }
  
  /**
   * Fallback method to get a default expiry days prediction if the LLM call fails
   */
  private static getDefaultExpiryDays(productName: string, category?: string): number {
    const productNameLower = productName.toLowerCase();
    
    // Basic fallback classification
    if (category) {
      const categoryLower = category.toLowerCase();
      if (categoryLower.includes('milk')) return 7;
      if (categoryLower.includes('bread')) return 5;
      if (categoryLower.includes('meat')) return 3;
      if (categoryLower.includes('vegetable')) return 7;
      if (categoryLower.includes('fruit')) return 7;
    }
    
    // Product name-based fallbacks
    if (productNameLower.includes('milk')) return 7;
    if (productNameLower.includes('bread')) return 5;
    if (productNameLower.includes('yogurt') || productNameLower.includes('yoghurt')) return 14;
    if (productNameLower.includes('cheese')) return 14;
    if (productNameLower.includes('meat')) return 3;
    if (productNameLower.includes('fish')) return 2;
    if (productNameLower.includes('chocolate')) return 180;
    if (productNameLower.includes('egg')) return 21;
    
    // Default fallback
    return 7;
  }
} 