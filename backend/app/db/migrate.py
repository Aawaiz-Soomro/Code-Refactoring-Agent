import os
import psycopg
from app.config import settings

def run_migrations():
    # Find SQL path relative to this file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sql_path = os.path.abspath(os.path.join(current_dir, "..", "..", "sql", "001_init_vector_store.sql"))
    
    print(f"Reading migration file from: {sql_path}")
    if not os.path.exists(sql_path):
        raise FileNotFoundError(f"Migration file not found at {sql_path}")
        
    with open(sql_path, "r", encoding="utf-8") as f:
        sql = f.read()

    print("Connecting to Supabase PostgreSQL database...")
    try:
        with psycopg.connect(settings.DATABASE_URL) as conn:
            # We must enable autocommit or run outside a transaction block
            # because "CREATE INDEX CONCURRENTLY" or some statements like extension creation
            # can run better without transactional blocks, but vector/ HNSW index is fine.
            # Let's run the migration.
            with conn.cursor() as cur:
                print("Executing SQL migrations...")
                cur.execute(sql)
                conn.commit()
        print("✅ Migrations completed successfully!")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    run_migrations()
