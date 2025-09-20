import { StorageService } from './storage';
import { OpenAIService, ChatMessage } from './openai';
import { logger } from '../utils/logger';

export interface FileAnalysisResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  language: string;
  tokensUsed: number;
  processingTime: number;
}

export interface FileContentResult {
  fileName: string;
  originalName: string;
  content: string;
  size: number;
}

export class FileAnalysisService {
  private static instance: FileAnalysisService;
  private storageService: StorageService;
  private openAIService: OpenAIService;

  private constructor() {
    this.storageService = StorageService.getInstance();
    this.openAIService = OpenAIService.getInstance();
    logger.info('✅ File Analysis service initialized');
  }

  public static getInstance(): FileAnalysisService {
    if (!FileAnalysisService.instance) {
      FileAnalysisService.instance = new FileAnalysisService();
    }
    return FileAnalysisService.instance;
  }

  /**
   * Analyze a file's content using Azure OpenAI
   */
  public async analyzeFile(fileName: string, fileType: string = 'text'): Promise<FileAnalysisResult> {
    const startTime = Date.now();
    
    try {
      logger.info(`Analyzing file: ${fileName}`);
      
      // Step 1: Read file content from Azure Storage
      let fileContent: string;
      
      if (fileType === 'text' || fileType.includes('text')) {
        fileContent = await this.storageService.getFileContent(fileName);
      } else {
        // For binary files, we might need to convert or handle differently
        const fileStream = await this.storageService.getFileStream(fileName);
        // For this example, we'll assume text content
        fileContent = await this.streamToString(fileStream);
      }
      
      // Step 2: Truncate content if too large for AI processing
      const maxTokens = 10000; // Adjust based on your model's token limit
      const truncatedContent = this.truncateContentForTokens(fileContent, maxTokens);
      
      // Step 3: Analyze content with Azure OpenAI
      const analysis = await this.analyzeContentWithAI(truncatedContent, fileName);
      
      const processingTime = Date.now() - startTime;
      
      return {
        fileName,
        fileSize: fileContent.length,
        fileType,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        sentiment: analysis.sentiment,
        language: analysis.language,
        tokensUsed: analysis.tokensUsed,
        processingTime
      };
      
    } catch (error) {
      logger.error(`Failed to analyze file ${fileName}:`, error);
      throw new Error(`Failed to analyze file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze multiple files and compare them
   */
  public async compareFiles(fileNames: string[]): Promise<any> {
    try {
      logger.info(`Comparing ${fileNames.length} files`);
      
      // Analyze each file
      const analyses = await Promise.all(
        fileNames.map(async (fileName) => {
          return await this.analyzeFile(fileName);
        })
      );
      
      // Compare files using AI
      const comparison = await this.compareFilesWithAI(analyses);
      
      return {
        files: analyses,
        comparison
      };
      
    } catch (error) {
      logger.error('Failed to compare files:', error);
      throw new Error(`Failed to compare files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract specific information from a file using AI
   */
  public async extractInformation(fileName: string, extractionPrompt: string): Promise<string> {
    try {
      logger.info(`Extracting information from file: ${fileName}`);
      
      // Read file content
      const fileContent = await this.storageService.getFileContent(fileName);
      
      // Truncate if necessary
      const maxTokens = 8000;
      const truncatedContent = this.truncateContentForTokens(fileContent, maxTokens);
      
      // Extract information using AI
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are an expert at extracting specific information from documents. 
          Focus only on the requested information and provide concise, accurate responses.`
        },
        {
          role: 'user',
          content: `Document content:
${truncatedContent}

Requested extraction: ${extractionPrompt}

Please extract only the requested information from the document above.`
        }
      ];
      
      const response = await this.openAIService.getChatCompletion(messages, {
        maxTokens: 500,
        temperature: 0.3 // Low temperature for factual extraction
      });
      
      return response.content;
      
    } catch (error) {
      logger.error(`Failed to extract information from file ${fileName}:`, error);
      throw new Error(`Failed to extract information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract raw file content
   */
  public async extractFileContent(fileName: string, originalName: string): Promise<FileContentResult> {
    try {
      logger.info(`Extracting content from file: ${fileName}`);
      
      // Read file content
      const fileContent = await this.storageService.getFileContent(fileName);
      
      // Truncate if necessary (roughly 2000 tokens)
      const truncatedContent = this.truncateContentForTokens(fileContent, 2000);
      
      return {
        fileName,
        originalName,
        content: truncatedContent,
        size: fileContent.length
      };
      
    } catch (error) {
      logger.error(`Failed to extract content from file ${fileName}:`, error);
      // Return a fallback content instead of throwing an error
      return {
        fileName,
        originalName,
        content: `[Content not available for file: ${originalName}]`,
        size: 0
      };
    }
  }

  /**
   * Analyze content with Azure OpenAI
   */
  private async analyzeContentWithAI(content: string, fileName: string): Promise<any> {
    try {
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are an expert document analyzer. Analyze the provided document and provide:
1. A concise summary (2-3 sentences)
2. 3-5 key points from the document
3. Overall sentiment (positive, negative, or neutral)
4. Detected language

Format your response as JSON:
{
  "summary": "Concise summary here",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "sentiment": "positive|negative|neutral",
  "language": "English"
}`
        },
        {
          role: 'user',
          content: `Document: ${fileName}

Content:
${content}

Please analyze this document and respond in the specified JSON format.`
        }
      ];
      
      const response = await this.openAIService.getChatCompletion(messages, {
        maxTokens: 800,
        temperature: 0.5
      });
      
      // Try to parse JSON response
      try {
        const analysis = JSON.parse(response.content);
        return {
          ...analysis,
          tokensUsed: response.tokens
        };
      } catch (parseError) {
        // If JSON parsing fails, extract information from text response
        return this.extractAnalysisFromText(response.content, response.tokens);
      }
      
    } catch (error) {
      logger.error('AI analysis failed:', error);
      throw error;
    }
  }

  /**
   * Compare files using AI
   */
  private async compareFilesWithAI(analyses: FileAnalysisResult[]): Promise<any> {
    try {
      const fileSummaries = analyses.map(analysis => 
        `${analysis.fileName}: ${analysis.summary}`
      ).join('\n\n');
      
      const messages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are an expert at comparing documents. Analyze the provided document summaries and provide:
1. Similarities between the documents
2. Key differences between the documents
3. Which document seems most comprehensive
4. Any notable patterns or trends

Be concise and focus on the most important comparisons.`
        },
        {
          role: 'user',
          content: `Document Summaries:
${fileSummaries}

Please compare these documents and provide your analysis.`
        }
      ];
      
      const response = await this.openAIService.getChatCompletion(messages, {
        maxTokens: 600,
        temperature: 0.7
      });
      
      return response.content;
      
    } catch (error) {
      logger.error('AI comparison failed:', error);
      throw error;
    }
  }

  /**
   * Extract analysis from text response (fallback method)
   */
  private extractAnalysisFromText(text: string, tokens: number): any {
    // Simple extraction logic - in practice, you might want more sophisticated parsing
    return {
      summary: text.substring(0, 200) + '...',
      keyPoints: ['Analysis completed successfully'],
      sentiment: 'neutral',
      language: 'English',
      tokensUsed: tokens
    };
  }

  /**
   * Truncate content to fit within token limits
   */
  private truncateContentForTokens(content: string, maxTokens: number): string {
    // Rough approximation: 1 token ≈ 4 characters
    const maxChars = maxTokens * 4;
    
    if (content.length <= maxChars) {
      return content;
    }
    
    logger.warn(`Content truncated from ${content.length} to ${maxChars} characters`);
    return content.substring(0, maxChars);
  }

  /**
   * Convert stream to string
   */
  private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('error', reject);
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
  }
}