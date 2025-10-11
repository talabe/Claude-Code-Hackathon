#!/usr/bin/env python3
"""
S3 Browser Script
Browse and list files in your SlideRx S3 bucket
"""

import boto3
import sys
from datetime import datetime

def format_size(size_bytes):
    """Convert bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024.0:
            return f"{size_bytes:.2f} {unit}"
        size_bytes /= 1024.0
    return f"{size_bytes:.2f} TB"

def browse_s3(bucket_name='sliderx-uploads-dev', prefix='', region='eu-central-1'):
    """Browse S3 bucket contents"""
    try:
        # Create S3 client
        s3 = boto3.client('s3', region_name=region)

        print(f"\n📦 Browsing bucket: {bucket_name}")
        if prefix:
            print(f"📁 Prefix: {prefix}")
        print("-" * 80)

        # List objects
        paginator = s3.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(Bucket=bucket_name, Prefix=prefix)

        total_files = 0
        total_size = 0

        for page in page_iterator:
            if 'Contents' not in page:
                print("No files found.")
                return

            for obj in page['Contents']:
                key = obj['Key']
                size = obj['Size']
                modified = obj['LastModified']

                total_files += 1
                total_size += size

                # Format the output
                print(f"{modified.strftime('%Y-%m-%d %H:%M:%S')} | "
                      f"{format_size(size):>12} | {key}")

        print("-" * 80)
        print(f"Total: {total_files} files, {format_size(total_size)}")

    except boto3.exceptions.Boto3Error as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        sys.exit(1)

def main():
    """Main function with command line argument support"""
    bucket = 'sliderx-uploads-dev'
    prefix = ''

    if len(sys.argv) > 1:
        prefix = sys.argv[1]

    if len(sys.argv) > 2:
        bucket = sys.argv[2]

    browse_s3(bucket, prefix)

if __name__ == "__main__":
    main()
