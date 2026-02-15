import type { LLMProvider } from "./types";
import { ClaudeProvider } from "./claude";

const providers: Record<string, () => LLMProvider> = {
  claude: () => new ClaudeProvider(),
};

export function getLLMProvider(providerName = "claude"): LLMProvider {
  const factory = providers[providerName];
  if (!factory) {
    return new ClaudeProvider();
  }
  return factory();
}
