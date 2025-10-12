#!/usr/bin/env python3
"""
Debug specific N8N execution by ID
"""

import sqlite3
import json
import sys
from datetime import datetime

DB_PATH = "/home/talab/sliderx-n8n/n8n-data/database.sqlite"

def debug_execution(execution_id):
    """Get detailed information about a specific execution"""

    print("="*80)
    print(f"N8N Execution Debug - ID: {execution_id}")
    print("="*80)

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Get execution details
        cursor.execute("""
            SELECT id, workflowId, finished, mode, startedAt, stoppedAt,
                   status, data
            FROM execution_entity
            WHERE id = ?
        """, (execution_id,))

        result = cursor.fetchone()

        if not result:
            print(f"\n❌ Execution {execution_id} not found in database")
            print("\nAvailable recent executions:")

            cursor.execute("""
                SELECT id, workflowId, status, startedAt
                FROM execution_entity
                ORDER BY startedAt DESC
                LIMIT 20
            """)

            for row in cursor.fetchall():
                exec_id, wf_id, status, started = row
                print(f"  - Execution {exec_id}: Status={status}, Started={started}")

            return

        exec_id, wf_id, finished, mode, started, stopped, status, data = result

        # Get workflow name
        cursor.execute("""
            SELECT name FROM workflow_entity WHERE id = ?
        """, (wf_id,))

        wf_name = cursor.fetchone()
        wf_name = wf_name[0] if wf_name else "Unknown"

        print(f"\n📋 Execution Information:")
        print(f"  Execution ID: {exec_id}")
        print(f"  Workflow: {wf_name}")
        print(f"  Workflow ID: {wf_id}")
        print(f"  Status: {status}")
        print(f"  Mode: {mode}")
        print(f"  Started: {started}")
        print(f"  Stopped: {stopped}")
        print(f"  Finished: {'Yes' if finished else 'No'}")

        # Parse execution data
        if data:
            try:
                exec_data = json.loads(data)

                print(f"\n🔍 Execution Data:")

                # Get result data
                if 'resultData' in exec_data:
                    result_data = exec_data['resultData']

                    if 'error' in result_data:
                        error = result_data['error']
                        print(f"\n❌ ERROR FOUND:")
                        print(f"  Message: {error.get('message', 'N/A')}")
                        print(f"  Node: {error.get('node', {}).get('name', 'N/A')}")
                        if 'stack' in error:
                            print(f"  Stack trace:")
                            print(f"    {error['stack'][:500]}")

                    if 'runData' in result_data:
                        run_data = result_data['runData']
                        print(f"\n📊 Node Execution Summary:")

                        for node_name, executions in run_data.items():
                            if executions:
                                latest_exec = executions[-1]
                                start_time = latest_exec.get('startTime', 0)
                                execution_time = latest_exec.get('executionTime', 0)

                                error_msg = ""
                                if 'error' in latest_exec:
                                    error_msg = f" ❌ ERROR: {latest_exec['error'].get('message', 'Unknown')}"

                                data_count = len(latest_exec.get('data', {}).get('main', [[]])[0])

                                print(f"\n  {node_name}:")
                                print(f"    Time: {execution_time}ms")
                                print(f"    Data items: {data_count}")
                                if error_msg:
                                    print(f"    {error_msg}")

                                # Show output data preview for last node
                                if 'data' in latest_exec and 'main' in latest_exec['data']:
                                    main_data = latest_exec['data']['main']
                                    if main_data and main_data[0]:
                                        first_item = main_data[0][0]
                                        if 'json' in first_item:
                                            print(f"    Output preview:")
                                            json_str = json.dumps(first_item['json'], indent=6)[:300]
                                            print(f"      {json_str}...")

                # Check for lastNodeExecuted
                if 'lastNodeExecuted' in exec_data:
                    print(f"\n⚠️  Last Node Executed: {exec_data['lastNodeExecuted']}")

            except json.JSONDecodeError as e:
                print(f"\n⚠️  Could not parse execution data: {e}")

        # Check for related errors in event log
        print(f"\n📝 Related Event Log Entries:")

        import subprocess
        result = subprocess.run(
            ['docker', 'exec', 'sliderx-n8n', 'grep', f'"executionId":"{execution_id}"',
             '/home/node/.n8n/n8nEventLog.log'],
            capture_output=True,
            text=True
        )

        if result.stdout:
            events = result.stdout.strip().split('\n')
            for event in events[-10:]:  # Last 10 events
                try:
                    event_data = json.loads(event)
                    event_name = event_data.get('eventName', 'unknown')
                    payload = event_data.get('payload', {})

                    if event_name == 'n8n.workflow.failed':
                        print(f"\n  ❌ Workflow Failed:")
                        print(f"     Last Node: {payload.get('lastNodeExecuted', 'N/A')}")
                        print(f"     Error: {payload.get('errorMessage', 'N/A')}")
                    elif event_name == 'n8n.node.finished':
                        print(f"  ✓ Node Finished: {payload.get('nodeName', 'N/A')}")
                    elif event_name == 'n8n.workflow.started':
                        print(f"  ▶ Workflow Started")
                except:
                    pass

        conn.close()

        print("\n" + "="*80)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 debug_execution.py <execution_id>")
        print("\nExample: python3 debug_execution.py 111")
        sys.exit(1)

    execution_id = sys.argv[1]
    debug_execution(execution_id)
