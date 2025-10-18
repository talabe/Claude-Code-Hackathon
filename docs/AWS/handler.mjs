import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME;
const N8N_PHASE2_URL = process.env.N8N_PHASE2_URL || "";
const N8N_PHASE2_URL_TEST = process.env.N8N_PHASE2_URL_TEST || "";
const DEFAULT_STATUS_ON_REVIEW_UPDATE = "generating presentation";

const ALLOWED_STATUSES = new Set([
  "uploading",
  "processing",
  "action needed",
  "refining",
  "ready",
  "complete",
  "done",
  "failed",
  "retry",
  "ready for download",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type,x-user-id",
  "Access-Control-Allow-Methods": "OPTIONS,PUT,POST,GET",
};

export const handler = async (event) => {
  try {
    if (event.httpMethod === "OPTIONS") {
      return { statusCode: 204, headers: corsHeaders, body: "" };
    }
    if (!["PUT", "POST"].includes(event.httpMethod)) {
      return resp(405, { error: "Method Not Allowed" });
    }

    const userId =
      event.requestContext?.authorizer?.claims?.sub ||
      event.headers?.["x-user-id"] ||
      event.headers?.["X-User-Id"] ||
      null;
    const projectId = event.pathParameters?.projectId;

    if (!TABLE_NAME)
      return resp(500, { error: "Server misconfigured: TABLE_NAME" });
    if (!userId)
      return resp(400, {
        error: "Missing userId (use Cognito or X-User-Id header)",
      });
    if (!projectId) return resp(400, { error: "Missing projectId path param" });

    const body = safeJson(event.body || "{}");

    const hasReview = Array.isArray(body.reviewAndRefine);
    const hasStatus =
      typeof body.status === "string" && body.status.trim().length > 0;

    if (!hasReview && !hasStatus) {
      return resp(400, {
        error: "Provide reviewAndRefine (array) and/or status (string)",
      });
    }

    if (hasReview) {
      const bad = body.reviewAndRefine.find(
        (q) =>
          !q ||
          typeof q.id !== "string" ||
          typeof q.type !== "string" ||
          typeof q.label !== "string"
      );
      if (bad)
        return resp(422, {
          error: "Each question in reviewAndRefine requires id, type, label",
        });
    }

    let nextStatus = hasStatus ? String(body.status).trim() : null;
    if (nextStatus && !ALLOWED_STATUSES.has(nextStatus)) {
      return resp(422, {
        error: `Invalid status '${nextStatus}'`,
        allowed: Array.from(ALLOWED_STATUSES),
      });
    }

    if (hasReview && !nextStatus && DEFAULT_STATUS_ON_REVIEW_UPDATE) {
      nextStatus = DEFAULT_STATUS_ON_REVIEW_UPDATE;
    }

    const PK = `USER#${userId}`;
    const SK = `PROJ#${projectId}`;

    const names = { "#updatedAt": "updatedAt" };
    const values = { ":now": Date.now() };
    const sets = ["#updatedAt = :now"];

    if (hasReview) {
      names["#rar"] = "reviewAndRefine";
      values[":rar"] = body.reviewAndRefine;
      sets.push("#rar = :rar");
    }
    if (nextStatus) {
      names["#status"] = "status";
      values[":status"] = nextStatus;
      sets.push("#status = :status");
    }

    const UpdateExpression = `SET ${sets.join(", ")}`;

    await ddb.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK, SK },
        UpdateExpression,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
        ConditionExpression: "attribute_exists(PK) AND attribute_exists(SK)",
      })
    );

    let forwardedToN8n = false;
    if (hasReview && N8N_PHASE2_URL) {
      const getRes = await ddb.send(
        new GetCommand({
          TableName: TABLE_NAME,
          Key: { PK, SK },
          ConsistentRead: true,
        })
      );
      if (!getRes.Item)
        return resp(404, { error: "Project not found after update" });

      const n8nRes = await fetch(
        userId === "test-vitor" ? N8N_PHASE2_URL_TEST : N8N_PHASE2_URL,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(getRes.Item),
        }
      );

      if (!n8nRes.ok) {
        const text = await n8nRes.text().catch(() => "");
        return resp(502, {
          error: "n8n phase2 call failed",
          status: n8nRes.status,
          body: text,
        });
      }
      forwardedToN8n = true;
    }

    return resp(200, {
      ok: true,
      projectId,
      updated: {
        reviewAndRefine: !!hasReview,
        status: nextStatus ?? undefined,
      },
      forwardedToN8n,
      method: event.httpMethod,
    });
  } catch (err) {
    console.error("Unhandled error:", err);
    if (err?.name === "ConditionalCheckFailedException") {
      return resp(404, { error: "Project not found" });
    }
    return resp(500, {
      error: "Internal server error",
      details: err?.message ?? String(err),
    });
  }
};

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
function resp(statusCode, obj) {
  return { statusCode, headers: corsHeaders, body: JSON.stringify(obj) };
}
