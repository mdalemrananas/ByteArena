import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Database connection parameters
# You can use either individual parameters or DATABASE_URL
DATABASE_URL = os.getenv("DATABASE_URL")

# Or individual parameters
USER = os.getenv("user", "postgres")
PASSWORD = os.getenv("password")
HOST = os.getenv("host", "db.gdajuzpzmwykuhrhowxn.supabase.co")
PORT = os.getenv("port", "5432")
DBNAME = os.getenv("dbname", "postgres")

def connect_to_database():
    """Connect to Supabase PostgreSQL database"""
    try:
        # Option 1: Use DATABASE_URL if available
        if DATABASE_URL:
            connection = psycopg2.connect(DATABASE_URL)
            print("Connection successful using DATABASE_URL!")
        else:
            # Option 2: Use individual parameters
            connection = psycopg2.connect(
                user=USER,
                password=PASSWORD,
                host=HOST,
                port=PORT,
                dbname=DBNAME
            )
            print("Connection successful using individual parameters!")
        
        return connection
        
    except Exception as e:
        print(f"Failed to connect: {e}")
        return None

def test_connection():
    """Test database connection and run a simple query"""
    connection = connect_to_database()
    
    if connection:
        try:
            # Create a cursor to execute SQL queries
            cursor = connection.cursor()
            
            # Test query - get current time
            cursor.execute("SELECT NOW();")
            result = cursor.fetchone()
            print("Current Time:", result[0])
            
            # Test query - list tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            print("\nTables in database:")
            for table in tables:
                print(f"- {table[0]}")
            
            # Test query - check if users table exists and show structure
            cursor.execute("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND table_schema = 'public'
                ORDER BY ordinal_position;
            """)
            columns = cursor.fetchall()
            
            if columns:
                print("\nUsers table structure:")
                for col in columns:
                    print(f"- {col[0]}: {col[1]} (nullable: {col[2]})")
            
            # Close the cursor and connection
            cursor.close()
            connection.close()
            print("\nConnection closed successfully.")
            
        except Exception as e:
            print(f"Error during database operations: {e}")
            if connection:
                connection.close()
    else:
        print("Could not establish database connection.")

if __name__ == "__main__":
    test_connection()
