#!/usr/bin/env python3
"""
Check N8N workflow status and provide import guidance
"""

import sqlite3
import json
from pathlib import Path

DB_PATH = "/home/talab/sliderx-n8n/n8n-data/database.sqlite"

def check_workflows():
    """Check what workflows exist in N8N database"""
    print("="*80)
    print("N8N Workflow Status")
    print("="*80)

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Get all workflows
        cursor.execute("""
            SELECT id, name, active, createdAt, updatedAt
            FROM workflow_entity
            ORDER BY updatedAt DESC
        """)

        workflows = cursor.fetchall()

        if not workflows:
            print("\n❌ No workflows found in database!")
            print("\nTo import workflows:")
            print("1. Open N8N UI: http://localhost:5678")
            print("2. Click 'Import from File'")
            print("3. Select: /home/talab/sliderx-n8n/workflows/stage2_complete_workflow.json")
            return

        print(f"\nFound {len(workflows)} workflow(s):\n")

        for wf in workflows:
            wf_id, name, active, created, updated = wf
            status = "✓ ACTIVE" if active else "✗ INACTIVE"
            print(f"{status} - {name}")
            print(f"  ID: {wf_id}")
            print(f"  Created: {created}")
            print(f"  Updated: {updated}")

            # Check for webhooks in this workflow
            cursor.execute("""
                SELECT id, webhookPath, method
                FROM webhook_entity
                WHERE workflowId = ?
            """, (wf_id,))

            webhooks = cursor.fetchall()
            if webhooks:
                print(f"  Webhooks:")
                for wh in webhooks:
                    wh_id, path, method = wh
                    print(f"    - {method} /webhook/{path}")
            print()

        # Check for Stage 2 specifically
        cursor.execute("""
            SELECT id, name, active
            FROM workflow_entity
            WHERE name LIKE '%Stage 2%' OR name LIKE '%stage2%'
        """)

        stage2 = cursor.fetchone()

        if stage2:
            wf_id, name, active = stage2
            if active:
                print("✓ Stage 2 workflow is ACTIVE and ready to use!")
            else:
                print("⚠ Stage 2 workflow exists but is INACTIVE")
                print("\nTo activate:")
                print("1. Open http://localhost:5678")
                print(f"2. Find workflow: {name}")
                print("3. Click the toggle to activate it")
        else:
            print("❌ No Stage 2 workflow found")
            print("\nTo import Stage 2 workflow:")
            print("1. Open N8N UI: http://localhost:5678")
            print("2. Click 'Add workflow' -> 'Import from File'")
            print("3. Select: workflows/stage2_complete_workflow.json")
            print("4. Configure credentials (AWS S3, OpenRouter)")
            print("5. Activate the workflow")

        conn.close()

    except Exception as e:
        print(f"\n❌ Error checking database: {e}")
        print("\nMake sure N8N is running and database is accessible")

if __name__ == '__main__':
    check_workflows()
