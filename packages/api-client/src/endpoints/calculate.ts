import { YBISApiClient } from '../client';
import { ApiResponse, CalculateRequest } from '../types';

export class CalculateEndpoints {
  constructor(private client: YBISApiClient) {}

  public async calculate(request: CalculateRequest): Promise<ApiResponse<any>> {
    return this.client.post('/api/calculate', request);
  }

  public async evaluateExpression(expression: string, precision?: number): Promise<ApiResponse<any>> {
    return this.client.post('/api/calculate', {
      expression,
      precision,
    });
  }

  public async convertUnits(value: number, fromUnit: string, toUnit: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/calculate/convert', {
      value,
      fromUnit,
      toUnit,
    });
  }

  public async solveEquation(equation: string): Promise<ApiResponse<any>> {
    return this.client.post('/api/calculate/solve', { equation });
  }

  public async getConstants(): Promise<ApiResponse<Record<string, number>>> {
    return this.client.get('/api/calculate/constants');
  }

  public async getFunctions(): Promise<ApiResponse<string[]>> {
    return this.client.get('/api/calculate/functions');
  }

  public async getSupportedUnits(): Promise<ApiResponse<Record<string, string[]>>> {
    return this.client.get('/api/calculate/units');
  }
}