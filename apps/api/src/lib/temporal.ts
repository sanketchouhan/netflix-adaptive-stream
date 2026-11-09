import { Connection, Client } from "@temporalio/client";
import { config } from "../config";

import { PROCESS_VIDEO_WORKFLOW } from "@adaptive-streaming/shared";

let client: Client | null = null;

export async function getTemporalClient() {
  if (client) return client;

  const connection = await Connection.connect({
    address: config.temporalAddress,
  });

  client = new Client({
    connection,
  });

  return client;
}

export async function startVideoProcessingWorkflow(
  videoId: string,
  inputRelativePath: string,
  outputRelativePath: string,
) {
  const client = await getTemporalClient();
  const workflow = await client.workflow.start(PROCESS_VIDEO_WORKFLOW, {
    taskQueue: config.temporalTaskQueue,
    workflowId: `process-video-${videoId}`,
    args: [{ videoId, inputRelativePath, outputRelativePath }],
  });

  return workflow.workflowId;
}
