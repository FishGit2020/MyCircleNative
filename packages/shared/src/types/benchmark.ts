export interface BenchmarkEndpoint {
  id: string;
  name: string;
  url: string;
  model: string;
  provider: 'openai' | 'anthropic' | 'ollama' | 'custom';
}

export interface BenchmarkResult {
  endpointId: string;
  endpointName: string;
  model: string;
  prompt: string;
  response: string;
  tokensUsed: number;
  timeToFirstToken: number;
  totalTime: number;
  tokensPerSecond: number;
  success: boolean;
  error?: string;
}

export interface BenchmarkRun {
  id: string;
  timestamp: number;
  prompt: string;
  results: BenchmarkResult[];
  totalEndpoints: number;
  completedEndpoints: number;
}
