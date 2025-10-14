#!/usr/bin/env python3
"""
Fix OpenRouter API node in N8N workflow database
"""
import sqlite3
import json

DB_PATH = '/home/talab/sliderx-n8n/n8n-data/database.sqlite'
WORKFLOW_ID = 'zLACLcQHFRDMYDHK'

def fix_openrouter_node():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get current workflow
    cursor.execute("SELECT nodes FROM workflow_entity WHERE id = ?", (WORKFLOW_ID,))
    result = cursor.fetchone()

    if not result:
        print(f"Workflow {WORKFLOW_ID} not found!")
        return

    nodes = json.loads(result[0])

    # Find and fix OpenRouter API node
    for node in nodes:
        if node.get('name') == 'Call OpenRouter API':
            print(f"Found OpenRouter API node: {node['id']}")

            # Update the jsonBody parameter with correct expression
            old_body = node['parameters'].get('jsonBody', '')

            # Use proper N8N expression syntax with string concatenation
            new_body = '''={{ JSON.stringify({
  "model": "anthropic/claude-3.5-sonnet",
  "messages": [
    {"role": "system", "content": $json.systemPrompt},
    {"role": "user", "content": $json.userPrompt}
  ],
  "max_tokens": 3000,
  "temperature": 0.7
}) }}'''

            node['parameters']['jsonBody'] = new_body

            print(f"Old body: {old_body[:100]}...")
            print(f"New body: {new_body[:100]}...")
            break

    # Update workflow in database
    cursor.execute(
        "UPDATE workflow_entity SET nodes = ? WHERE id = ?",
        (json.dumps(nodes), WORKFLOW_ID)
    )

    conn.commit()
    conn.close()

    print(f"\n✅ Successfully updated OpenRouter API node in workflow {WORKFLOW_ID}")
    print("Please restart N8N to apply changes:")
    print("  docker-compose restart n8n")

if __name__ == "__main__":
    fix_openrouter_node()
