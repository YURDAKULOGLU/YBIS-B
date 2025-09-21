import { z } from 'zod';
import { ToolSchemas, ToolAction, ToolInputFor, ToolOutput } from './schemas';
import { UserContext, ToolResult } from './types';

// Provider interface
export interface ToolProvider<T extends ToolAction> {
  execute(input: ToolInputFor<T>, context: UserContext): Promise<ToolResult>;
  validate?(input: unknown): ToolInputFor<T>;
}

// Registry class
class ToolRegistry {
  private providers = new Map<ToolAction, ToolProvider<any>>();

  registerProvider<T extends ToolAction>(
    action: T,
    provider: ToolProvider<T>
  ): void {
    this.providers.set(action, provider);
  }

  getProvider<T extends ToolAction>(action: T): ToolProvider<T> | null {
    return this.providers.get(action) || null;
  }

  hasProvider(action: ToolAction): boolean {
    return this.providers.has(action);
  }

  getSchema(action: ToolAction): z.ZodSchema | null {
    return ToolSchemas[action] || null;
  }

  validateInput<T extends ToolAction>(
    action: T,
    input: unknown
  ): ToolInputFor<T> {
    const schema = this.getSchema(action);
    if (!schema) {
      throw new Error(`No schema found for action: ${action}`);
    }
    return schema.parse(input) as ToolInputFor<T>;
  }

  async executeAction<T extends ToolAction>(
    action: T,
    input: unknown,
    context: UserContext
  ): Promise<ToolResult> {
    // Validate input
    const validatedInput = this.validateInput(action, input);
    
    // Get provider
    const provider = this.getProvider(action);
    if (!provider) {
      return {
        success: false,
        message: `No provider registered for action: ${action}`,
        clarificationNeeded: false,
      };
    }

    try {
      const startTime = Date.now();
      const result = await provider.execute(validatedInput, context);
      const elapsedMs = Date.now() - startTime;
      
      return {
        ...result,
        elapsedMs,
      };
    } catch (error) {
      console.error(`Tool execution error for ${action}:`, error);
      return {
        success: false,
        message: `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        clarificationNeeded: false,
      };
    }
  }

  listActions(): ToolAction[] {
    return Array.from(this.providers.keys());
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();

// Convenience exports
export const registerProvider = <T extends ToolAction>(
  action: T,
  provider: ToolProvider<T>
) => toolRegistry.registerProvider(action, provider);

export const getProvider = <T extends ToolAction>(action: T) =>
  toolRegistry.getProvider(action);

export const executeAction = <T extends ToolAction>(
  action: T,
  input: unknown,
  context: UserContext
) => toolRegistry.executeAction(action, input, context);

// Type-safe action execution helper
export async function safeExecuteAction<T extends ToolAction>(
  action: T,
  input: ToolInputFor<T>,
  context: UserContext
): Promise<ToolResult> {
  return toolRegistry.executeAction(action, input, context);
}