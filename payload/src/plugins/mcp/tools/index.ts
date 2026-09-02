import type { MCPPluginConfig } from '@payloadcms/plugin-mcp';
import { getPageOutline } from '@/plugins/mcp/tools/getPageOutline';
import { getSection } from '@/plugins/mcp/tools/getSection';
import { listConferences } from '@/plugins/mcp/tools/listConferences';
import { updateSection } from '@/plugins/mcp/tools/updateSection';

type McpTool = NonNullable<NonNullable<MCPPluginConfig['mcp']>['tools']>[number];

export const mcpTools: McpTool[] = [listConferences, getPageOutline, getSection, updateSection];

// A custom tool is off unless the caller's access settings name it.
export const MCP_TOOL_NAMES = Object.fromEntries(mcpTools.map((tool) => [tool.name, true]));
