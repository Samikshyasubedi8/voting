# drop_tables.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nvote.settings')
django.setup()

from django.db import connection

print("Dropping all voting tables...")

with connection.cursor() as cursor:
    # Get all table names related to voting
    cursor.execute("""
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND (tablename LIKE 'voting_%' OR tablename LIKE 'django_%' OR tablename LIKE 'auth_%')
    """)
    
    tables = [row[0] for row in cursor.fetchall()]
    
    for table in tables:
        try:
            cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
            print(f"  Dropped: {table}")
        except:
            pass

print("\n✅ All tables dropped!")