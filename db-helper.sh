#!/bin/bash

# Database Connection Helper Script
# Usage: ./db-helper.sh [local|production] [command]

# Function to export table to CSV
export_table_to_csv() {
    local table_name="$1"
    local db_path="$2"
    local datetime=$(date +"%Y%m%d_%H%M%S")
    local csv_file="${table_name}_${datetime}.csv"
    
    echo "📊 Exporting table '$table_name' to CSV..."
    echo "📁 File: $csv_file"
    
    # Export to CSV with headers
    sqlite3 -header -csv "$db_path" "SELECT * FROM $table_name;" > "$csv_file"
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully exported to: $csv_file"
        echo "📈 File size: $(du -h "$csv_file" | cut -f1)"
    else
        echo "❌ Failed to export table to CSV"
        return 1
    fi
}

# Function to list all rows in a table
list_table_rows() {
    local table_name="$1"
    local db_path="$2"
    
    # Check if table exists
    if ! sqlite3 "$db_path" "SELECT name FROM sqlite_master WHERE type='table' AND name='$table_name';" | grep -q "$table_name"; then
        echo "❌ Table '$table_name' does not exist"
        echo "💡 Available tables:"
        sqlite3 "$db_path" '.tables'
        return 1
    fi
    
    # Get row count
    local row_count=$(sqlite3 "$db_path" "SELECT COUNT(*) FROM $table_name;")
    
    echo "📊 Table: $table_name"
    echo "📈 Total rows: $row_count"
    echo ""
    
    if [ "$row_count" -gt 100 ]; then
        echo "⚠️  This table has more than 100 rows ($row_count rows)"
        echo "💡 Would you like to export to CSV instead? (y/n)"
        read -r response
        
        if [[ "$response" =~ ^[Yy]$ ]]; then
            export_table_to_csv "$table_name" "$db_path"
        else
            echo "📋 Showing first 100 rows:"
            sqlite3 -header -column "$db_path" "SELECT * FROM $table_name LIMIT 100;"
            echo ""
            echo "💡 To see all rows, use: ./db-helper.sh local 'SELECT * FROM $table_name;'"
        fi
    else
        echo "📋 All rows:"
        sqlite3 -header -column "$db_path" "SELECT * FROM $table_name;"
    fi
}

case "$1" in
  "local")
    echo "🗄️  Connecting to LOCAL SQLite database..."
    echo "📁 Database location: $(pwd)/data/local.db"
    echo ""
    echo "Available commands:"
    echo "  sqlite3 data/local.db                    # Interactive SQLite shell"
    echo "  sqlite3 data/local.db '.tables'          # List tables"
    echo "  sqlite3 data/local.db 'SELECT * FROM records LIMIT 5;'  # Sample query"
    echo ""
    
    if [ -n "$2" ]; then
      case "$2" in
        "tables")
          sqlite3 data/local.db '.tables'
          ;;
        "count")
          sqlite3 data/local.db 'SELECT "records" as table_name, COUNT(*) as count FROM records UNION SELECT "users", COUNT(*) FROM users UNION SELECT "companies", COUNT(*) FROM companies UNION SELECT "email_logs", COUNT(*) FROM email_logs UNION SELECT "email_templates", COUNT(*) FROM email_templates;'
          ;;
        "sample")
          sqlite3 data/local.db 'SELECT * FROM records LIMIT 3;'
          ;;
        "list")
          if [ -n "$3" ]; then
            list_table_rows "$3" "data/local.db"
          else
            echo "❌ Please specify a table name"
            echo "💡 Usage: ./db-helper.sh local list <table_name>"
            echo "💡 Available tables:"
            sqlite3 data/local.db '.tables'
          fi
          ;;
        *)
          sqlite3 data/local.db "$2"
          ;;
      esac
    else
      echo "💡 Tip: Run './db-helper.sh local tables' to see all tables"
      echo "💡 Tip: Run './db-helper.sh local count' to see record counts"
      echo "💡 Tip: Run './db-helper.sh local sample' to see sample data"
      echo "💡 Tip: Run './db-helper.sh local list <table>' to list all rows in a table"
    fi
    ;;
    
  "production")
    echo "☁️  Connecting to PRODUCTION Azure MySQL database..."
    echo "🔐 Using Azure Key Vault for credentials..."
    echo ""
    
    if command -v node &> /dev/null; then
      node connect-production-db.js
    else
      echo "❌ Node.js not found. Please install Node.js to connect to production database."
      echo "💡 Alternative: Use Azure Data Studio or MySQL Workbench with these settings:"
      echo "   Host: hypertec-renewals-mysql.mysql.database.azure.com"
      echo "   Port: 3306"
      echo "   Database: hypertec_renewals"
      echo "   Username: hypertec_admin"
      echo "   Password: [Retrieved from Azure Key Vault]"
    fi
    ;;
    
  "help"|"")
    echo "🗄️  Database Connection Helper"
    echo ""
    echo "Usage: ./db-helper.sh [local|production] [command]"
    echo ""
    echo "LOCAL DATABASE (SQLite):"
    echo "  ./db-helper.sh local                    # Show help"
    echo "  ./db-helper.sh local tables             # List all tables"
    echo "  ./db-helper.sh local count              # Show record counts"
    echo "  ./db-helper.sh local sample             # Show sample data"
    echo "  ./db-helper.sh local list <table>       # List all rows in a table"
    echo "  ./db-helper.sh local 'SELECT * FROM records;'  # Custom query"
    echo ""
    echo "PRODUCTION DATABASE (Azure MySQL):"
    echo "  ./db-helper.sh production               # Connect and show info"
    echo ""
    echo "EXAMPLES:"
    echo "  ./db-helper.sh local tables"
    echo "  ./db-helper.sh local list records"
    echo "  ./db-helper.sh local list companies"
    echo "  ./db-helper.sh local 'SELECT COUNT(*) FROM records;'"
    echo "  ./db-helper.sh production"
    echo ""
    echo "📊 CSV EXPORT:"
    echo "  When listing tables with >100 rows, you'll be prompted to export to CSV"
    echo "  CSV files are named: <table-name>_<datetime>.csv"
    ;;
    
  *)
    echo "❌ Unknown option: $1"
    echo "💡 Run './db-helper.sh help' for usage information"
    ;;
esac
